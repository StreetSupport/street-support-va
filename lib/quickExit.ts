// Quick exit ("Exit this page"), as set out in "Quick exit: proposal for review"
// (Managing Director, 19 November 2026; for technical lead review). The pattern
// follows the GOV.UK Design System's Exit this page component.
//
// What it is designed to do, in this order and without waiting for anything:
//   1. cover the screen at once, so a slow connection does not leave it showing;
//   2. clear the conversation and any half-typed message, and cancel any request
//      in progress so its reply cannot bring them back;
//   3. send the tab to an ordinary site (BBC Weather, GOV.UK's default).
// Nothing is sent to the VA's server on exit. Clearing the screen does not
// delete what has already been sent: see the proposal's decision 5 record.
//
// Kept free of React and the DOM so the behaviour can be tested directly.
// Changes require review: this is safeguarding-adjacent (Safeguarding Contract,
// the Safety from harm route's quick exit).

export const EXIT_URL = 'https://www.bbc.co.uk/weather';

// Whether the exit replaces the current page in the tab's history, so Back does
// not return to it. GOV.UK tried this and dropped it; Scotland's component does
// it. Left for the technical lead to settle by browser testing in the real
// deployment (proposal, open question 3). Off by default, as GOV.UK.
export const EXIT_REPLACES_HISTORY = false;

// Shift pressed three times within five seconds; any other key resets the
// count (GOV.UK Exit this page component).
export const SHIFT_PRESSES = 3;
export const SHIFT_WINDOW_MS = 5000;

export interface ShiftCounter {
  /** Feed every keydown. Returns true on the press that should trigger the exit. */
  onKeyDown(key: string, timeMs: number, isRepeat?: boolean): boolean;
}

export function createShiftCounter(presses = SHIFT_PRESSES, windowMs = SHIFT_WINDOW_MS): ShiftCounter {
  let times: number[] = [];
  return {
    onKeyDown(key, timeMs, isRepeat = false) {
      if (key !== 'Shift') { times = []; return false; }
      // Holding Shift down repeats the event; only distinct presses count.
      if (isRepeat) return false;
      times = [...times.filter(t => timeMs - t < windowMs), timeMs];
      if (times.length >= presses) { times = []; return true; }
      return false;
    },
  };
}

export interface ExitSteps {
  cover: () => void;
  clear: () => void;
  cancelRequests: () => void;
  navigate: (url: string, replaceHistory: boolean) => void;
}

/**
 * Run the exit. Each step is guarded so a failure in one never stops the tab
 * leaving: the navigation always runs.
 */
export function performExit(steps: ExitSteps): void {
  const attempt = (f: () => void) => { try { f(); } catch { /* keep going: leaving matters most */ } };
  attempt(steps.cover);
  attempt(steps.cancelRequests);
  attempt(steps.clear);
  steps.navigate(EXIT_URL, EXIT_REPLACES_HISTORY);
}

/**
 * A page restored from the browser's back-forward cache would show the
 * conversation as it was. Such a page reloads empty instead.
 */
export function shouldReloadOnPageShow(persisted: boolean): boolean {
  return persisted;
}
