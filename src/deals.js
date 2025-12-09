import { toPropertiesObject, fetchAllPages } from './utils.js';

// Old Implemementation
/*

function makeDeals(client) {
  const base = '/crm/v3/objects/deals';
  return {
    createDeal: (props) => client.post(base, toPropertiesObject(props)),
    getDeal: (id, properties = []) => client.get(`${base}/${id}`, { properties }),
    searchDeals: (filterGroups = [], properties = [], limit = 50, after = null) =>
      client.post(`${base}/search`, { filterGroups, properties, limit, after }),
    updateDeal: (id, props) => client.patch(`${base}/${id}`, toPropertiesObject(props)),
  };
}

*/

// Updated Implementation

function makeDeals(client) {
  const base = '/crm/v3/objects/deals';

  const matchAllFilterGroups = [
    { filters: [{ propertyName: 'hs_object_id', operator: 'GT', value: '0' }] },
  ];

  async function getAllDeals({
    properties = ['dealname', 'dealstage', 'amount'],
    pageSize = 100,
    useSearchFirst = true,
  } = {}) {
    const limit = Math.min(100, Math.max(1, pageSize));
    const props = Array.isArray(properties) ? properties : [];

    if (useSearchFirst) {
      try {
        const allFromSearch = await fetchAllPages(
          ({ limit: l, after }) =>
            client.post(`${base}/search`, {
              filterGroups: matchAllFilterGroups,
              properties: props,
              limit: l,
              after,
            }),
          limit,
        );
        if (allFromSearch && allFromSearch.length > 0) return allFromSearch;
      } catch (err) {
        // fallback
      }
    }

    const allFromList = await fetchAllPages(
      ({ limit: l, after }) =>
        client.get('/crm/v3/objects/deals', {
          params: { limit: l, after, properties: props.join(',') },
        }),
      limit,
    );

    return allFromList;
  }

  return {
    createDeal: (props) => client.post(base, toPropertiesObject(props)),
    getDeal: (id, properties = []) =>
      client.get(`${base}/${id}`, {
        params: {
          properties: Array.isArray(properties) ? properties.join(',') : properties,
        },
      }),
    searchDeals: (filterGroups = [], properties = [], limit = 50, after = null) =>
      client.post(`${base}/search`, { filterGroups, properties, limit, after }),
    updateDeal: (id, props) => client.patch(`${base}/${id}`, toPropertiesObject(props)),
    getAllDeals,
  };
}

export { makeDeals };
