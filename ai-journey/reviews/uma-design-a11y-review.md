# Design and a11y review (UI/UX agent): one batched pass

**Method:** screenshots at 390 and 1440 px of `/`, `/users/new`, `/users/u1`, `/todos`, `/todos?assignee=…`, an unknown user, the 409 duplicate username, the optimistic pending row and the `?fail=` rollback, plus keyboard tab order and axe on every page.

**axe:** clean on every page except the unknown-user page (`page-has-heading-one`, moderate).

## Findings and what was done
| # | Pri | Finding | Fix |
|---|---|---|---|
| 1 | P0 | Tailwind v4 didn't scan `packages/`, so the shared and feature UI rendered unstyled | `@source "../../../packages";` in `apps/web/src/index.css` |
| 2 | P0 | A 409 "Username is already taken" showed as a separate alert. The field stayed `aria-invalid=false` and focus stayed on `<body>` | The server error is set on the field, and the input gets focus |
| 3 | P0 | The rollback message mixed into the polite status line and showed the raw server text | A separate `role=alert` red box: "Couldn't save "…". We removed it from the list. Try again." Raw message in dev only |
| 4 | P1 | Nav links, inputs and home links were under 44px | `min-h-11` on each |
| 5 | P1 | The pending row used `opacity-60`, which hurt contrast | Dashed border, readable text, a pulsing dot, sr-only "(saving)" |
| 6 | P1 | Unknown user: no h1 (axe) | "User not found" h1 + "Back to users" link |
| 7 | P1 | Retry was a bare underlined button | Shared `Button` inside the same red alert box |
| 8 | P1 | Home list looked unstructured | Bordered divided card, full-row links, primary "Create a user" next to the h1 |
| 9 | opt | Empty state was plain text | Dashed box with a hint |
| 10 | opt | The field error came after the hint | Error first, with a ⚠ icon and medium weight; hint stays small |
| 11 | opt | Header at 390 px: the picker was cramped | `w-full sm:w-auto` and a larger gap |
