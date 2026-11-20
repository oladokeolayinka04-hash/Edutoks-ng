# Free local CBT security test setup

This workflow uses the Supabase CLI, Docker, Node.js 22, and a disposable local database. It does not create a Supabase cloud branch or change production.

## Current repository limitation

The security PR currently contains the CBT security migration but does not contain a complete Supabase local project configuration and full baseline migration history. Therefore `supabase start` alone cannot reproduce the production CBT schema yet. Do not run a partial migration against an empty database and interpret that as a passing integration test.

Before running database integration tests, restore the complete, reviewed schema migration history (or a reviewed schema-only dump) into this repository. Do not include production rows, authentication users, secrets, service-role keys, or student records.

## Local setup (after the full schema is present)

1. Install Docker Desktop/Engine and the Supabase CLI on the development computer.
2. From the repository root, run `supabase start`.
3. Apply the complete local migration history with `supabase db reset`. This resets only the local database.
4. Use only synthetic test users and synthetic question-bank fixtures.
5. Start the app with local Supabase URL and anon key in a local, untracked environment file. Never commit keys or use production credentials.
6. Run `npm ci`, `npm test`, and `npm run build`.
7. Run the database regression suite against the local database and confirm all fixtures are rolled back or removed.

## Required two-student regression

Create two synthetic users, Student A and Student B, and a disposable exam/subject with at least three published questions and four options per question. Include one unanswered question.

- Anonymous and authenticated clients can read only public option fields.
- Anonymous and authenticated clients cannot read `question_options.is_correct`.
- Neither student can directly read `attempt_answers`.
- Student A can start an attempt; the returned payload contains no answer-key flags.
- Student A can save, change, and clear answers before expiry.
- Student B cannot save answers to Student A's attempt.
- A student cannot save an option belonging to another question or a question outside the attempt.
- Submission grades on the server; repeating submission is rejected and points are not duplicated.
- An expired attempt is finalized only from previously saved answers.
- Student A can retrieve corrections after completion, including the unanswered question.
- Student B and anonymous callers cannot retrieve Student A's corrections.
- Student A cannot retrieve corrections before completion.
- Attempt history and performance RPCs still return expected synthetic data.

## Safety rules

- Never point the local test environment at the production Supabase URL.
- Never insert or modify synthetic test data in production.
- Never apply the security migration again to production: production already records a migration named `secure_cbt_answer_keys`.
- Do not create Supabase cloud branches or paid infrastructure for this workflow.
- A passing Node contract test is not a substitute for the two-user database integration suite.
