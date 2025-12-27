import { toPropertiesObject } from '../utils/toPropertiesObject.js';
import { fetchAllPages } from '../utils/fetchAllPages.js';

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
  // -------------------------------------------------------
  //  FIND OR CREATE COMPANY BY DOMAIN
  // -------------------------------------------------------
  async function findOrCreateCompanyByDomain(domain, props = {}) {
    // Use searchCompanies if you want, but normalize its response
    const res = await client.post('/crm/v3/objects/companies/search', {
      filterGroups: [
        { filters: [{ propertyName: 'domain', operator: 'EQ', value: domain }] },
      ],
      properties: ['domain'],
      limit: 1,
    });

    const data = normalizeResponse(res);
    const found = data?.results?.[0];

    if (found) {
      return companies.updateCompany(found.id, props);
    }

    return companies.createCompany({ domain, ...props });
  }
  async function createDealWithAssociations(
    dealProps,
    contactId = null,
    companyId = null,
  ) {
    // createDeal returns an axios response or data — normalize it
    const dealResRaw = await deals.createDeal(dealProps);
    const dealRes = normalizeResponse(dealResRaw);

    // HubSpot create endpoint returns { id: '...', ... } under data
    const dealId = dealRes?.id || dealResRaw?.id;
    if (!dealId) throw new Error('Failed to create deal — missing ID.');

    if (contactId) {
      await associations.associateContactToDeal(contactId, dealId);
    }

    if (companyId) {
      await associations.associateCompanyToDeal(companyId, dealId);
    }

    // return the original raw result (consistent with other create* behavior)
    return dealResRaw;
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
    findOrCreateCompanyByDomain,
    createDealWithAssociations,
  };
}

export { makeDeals };
