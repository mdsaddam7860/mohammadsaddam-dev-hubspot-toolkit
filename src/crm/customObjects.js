import { toPropertiesObject } from '../utils/toPropertiesObject.js';
import { fetchAllPages } from '../utils/fetchAllPages.js';

function makeCustomObject(client, objectType) {
  if (!objectType || typeof objectType !== 'string') {
    throw new Error('objectType must be a valid HubSpot object type string');
  }

  const base = `/crm/v3/objects/${objectType}`;
  const SEARCH_LIMIT = 100;

  /** Create */
  async function create(props) {
    return client.post(base, toPropertiesObject(props));
  }

  /** Get by ID */
  async function getById(id, properties = []) {
    if (!id) throw new Error('ID is required');

    return client.get(`${base}/${id}`, {
      params: { properties },
    });
  }

  /** Search */
  async function search({
    filterGroups = [],
    properties = [],
    limit = SEARCH_LIMIT,
    after,
  } = {}) {
    return client.post(`${base}/search`, {
      filterGroups,
      properties,
      limit,
      after,
    });
  }

  /** Fetch ALL records (auto-pagination) */
  async function fetchAll({
    filterGroups = [],
    properties = [],
    limit = SEARCH_LIMIT,
  } = {}) {
    let after;
    const results = [];

    do {
      const { data } = await client.post(`${base}/search`, {
        filterGroups,
        properties,
        limit,
        after,
      });

      results.push(...(data.results || []));
      after = data.paging?.next?.after;
    } while (after);

    return results;
  }

  /** Update */
  async function update(id, props) {
    if (!id) throw new Error('ID is required');

    return client.patch(`${base}/${id}`, toPropertiesObject(props));
  }

  /** Archive */
  async function archive(id) {
    if (!id) throw new Error('ID is required');

    return client.delete(`${base}/${id}`);
  }

  /**
   * Upsert (search by unique property)
   * @param {string} uniqueProperty - property name (e.g. "external_id")
   * @param {string} uniqueValue
   * @param {object} props
   */
  async function upsert(uniqueProperty, uniqueValue, props) {
    if (!uniqueProperty || !uniqueValue) {
      throw new Error('uniqueProperty and uniqueValue are required for upsert');
    }

    const { data } = await client.post(`${base}/search`, {
      filterGroups: [
        {
          filters: [
            {
              propertyName: uniqueProperty,
              operator: 'EQ',
              value: uniqueValue,
            },
          ],
        },
      ],
      limit: 1,
    });

    const existing = data.results?.[0];

    if (existing) {
      return client.patch(`${base}/${existing.id}`, toPropertiesObject(props));
    }

    return client.post(
      base,
      toPropertiesObject({
        ...props,
        [uniqueProperty]: uniqueValue,
      }),
    );
  }
  return { create, getById, search, fetchAll, update, archive, upsert };
}
export { makeCustomObject };
