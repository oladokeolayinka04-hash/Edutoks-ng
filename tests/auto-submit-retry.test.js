import test from "node:test";
import assert from "node:assert/strict";
import { submitWithBoundedRetry } from "../src/lib/auto-submit-retry.js";

test("automatic submission retries transient failures and returns a later success", async () => {
  let calls = 0;
  const result = await submitWithBoundedRetry(async () => {
    calls += 1;
    if (calls < 3) throw Object.assign(new Error("Failed to fetch"), { status: 503 });
    return { score: 4 };
  }, { maxRetries: 2, delayMs: 0 });
  assert.equal(calls, 3);
  assert.deepEqual(result, { score: 4 });
});

test("automatic submission does not retry non-transient errors", async () => {
  let calls = 0;
  const error = Object.assign(new Error("INVALID_ATTEMPT"), { code: "INVALID_ATTEMPT" });
  await assert.rejects(() => submitWithBoundedRetry(async () => {
    calls += 1;
    throw error;
  }, { maxRetries: 2, delayMs: 0 }), error);
  assert.equal(calls, 1);
});

test("automatic submission stops after the configured retry bound", async () => {
  let calls = 0;
  await assert.rejects(() => submitWithBoundedRetry(async () => {
    calls += 1;
    throw Object.assign(new Error("Network error"), { status: 503 });
  }, { maxRetries: 2, delayMs: 0 }), /Network error/);
  assert.equal(calls, 3);
});
