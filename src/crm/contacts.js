import { toPropertiesObject } from '../utils/toPropertiesObject.js';
import { fetchAllPages } from '../utils/fetchAllPages.js';

function makeContacts(client) {
  const base = '/crm/v3/objects/contacts';

  const matchAllFilterGroups = [
    { filters: [{ propertyName: 'hs_object_id', operator: 'GT', value: '0' }] },
  ];

  /**
   * Internal helper to find a single contact by any property
   */

  // ------------------------------One Contact------------------------------------------------
  async function _searchOne(propertyName, value, properties = []) {
    const body = {
      filterGroups: [{ filters: [{ propertyName, operator: 'EQ', value }] }],
      properties,
      limit: 1,
    };
    const res = await client.post(`${base}/search`, body);
    const data = res && res.data ? res.data : res;
    return (data.results && data.results[0]) || null;
  }

  async function getContactByEmail(email, properties = []) {
    return _searchOne('email', email, properties);
  }

  async function getContactByCustomField(propertyName, value, properties = []) {
    return _searchOne(propertyName, value, properties);
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

    // Include email in creation if not in properties
    const createPayload = toPropertiesObject({ ...properties, email });
    const res = await client.post(base, createPayload);
    return res && res.data ? res.data : res;
  }

  /**
   * Upsert based on a custom unique identifier
   */
  async function upsertContactByCustomField(
    uniquePropName,
    uniqueValue,
    properties = {},
  ) {
    const existing = await getContactByCustomField(uniquePropName, uniqueValue, ['id']);
    const toSend = toPropertiesObject(properties);

    if (existing) {
      const id = existing.id || existing.hs_object_id;
      const res = await client.patch(`${base}/${id}`, toSend);
      return res && res.data ? res.data : res;
    }

    // Ensure the unique field is included in the creation payload
    const createPayload = toPropertiesObject({
      ...properties,
      [uniquePropName]: uniqueValue,
    });
    const res = await client.post(base, createPayload);
    return res && res.data ? res.data : res;
  }

  async function getAllContacts(
    properties = ['email', 'firstname', 'lastname'],
    limit = 100,
  ) {
    const props = Array.isArray(properties) ? properties : [];

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

    const allFromList = await fetchAllPages(
      ({ limit: l, after }) =>
        client.get(base, {
          params: { limit: l, after, properties: props.join(',') },
        }),
      limit,
    );

    return allFromList;
  }

  // --------------------------Batch APis---------------------------

  // async function batchCreateContacts()

  return {
    // ------------------------------Single Contact------------------------------------------------
    createContact: (properties) => client.post(base, toPropertiesObject(properties)),
    getContact: (id, properties = []) =>
      client.get(`${base}/${id}`, {
        params: {
          properties: Array.isArray(properties) ? properties.join(',') : properties,
        },
      }),
    getContactWithParameters: (params) => client.get(`${base}${params}`),
    searchContacts: (filterGroups = [], properties = [], limit = 50, after = null) =>
      client.post(`${base}/search`, { filterGroups, properties, limit, after }),
    updateContact: (id, properties) =>
      client.patch(`${base}/${id}`, toPropertiesObject(properties)),
    getContactByEmail,
    getContactByCustomField,
    upsertContactByEmail,
    upsertContactByCustomField,
    getAllContacts,

    // --------------------------Batch APis---------------------------
    batchCreate: (payload) => client.post(`${base}/batch/create`, payload),
    batchSearch: (payload) => client.post(`${base}/batch/read`, payload),
    batchUpdate: (payload) => client.post(`${base}/batch/update`, payload),
    batchUpsert: (payload) => client.post(`${base}/batch/upsert`, payload),
  };
}

export { makeContacts };
