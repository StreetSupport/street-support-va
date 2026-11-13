"""One PR, one route: check a pull request's labels against what it contains.

Rules (governance/pre_pr_check.md, "One PR, one route"):
  1. The PR carries a route: `record`, or at least one review label.
  2. `record` is never combined with a review label.
  3. A `record` PR contains no code that runs, since records are merged without review.
     Code in a PR labelled `doctrine` only is reported, not failed: it is reviewed with
     the doctrine, but may need `consequential` too.
  4. A `record` PR based on a branch other than the default branch is reported,
     not failed: it may depend on the part under review.

Usage:
  python scripts/pr_route_check.py --labels a,b --base BRANCH --default BRANCH --files FILE
  python scripts/pr_route_check.py --github     (inside GitHub Actions, reads the event)
  python scripts/pr_route_check.py --sweep      (inside GitHub Actions: every open PR,
                                                 each result set as a commit status)
Exit code 1 when a rule fails, except in --sweep, which reports through the statuses.
A pull_request workflow runs only where the PR's base carries the workflow, which
stacked PRs often do not; the sweep runs from the default branch, so it reaches them.
"""
import argparse
import json
import os
import re
import subprocess
import sys

REVIEW = {'safeguarding', 'platform', 'consequential', 'doctrine'}
RECORD = 'record'

# Code that runs. Frozen copies of scripts inside run folders are records, so the
# pipeline's baseline and run folders are not code. Its gate code, the code the
# builder loads, and the live builders that produce the handover file are
# (technical lead, #203, 12 November 2026). Root-level config such as next.config.*,
# and middleware.ts, runs too (VA #43, 12 November 2026).
SF = r'^governance/assurance/source_first/'
CODE = [
    r'^scripts/.*\.(py|ps1|sh|js|ts)$',
    r'^tests/',
    SF + r'(baseline_gates|determination_carriage_gate|sweeps|safety_controls)/.*\.py$',
    SF + r'v4_carry_over_working_records_[^/]+/.*\.py$',
    r'^lib/', r'^app/', r'^components/', r'^__tests__/',
    r'^\.github/',
    r'^package(-lock)?\.json$',
    r'^tsconfig\.json$',
    r'^[^/]+\.(py|ps1|sh|js|mjs|cjs|ts|tsx)$',
]


def is_code(path):
    return any(re.search(p, path) for p in CODE)


def check(labels, base, default, files):
    labels = set(labels)
    review = labels & REVIEW
    fails, notes = [], []
    if RECORD not in labels and not review:
        fails.append('No route label: add `record`, or one or more of '
                     + ', '.join(f'`{l}`' for l in sorted(REVIEW)) + '.')
    if RECORD in labels and review:
        fails.append('`record` is combined with ' + ', '.join(f'`{l}`' for l in sorted(review))
                     + '. Split the record part into its own PR stacked on this one.')
    code = sorted(f for f in files if is_code(f))
    shown = ', '.join(f'`{f}`' for f in code[:5]) + (' and more' if len(code) > 5 else '')
    if code and RECORD in labels:
        fails.append(f'Labelled `record` but contains code that runs: {shown}. '
                     'Records merge without review, so move the code to its own PR.')
    elif code and review == {'doctrine'}:
        notes.append(f'Labelled `doctrine` only but contains code that runs: {shown}. '
                     'Add `consequential` if it is builder or gate code.')
    if RECORD in labels and base != default:
        notes.append(f'`record` PR based on `{base}`, not `{default}`. Fine if it depends '
                     'on the PR below; otherwise base it on the default branch.')
    return fails, notes


def gh(*args):
    return subprocess.run(['gh', 'api', *args], capture_output=True, text=True, check=True).stdout


def files_of(repo, number):
    out = gh('--paginate', f'repos/{repo}/pulls/{number}/files', '--jq', '.[].filename')
    return [l for l in out.splitlines() if l]


CONTEXT = 'pr-route-check'


def current_status(repo, sha):
    """The pr-route-check status already on the commit, as (state, description), or None."""
    for s in json.loads(gh(f'repos/{repo}/commits/{sha}/status'))['statuses']:
        if s['context'] == CONTEXT:
            return s['state'], s['description']
    return None


def sweep():
    """Every open PR. A status is posted only where it differs from the one already on the
    head, since GitHub allows 1,000 statuses per commit and context; a PR that errors is
    reported and the sweep carries on (technical lead, #203, 12 November 2026)."""
    repo = os.environ['GITHUB_REPOSITORY']
    default = json.loads(gh(f'repos/{repo}'))['default_branch']
    prs = json.loads(gh('--paginate', '--slurp', f'repos/{repo}/pulls?state=open&per_page=100'))
    prs = [p for page in prs for p in page]
    failed, errors = 0, []
    for pr in prs:
        try:
            fails, notes = check([l['name'] for l in pr['labels']], pr['base']['ref'], default,
                                 files_of(repo, pr['number']))
            state = 'failure' if fails else 'success'
            text = (fails[0] if fails else (notes[0] if notes else 'One route.'))[:140]
            sha = pr['head']['sha']
            if current_status(repo, sha) != (state, text):
                gh('-X', 'POST', f'repos/{repo}/statuses/{sha}', '-f', f'state={state}',
                   '-f', f'context={CONTEXT}', '-f', f'description={text}')
            print(f'#{pr["number"]}: {state.upper()}', *(fails + notes))
            failed += bool(fails)
        except (subprocess.CalledProcessError, KeyError, ValueError) as e:
            detail = getattr(e, 'stderr', None) or repr(e)
            errors.append(pr['number'])
            print(f'#{pr["number"]}: ERROR', str(detail).strip()[:300])
    print(f'{failed} of {len(prs)} open PRs fail' + (f'; errors on #{", #".join(map(str, errors))}' if errors else ''))
    return 1 if errors else 0


def from_github():
    event = json.load(open(os.environ['GITHUB_EVENT_PATH'], encoding='utf-8'))
    pr = event['pull_request']
    repo = os.environ['GITHUB_REPOSITORY']
    return ([l['name'] for l in pr['labels']], pr['base']['ref'],
            event['repository']['default_branch'], files_of(repo, pr['number']))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--github', action='store_true')
    ap.add_argument('--sweep', action='store_true')
    ap.add_argument('--labels', default='')
    ap.add_argument('--base', default='')
    ap.add_argument('--default', default='')
    ap.add_argument('--files', help='file holding one changed path per line')
    a = ap.parse_args()
    if a.sweep:
        return sweep()
    if a.github:
        labels, base, default, files = from_github()
    else:
        labels = [l for l in a.labels.split(',') if l]
        files = [l.strip() for l in open(a.files, encoding='utf-8') if l.strip()]
        base, default = a.base, a.default
    fails, notes = check(labels, base, default, files)
    for n in notes:
        print('NOTE:', n)
    for f in fails:
        print('FAIL:', f)
    if not fails:
        print('PASS: one route,', ', '.join(sorted(labels)) or 'no labels')
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
