function clean(obj = {}) {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== ''),
  );
}

function toPropertiesObject(props = {}) {
  // HubSpot expects { properties: { a: 'x' } }
  return { properties: clean(props) };
}

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

async function retryRequest(fn, attempt = 1, maxRetries = 3, baseDelay = 300) {
  try {
    return await fn();
  } catch (err) {
    const status = err?.response?.status;

    const retryable =
      status === 429 ||
      (status >= 500 && status <= 599) ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ECONNABORTED';

    if (!retryable || attempt > maxRetries) {
      throw err;
    }

    let delay = baseDelay * Math.pow(2, attempt - 1);
    const retryAfter = err?.response?.headers?.['retry-after'];
    if (retryAfter) delay = parseInt(retryAfter, 10) * 1000;
    console.debug(`[hubspot] retry ${attempt}/${maxRetries}`, err.message);

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(fn, attempt + 1, maxRetries, baseDelay);
  }
}

export { clean, toPropertiesObject, fetchAllPages, retryRequest };
