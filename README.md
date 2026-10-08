# DAYFORM — Personal Task Planner

Task 3: Dynamic To-Do Application, Auspify Technologies Frontend Developer Internship.

## Overview

DAYFORM is a responsive browser-based task planner built with HTML, CSS, and vanilla JavaScript. It uses a warm white and plum design, animated decorative cards, and a progress panel to help users organise tasks and track completion.

The application starts empty. Users create their own tasks; no sample tasks are inserted automatically.

## Features

- Add tasks with titles up to 160 characters.
- Reject empty or whitespace-only task titles.
- Assign Personal, Work, or Learning categories.
- Choose Normal, High, or Low priority.
- Mark tasks complete or active.
- Filter by All, Active, or Completed.
- View task counts and overall completion percentage.
- Delete tasks and undo the most recent deletion.
- Save tasks using Local Storage when available.
- Display helpful empty states and storage warnings.
- Responsive desktop and mobile layouts.
- Keyboard focus support, screen-reader announcements, and reduced-motion support.

Categories and priorities are labels; they do not automatically sort or filter tasks. Newly added tasks appear first.

## Technologies

| Technology | Purpose |
| --- | --- |
| HTML5 | Semantic structure, task template, and form controls |
| CSS3 | Grid, Flexbox, responsive styles, animations, and progress ring |
| JavaScript | Task operations, filtering, DOM updates, and validation |
| Local Storage | Browser-based persistence |

No external libraries, API keys, package installation, build process, or backend are required.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Application structure and task template |
| `style.css` | Visual design, responsive layout, and animations |
| `script.js` | Application behaviour and persistence |
| `README.md` | Project documentation |
| `screenshots/desktop-tasks.png` | Desktop tasks and progress panel |
| `screenshots/mobile-tasks.png` | Mobile layout |
| `screenshots/completed-filter.png` | Completed tasks view |
| `screenshots/delete-undo.png` | Deletion feedback and Undo button |

## Run locally

1. Download or clone the project folder.
2. Open the folder in VS Code.
3. Start Live Server from `index.html`, or use another local HTTP server.
4. Open the local address in a modern browser.

Opening `index.html` directly can display the application, but a local HTTP server provides a consistent origin for storage testing. JavaScript must be enabled.

## How to use

1. Enter a task, select its category and priority, and press Add task or Enter.
2. Check the task to complete it; uncheck it to mark it active again.
3. Use All, Active, and Completed to change the visible list.
4. Select the delete icon to remove a task.
5. Select Undo to restore the last deleted task.
6. Refresh the page to check that saved tasks return.

Adding a task while viewing Completed switches to Active so the new task is visible. Undo may switch to All to show the restored task. Progress is calculated across all tasks, regardless of the current filter.

## Storage and limitations

- Tasks are stored under `dayform-tasks-v1` in Local Storage.
- Tasks belong to the current browser profile and website origin. They do not sync across devices.
- Local development and the deployed website use separate storage. Local tasks will not automatically appear on the live site.
- Clearing site data removes saved tasks. Private browsing may not retain them after the session ends.
- If storage cannot be read or written, the application shows a warning. Tasks can still be managed in memory, but unsaved changes may be lost when leaving the page.
- Unreadable saved data is left unchanged instead of being overwritten.
- Undo retains only the latest deletion in memory. It expires when dismissed, replaced by another deletion, or the page is refreshed.
- Multiple open tabs are not synchronised. Use one tab at a time to avoid overwriting newer changes.
- Task titles are inserted using `textContent`, not interpreted as HTML.

## Manual review checklist

Mark each item after checking it. These are manual checks, not automated test results.

- [x] Add tasks in different categories and priorities.
- [x] Reject a title containing only spaces.
- [x] Complete and reopen a task.
- [x] Confirm one completed task out of two shows 50% progress.
- [x] Verify All, Active, and Completed show the correct tasks and counts.
- [x] Delete a task and restore it using Undo.
- [x] Refresh and confirm tasks and completion states remain.
- [x] Check the empty state when a filter has no matching tasks.
- [x] Check long task titles wrap within their cards.
- [x] Check mobile widths of 390 px and 320 px without horizontal overflow.
- [x] Use the app with a keyboard and check visible focus.
- [x] Check reduced-motion settings disable animation.
- [x] Confirm there are no JavaScript errors in the browser console.
- [x] Repeat the main task operations and persistence check on the deployed site.

## Task requirements

| Requirement | Implementation |
| --- | --- |
| Design the application interface | Responsive task workspace and progress panel |
| Task creation and deletion | Add form, delete controls, and undo |
| Completion tracking | Checkboxes, counts, and percentage ring |
| Local Storage | JSON persistence with validation and error handling |
| Functionality testing | Manual review checklist and submission screenshots |

## Credits

Prepared by Abdurrahman Hilmy with AI-assisted design guidance and code generation. Decorative artwork is created using CSS.
