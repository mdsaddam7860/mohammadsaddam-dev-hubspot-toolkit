import { toPropertiesObject, clean } from './utils/toPropertiesObject.js';
// const sleep = function (sleepTime) {
//   return new Promise(function (resolve) {
//     setTimeout(resolve, sleepTime);
//   });
// };

// async function fetchAllPages(fetchPageFn, pageSize = 100) {
//   let results = [];
//   let after = undefined;
//   while (true) {
//     const res = await fetchPageFn({ limit: pageSize, after });
//     if (!res || !res.results) break;
//     results.push(...res.results);
//     if (!res.paging || !res.paging.next || !res.paging.next.after) break;
//     after = res.paging.next.after;
//   }
//   return results;
// }
// fetchAllPages (made robust to accept either res.data or axios response)
async function fetchAllPages(fetchPageFn, pageSize = 100) {
  const results = [];
  let after = undefined;

  while (true) {
    // fetchPageFn should return either:
    //  - the HubSpot payload { results, paging } OR
    //  - an Axios response object { data: { results, paging }, ... }
    const raw = await fetchPageFn({ limit: pageSize, after });

    if (!raw) break;

    // normalize to the payload object
    const payload = raw && raw.data ? raw.data : raw;

    if (!payload || !Array.isArray(payload.results)) break;

    results.push(...payload.results);

    const hasNext = payload.paging && payload.paging.next && payload.paging.next.after;
    if (!hasNext) break;

    after = payload.paging.next.after;
  }

  return results;
}

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

// async function retryRequest(fn, attempt = 1, maxRetries = 3, baseDelay = 300) {
//   try {
//     return await fn();
//   } catch (err) {
//     const status = err?.response?.status;

//     const retryable =
//       status === 429 ||
//       (status >= 500 && status <= 599) ||
//       ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'].includes(err.code);

//     if (!retryable || attempt >= maxRetries) {
//       throw err;
//     }

//     // Exponential backoff
//     const backoff = baseDelay * Math.pow(2, attempt - 1);

//     // Full jitter (correct)
//     let waitTime = Math.random() * backoff;

//     // Retry-After overrides everything
//     const retryAfter = err?.response?.headers?.['retry-after'];
//     if (retryAfter) {
//       waitTime = Number(retryAfter) * 1000;
//     }

//     console.debug(
//       `Retry ${attempt}/${maxRetries} in ${Math.round(waitTime)}ms`,
//       err.message,
//     );

//     await sleep(waitTime);

//     return retryRequest(fn, attempt + 1, maxRetries, baseDelay);
//   }
// }

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
export { clean, toPropertiesObject, fetchAllPages, retryRequest };

// await new Promise((res) => setTimeout(res, waitTime));
