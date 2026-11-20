# EduToks student weekend test-run checklist

Target window: Saturday 21 November to Sunday 22 November 2026.
This is a controlled test run, not a claim of production scale certification.

## Test group and safety
- Begin with 5–10 invited testers, then expand only after the first round passes.
- Use real student accounts only for ordinary student-facing tests; use separate synthetic accounts and fixtures for destructive/security tests.
- Never ask testers to share passwords or OTPs.
- Do not test by reading database tables directly or exposing answer keys.
- Do not publish unfinished or unreviewed question content.
- Record device, browser, network, test time, expected result, actual result, and screenshot/error text.
- Keep the current production database; do not reset, seed, or delete real student data.
- Do not run load tests against production without a separately approved test plan and capacity window.

## Student journey
1. Open the PWA on Android Chrome and desktop Chrome.
2. Register with an email address and a valid password; complete email confirmation if enabled.
3. Sign out, sign back in, refresh, and confirm the session/profile remains correct.
4. Confirm the profile displays the student's username rather than their email address.
5. Open CBT Practice; choose an exam and subject with published questions.
6. Start a short practice session (5 questions); confirm question text/options contain no answer-key indicators.
7. Select an answer, change it, clear it, move between questions, and confirm the answer count/palette is accurate.
8. Submit before the deadline; verify score, correct count, points, history, and corrections.
9. Leave one question unanswered; verify it is labelled unanswered and the correct answer/explanation is shown only in the completed attempt review.
10. Repeat with a short timer in a controlled test account to verify expiry and auto-submission.
11. Open the community feed, profile, notifications, leaderboard, and rewards; confirm the screens load and unavailable data is clearly labelled.
12. Install the PWA, close it, reopen it, and verify the app shell opens after the first successful online visit with network disabled. Sign-in, CBT, and other server-backed actions must clearly require connectivity.

## Security checks
- Anonymous clients cannot read `question_options.is_correct` or `attempt_answers`.
- Authenticated clients cannot directly read `question_options.is_correct` or `attempt_answers`.
- Student A cannot retrieve Student B's attempt corrections.
- A student cannot retrieve corrections for an in-progress attempt.
- Duplicate submission does not award duplicate points.
- An expired attempt scores only answers already persisted before expiry.
- Never expose service-role keys, VAPID private keys, or other server secrets in browser source.

## Defect severity
- **P0 – Stop test:** answer keys exposed, cross-student data access, incorrect student ownership, duplicate points, or corrupted results.
- **P1 – Block wider test:** students cannot sign in, start/finish CBT, or reliably save answers; app fails to load on supported mobile browser.
- **P2 – Fix before general release:** broken history/corrections, broken install/offline shell, leaderboard/rewards/community errors.
- **P3 – Polish:** spacing, copy, small visual defects.

## Go/no-go record
Do not call the PWA ready for wider student use until:
- GitHub CI tests and production build pass.
- The local two-student database integration tests pass.
- A small invited test group completes the student journey.
- P0/P1 defects are closed.
- Production migration history is reconciled without reapplying the security migration.
- Any deployment promotion is explicitly reviewed and the final live URL is verified.

## Capacity statement
The requested 5,000–10,000-user target is not certified by this checklist. Establish realistic concurrent-user capacity with a separate load test against an isolated environment before making that claim.
