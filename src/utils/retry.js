const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseRetryAfter(header) {
  if (!header) return null;

  // seconds
  if (!isNaN(header)) {
    return Number(header) * 1000;
  }

  // HTTP date
  const date = new Date(header);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return null;
}

function retryable(err) {
  if (!err) return false;

  const status = err?.response?.status;

  return (
    status === 429 ||
    (status >= 500 && status <= 599) ||
    ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'].includes(err?.code)
  );
}

async function retryRequest(
  fn,
  { maxRetries = 3, baseDelay = 300, maxDelay = 10_000 } = {},
) {
  let attempt = 1;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      // const status = err?.response?.status;
      // const code = err?.code;

      // const retryable =
      //   status === 429 ||
      //   (status >= 500 && status <= 599) ||
      //   ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'].includes(code);

      if (!retryable || attempt >= maxRetries) {
        throw err;
      }

      const retryAfterMs = parseRetryAfter(err?.response?.headers?.['retry-after']);

      let waitTime =
        retryAfterMs ??
        Math.random() * Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);

      console.debug(
        `Retry ${attempt}/${maxRetries} in ${Math.round(waitTime)}ms`,
        err.message,
      );

      await sleep(waitTime);
      attempt++;
    }
  }
}
export { retryRequest };
