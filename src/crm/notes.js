import { toPropertiesObject } from '../utils/toPropertiesObject.js';
import { fetchAllPages } from '../utils/fetchAllPages.js';

/**
 * makeContacts(client)
 * - Assumes client.* methods return full axios responses (res) and not only res.data.
 * - Exposes getAllContacts which will fetch all contacts using search (match-all) then fallback to list.
 */

function makeNotes(client) {
  const base = '/crm/v3/objects/notes';

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

  async function getAllTickets(properties = ['subject', 'content'], limit = 100) {
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
    createNote: (properties) => client.post(base, toPropertiesObject(properties)),
    getNote: (id, properties = []) =>
      client.get(`${base}/${id}`, {
        params: {
          properties: Array.isArray(properties) ? properties.join(',') : properties,
        },
      }),
    searchNote: (filterGroups = [], properties = [], limit = 50, after = null) =>
      client.post(`${base}/search`, { filterGroups, properties, limit, after }),
    updateNote: (id, properties) =>
      client.patch(`${base}/${id}`, toPropertiesObject(properties)),
    // upsertContactByEmail,
    // getAllContacts,
    // getContactByEmail,
  };
}

export { makeNotes };
