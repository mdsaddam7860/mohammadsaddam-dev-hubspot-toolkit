import { toPropertiesObject, clean, fetchAllPages } from './utils.js';

// Old implementation

/*
function makeContacts(client) {
  const base = '/crm/v3/objects/contacts';

  return {
    createContact: (properties) => client.post(base, toPropertiesObject(properties)),
    getContact: (id, properties = []) => client.get(`${base}/${id}`, { properties }),
    searchContacts: (filterGroups = [], properties = [], limit = 50, after = null) =>
      client.post(`${base}/search`, { filterGroups, properties, limit, after }),
    getContactByEmail: async (email, properties = []) => {
      const body = {
        filterGroups: [
          {
            filters: [{ propertyName: 'email', operator: 'EQ', value: email }],
          },
        ],
        properties,
        limit: 1,
      };
      const res = await client.post(`${base}/search`, body);
      return (res.results && res.results[0]) || null;
    },
    updateContact: (id, properties) =>
      client.patch(`${base}/${id}`, toPropertiesObject(properties)),
    upsertContactByEmail: async (email, properties) => {
      const existing = await module.exports.getContactByEmail?.(email, ['email']);
      // however we will implement using client directly to avoid circular
    },
  };
}

*/

// New Implementation

/**
 * makeContacts(client)
 * - Assumes client.* methods return full axios responses (res) and not only res.data.
 * - Exposes getAllContacts which will fetch all contacts using search (match-all) then fallback to list.
 */

function makeContacts(client) {
  const base = '/crm/v3/objects/contacts';

  const matchAllFilterGroups = [
    { filters: [{ propertyName: 'hs_object_id', operator: 'GT', value: '0' }] },
  ];

  async function getContactByEmail(email, properties = []) {
    const body = {
      filterGroups: [
        { filters: [{ propertyName: 'email', operator: 'EQ', value: email }] },
      ],
      properties,
      limit: 1,
    };
    const res = await client.post(`${base}/search`, body);
    const data = res && res.data ? res.data : res;
    return (data.results && data.results[0]) || null;
  }

  async function getAllContacts(
    properties = ['email', 'firstname', 'lastname'],
    limit = 100,
  ) {
    const props = Array.isArray(properties) ? properties : [];

    // Try search first
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
      // fallback to list
    }

    // Fallback list endpoint
    const allFromList = await fetchAllPages(
      ({ limit: l, after }) =>
        client.get('/crm/v3/objects/contacts', {
          params: { limit: l, after, properties: props.join(',') },
        }),
      limit,
    );

    return allFromList;
  }

  async function upsertContactByEmail(email, properties = {}) {
    const existing = await getContactByEmail(email, ['email']);
    const toSend = toPropertiesObject(properties);

    if (existing) {
      const id = existing.id || existing.hs_object_id;
      if (!id) throw new Error('Existing contact missing id');
      const res = await client.patch(`${base}/${id}`, toSend);
      return res && res.data ? res.data : res;
    }

    const res = await client.post(base, toSend);
    return res && res.data ? res.data : res;
  }

  return {
    createContact: (properties) => client.post(base, toPropertiesObject(properties)),
    getContact: (id, properties = []) =>
      client.get(`${base}/${id}`, {
        params: {
          properties: Array.isArray(properties) ? properties.join(',') : properties,
        },
      }),
    searchContacts: (filterGroups = [], properties = [], limit = 50, after = null) =>
      client.post(`${base}/search`, { filterGroups, properties, limit, after }),
    getContactByEmail,
    updateContact: (id, properties) =>
      client.patch(`${base}/${id}`, toPropertiesObject(properties)),
    upsertContactByEmail,
    getAllContacts,
  };
}

export { makeContacts };
