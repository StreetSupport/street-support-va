**Street Support Network Virtual Assistant**

**Governance Note**

**Claude Use and Issue Reporting**

|                       |                                                                                                                                   |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| **Status**            | Draft for review                                                                                                                  |
| **Date**              | 12 November 2026                                                                                                                  |
| **Version**           | 1.0                                                                                                                               |
| **Author**            | Matt Lambert                                                                                                                      |
| **For**               | James Cross                                                                                                                       |
| **Related documents** | VA Analytics Contract v2.0, Safeguarding Contract v3.2 (Claude Usage Rules), Data Minimisation and Lawful Basis Note v1.1         |

## 1. Purpose

This note records how Street Support Network uses Claude, the data protection position for each use, and how virtual assistant issues are reported and fixed without using conversation data.

## 2. Three uses of Claude

| **Use**              | **What it does**                                                         | **Data involved**                                                                                   |
|----------------------|--------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Anthropic API        | Will generate the new virtual assistant's conversational responses. In development, not live. The live assistant runs on IBM WatsonX. | During development, synthetic test input only. Once live, conversation content passes through the API while the assistant runs, and is not stored by Street Support Network (VA Analytics Contract). |
| Claude Team workspace | Staff drafting, analysis and research.                                  | Staff names and email addresses. Public service and organisation information. No service user data. |
| Claude Code          | Development, testing and analysis of issue reports in this repository.  | Code, governance documents, issue descriptions and synthetic test input. No service user data.      |

All three run under Anthropic's Commercial Terms. Anthropic is a processor and Street Support Network is the controller. Anthropic's Data Processing Addendum is incorporated into the Commercial Terms, and includes the UK International Data Transfer Addendum for processing in the United States. Customer data is not used to train Anthropic's models.

Anthropic's own retention of API inputs and outputs is set by its terms. Confirm the current period against the Data Processing Addendum when the Data Protection Policy is next reviewed.

## 3. What never goes into Claude

Street Support Network work involving AI is done in the organisation's Claude Team workspace only, using an organisation account. Personal or free AI accounts must not be used for Street Support Network work.

The following must not be entered into Claude in any form, including chat, uploaded files, screenshots, or files in folders used with Claude Code:

- personal details of people using services
- virtual assistant conversations or extracts from them
- partner data that a data sharing agreement restricts.

The new virtual assistant is designed not to store transcripts, so once live there are none to share. This rule covers anything seen on screen during testing, or passed on by partners or frontline staff.

If personal details reach Claude by mistake, delete the chat and tell the Managing Director.

## 4. Virtual assistant issue reporting

### 4.1 Principles

- **Describe, don't retrieve.** Reporters describe what the assistant did. Nobody retrieves, links to or copies a conversation.
- **No personal details.** Nothing about the person using the assistant is asked for or needed.
- **Reproduce, don't look up.** The assistant follows a fixed protocol, so issues are recreated with synthetic input.

### 4.2 Form fields

Selecting "Virtual assistant" as the content type on the website issue form shows four required fields:

| **Field**                    | **Format**                                                                                         |
|------------------------------|----------------------------------------------------------------------------------------------------|
| Which location's assistant?  | Dropdown of live locations                                                                         |
| Where did it go wrong?       | Opening / Safety question / Language / Routing questions / Service results / Ending / Not sure     |
| What happened?               | Free text. Hint: "Describe what the assistant did. Please don't include anything the person typed or any personal details." |
| What should have happened?   | Free text                                                                                          |

Deliberately excluded: screenshots, conversation references, date and time, and anything about the person.

### 4.3 Handling

1. The report is submitted and a ticket is created.
2. Claude Code reads the report and decides whether it is safety-related. Safety-related reports are labelled URGENT.
3. Claude Code recreates the issue with synthetic input.
4. Claude Code proposes a fix and a test.
5. The fix follows the Governance Decision Framework. Changes to the crisis gate or safety wording also follow the Safeguarding Contract change control: pull request, review by James Cross, and a backlog entry.
6. The fix is deployed and the ticket closed.

The instructions Claude Code follows are in `CLAUDE.md` at the root of this repository.

## 5. Data protection position

Virtual assistant issue reports contain no information about the person using the assistant and never link to a conversation. They are not personal data about service users. The only personal data is the reporter's name and email, captured through sign-in.

## 6. Open items

| **Item**                     | **Action**                                                                                                                                        |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Data Protection Policy and DPIA | Confirm Anthropic is named as processor for staff use now, and for the new virtual assistant before it goes live. Neither document is held in this repository. |
| AI Policy                    | AI Policy v3.0 covers the live WatsonX assistant and the new assistant in development. Update it when the new assistant goes live. |
| Hosting provider             | Confirm the production host is named as a processor. The README describes deployment to Vercel.                                                  |
| Repository visibility        | This repository is public. Virtual assistant issue reports must not be filed as GitHub issues here. Confirm where tickets from the website form are stored. |
| Urgent notification          | Agree how URGENT reports are surfaced so they are not left in the queue.                                                                          |
| Ticket retention             | Set a retention period for closed tickets.                                                                                                        |
| Workspace owners             | Name a second owner for the Claude Team workspace alongside the Managing Director.                                                                |

## 7. Failure modes

- **Misclassified safety reports.** Descriptions will be loose, so Claude Code treats unclear reports as safety-related.
- **Issues that won't reproduce.** Some intermittent issues may not reproduce from a description. These are investigated as a documented exception, with a named person and a recorded reason, and never by pasting conversation content into Claude.
- **Personal details slip through.** A reporter may still include them. Claude Code does not repeat them in analysis, commits or test files, and flags the report for redaction.
- **Crisis gate regressions.** A plausible fix can weaken the gate elsewhere. Human review under the Safeguarding Contract is the control.

## 8. Governance tier

Proposed as Tier 2. This note sets an operational process and records existing data protection arrangements. It does not change governing principles or safeguarding behaviour. Record in the Tier 2 log once approved.

## Document history

| **Version** | **Date**         | **Change**     |
|-------------|------------------|----------------|
| 1.0         | 12 November 2026 | Initial draft. |

*Governance note │ Version 1.0 │ November 2026*
