# CBT answer-key security regression plan

This change is intentionally split between an application commit and a database migration. The migration is **not applied to production** by this pull request.

## Expected access rules

- Anonymous and authenticated Data API clients may read published question options' public fields: `id`, `question_id`, `option_key`, and `option_text`.
- Anonymous and authenticated Data API clients must not read `question_options.is_correct`.
- Browser clients must not read `attempt_answers` directly.
- `start_cbt` must continue to return option IDs and text without correctness flags.
- `save_cbt_answer` and `submit_cbt` continue to calculate correctness on the server.
- `get_attempt_corrections` requires an authenticated owner and a completed attempt; it returns every attempt question, including unanswered questions, and answer keys/explanations only for that owner.

## Regression checks before production migration

1. Anonymous REST select of `question_options` public columns succeeds for published questions.
2. Anonymous and authenticated REST selects that include `is_correct` fail with insufficient privilege.
3. Authenticated REST select of `attempt_answers` fails with insufficient privilege.
4. A student can start an exam and receives option text/IDs, never correctness flags.
5. A student can save, change, and clear an answer before the server deadline.
6. A student cannot save an answer for another student's attempt or a question outside their attempt.
7. Submission computes score and points server-side; duplicate submission remains rejected.
8. An expired attempt finalizes only from answers persisted before expiry.
9. The owner can review a completed attempt; unanswered questions appear as unanswered.
10. A different authenticated student and an anonymous caller cannot retrieve that attempt's corrections.
11. An owner cannot retrieve corrections while the attempt is still in progress.
12. Existing attempt history and performance screens still load.

## Operational safeguards

- Apply first to a non-production database branch or staging project and run the checks above.
- Review Supabase security/performance advisors after the migration.
- Apply to production only after the migration and client build are verified and explicitly approved.
- Do not rewrite, delete, or reset student attempts, answers, profiles, points, or question-bank records.
