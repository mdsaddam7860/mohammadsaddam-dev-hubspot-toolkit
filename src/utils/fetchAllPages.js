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

export { fetchAllPages };
