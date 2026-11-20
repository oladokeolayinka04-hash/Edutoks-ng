const isTransientSubmissionError = (error) => {
  const status = Number(error?.status ?? error?.context?.status);
  if (status === 408 || status === 429 || (status >= 500 && status <= 599)) return true;
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return /failed to fetch|fetch failed|network error|network request|timeout|timed out|connection (?:reset|refused|lost)|temporarily unavailable|server unavailable|gateway|dns/i.test(message);
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function submitWithBoundedRetry(submit, { maxRetries = 2, delayMs = 1500 } = {}) {
  let retries = 0;
  while (true) {
    try {
      return await submit();
    } catch (error) {
      if (retries >= maxRetries || !isTransientSubmissionError(error)) throw error;
      retries += 1;
      if (delayMs > 0) await wait(delayMs * retries);
    }
  }
}
