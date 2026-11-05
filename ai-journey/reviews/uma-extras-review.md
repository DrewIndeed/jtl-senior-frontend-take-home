# Design/a11y review of the minimal extras (round 3)

Batched review by the design-review agent. Screenshots are not included.

| #    | Finding                                                                                               | Fix                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| P0-1 | No focus management after delete, Undo, or a failed delete; dialog lost focus on a failed user delete | Focus Undo after delete; restored row's checkbox after Undo or failed delete; dialog Delete button refocused on error (9ffa98d, 85c9472) |
| P0-2 | All and Open both `aria-current` on `?status=open`                                                    | `aria-current` from the current status + exact search matching; segmented-control styling (939ac5a, cb30efc)                             |
| P1-3 | Undo/rollback appended the item                                                                       | Restore at the original index, optimistic and in the mock (fc12244)                                                                      |
| P1-4 | Raw server text inline in the toggle alert                                                            | `isDev`-only detail line, same as the create alert; checked in a prod preview (9ffa98d)                                                  |
| P1-5 | "Added …" shown alongside "Deleted … Undo"                                                            | Cleared after 4s or when a toggle/delete starts (4e3a2e8, e2d5f98)                                                                       |
| P2-6 | No confirmation after a user delete                                                                   | Home status line + focused h1 (66da0cd)                                                                                                  |
| P2-7 | Small checkbox target                                                                                 | 44px wrapper (9ffa98d)                                                                                                                   |

## Round 4: filter visuals

Andrew (me) found the filters confusing after looking at the UI (the active tab was too subtle and the tabs, the "Working as" picker and an empty status line competed for attention). Fixes: solid dark active tab with plain-text counts, one toolbar row (heading and picker left, tabs right), the Undo status line moved below the list and visually hidden when empty, and "Working as" restyled as an identity chip. axe found 0 violations on `/todos?status=open` and `/users/u1?status=done` at 1440 and 390 px.

## Round 5: controls

I found the dropdowns too tall and plain. Fixes: one shared `Select` (native `<select>`, so labels and keyboard behaviour stay; custom chevron; 40px in forms, 36px in the toolbar and header), inputs and the primary button at 40px (WCAG 2.5.8 asks for 24px), a compact assignee picker in the toolbar row, and the "Working as" chip with an avatar initial. One deviation from the review: the chip label is zinc-600, not zinc-500, because axe flagged 4.39:1 contrast.
