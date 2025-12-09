import { toPropertiesObject, fetchAllPages } from './utils.js';

// Old Implementation

// function makeCompanies(client) {
//   const base = '/crm/v3/objects/companies';
//   return {
//     createCompany: (props) => client.post(base, toPropertiesObject(props)),
//     getCompany: (id, properties = []) => client.get(`${base}/${id}`, { properties }),
// /*************  ✨ Windsurf Command ⭐  *************/
//     /**
//      * Search for companies using the HubSpot CRM API v3.
//      * @param {object[]} filterGroups - An array of filter groups to apply to the search.
//      * @param {string[]} properties - An array of properties to return for each company.
//      * @param {number} limit - The maximum number of results to return (up to 100).
//      * @param {string} after - The ID of the last company returned in the previous page of results.
//      * @returns {Promise<object>} - A promise that resolves with the search results.
//      */
// /*******  39a3bf74-14ad-492a-bcf6-08a6339f14df  *******/
//     searchCompanies: (filterGroups = [], properties = [], limit = 50, after = null) =>
//       client.post(`${base}/search`, { filterGroups, properties, limit, after }),
//     updateCompany: (id, props) =>
//       client.patch(`${base}/${id}`, toPropertiesObject(props)),
//   };
// }

function makeCompanies(client) {
  const base = '/crm/v3/objects/companies';

  const matchAllFilterGroups = [
    { filters: [{ propertyName: 'hs_object_id', operator: 'GT', value: '0' }] },
  ];

  async function getAllCompanies({
    properties = ['domain', 'name'],
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
        client.get('/crm/v3/objects/companies', {
          params: { limit: l, after, properties: props.join(',') },
        }),
      limit,
    );

    return allFromList;
  }

  return {
    createCompany: (props) => client.post(base, toPropertiesObject(props)),
    getCompany: (id, properties = []) =>
      client.get(`${base}/${id}`, {
        params: {
          properties: Array.isArray(properties) ? properties.join(',') : properties,
        },
      }),
    searchCompanies: (filterGroups = [], properties = [], limit = 50, after = null) =>
      client.post(`${base}/search`, { filterGroups, properties, limit, after }),
    updateCompany: (id, props) =>
      client.patch(`${base}/${id}`, toPropertiesObject(props)),
    getAllCompanies,
  };
}

export { makeCompanies };
