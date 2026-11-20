import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("corrections client uses the owner-checked RPC, never direct answer-table reads", async () => {
  const source = await read("../src/lib/performance.js");
  assert.match(source, /rpc\(["']get_attempt_corrections["']/);
  assert.doesNotMatch(source, /from\(["']attempt_answers["']\)/);
  assert.doesNotMatch(source, /question_options.*is_correct/);
});

test("CBT client delegates start, save and submit to server RPCs", async () => {
  const source = await read("../src/lib/cbt.js");
  for (const rpc of ["start_cbt", "save_cbt_answer", "submit_cbt"]) {
    assert.match(source, new RegExp('rpc\\(["\\x27]' + rpc + '["\\x27]'));
  }
  assert.doesNotMatch(source, /from\(["']attempt_answers["']\)/);
});

test("security migration removes browser access to answer keys and answers", async () => {
  const sql = await read("../supabase/migrations/20261109000100_secure_cbt_answer_keys.sql");
  assert.match(sql, /REVOKE SELECT ON TABLE public\.question_options FROM PUBLIC, anon, authenticated/i);
  assert.match(sql, /GRANT SELECT \(id, question_id, option_key, option_text\)[\s\S]*?TO anon, authenticated/i);
  assert.match(sql, /REVOKE SELECT \(is_correct\) ON TABLE public\.question_options FROM PUBLIC, anon, authenticated/i);
  assert.match(sql, /REVOKE SELECT ON TABLE public\.attempt_answers FROM PUBLIC, anon, authenticated/i);
  assert.match(sql, /REVOKE SELECT \(id, attempt_id, question_id, selected_option_id, is_correct\)[\s\S]*?FROM PUBLIC, anon, authenticated/i);
});

test("corrections RPC requires authentication and a completed attempt owned by caller", async () => {
  const sql = await read("../supabase/migrations/20261109000100_secure_cbt_answer_keys.sql");
  assert.match(sql, /IF auth\.uid\(\) IS NULL THEN[\s\S]*?AUTH_REQUIRED/i);
  assert.match(sql, /a\.id = p_attempt_id[\s\S]*?a\.user_id = auth\.uid\(\)[\s\S]*?a\.completed = true/i);
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.get_attempt_corrections\(uuid\) FROM PUBLIC, anon/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.get_attempt_corrections\(uuid\) TO authenticated/i);
});

test("corrections include every attempt question, including unanswered questions", async () => {
  const sql = await read("../supabase/migrations/20261109000100_secure_cbt_answer_keys.sql");
  assert.match(sql, /FROM public\.exam_attempt_questions aq[\s\S]*?LEFT JOIN public\.attempt_answers aa/i);
  assert.match(sql, /'selected_option_id', aa\.selected_option_id/i);
  assert.match(sql, /'is_correct', coalesce\(aa\.is_correct, false\)/i);
});

test("corrections screen renders unanswered answers without treating them as selected", async () => {
  const source = await read("../src/main.jsx");
  assert.match(source, /c\.selected_option_id\s*\?\s*\(c\.is_correct\s*\?\s*"✓ Correct"\s*:\s*"✗ Incorrect"\)\s*:\s*"— Not answered"/);
});
