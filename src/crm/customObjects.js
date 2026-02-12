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
  // async function fetchAll({
  //   filterGroups = [],
  //   properties = [],
  //   limit = SEARCH_LIMIT,
  // } = {}) {
  //   let after;
  //   const results = [];

  //   do {
  //     const response = await client.post(`${base}/search`, {
  //       filterGroups,
  //       properties,
  //       limit,
  //       after,
  //     });

  //     const data = response?.data;

  //     results.push(...(data?.results || []));
  //     after = data?.paging?.next?.after;
  //   } while (after);

  //   return results;
  // }

  async function fetchAll({
    filterGroups = [],
    properties = ['hs_object_id'],
    limit = SEARCH_LIMIT,
  } = {}) {
    let after;
    const results = [];

    do {
      const { data } = await client.post(`${base}/search`, {
        filterGroups,
        properties,

        limit,
        ...(after && { after }),
      });

      // 🔴 HubSpot custom object search limitation
      if (!data || !Array.isArray(data.results)) {
        console.warn(
          `[HubSpot] Search not supported for custom object ${objectType}`,
          data,
        );
        return [];
      }

      results.push(...data.results);
      after = data?.paging?.next?.after;
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
  async function getCustomObjectByCustomField(propertyName, value, properties = []) {
    return _searchOne(propertyName, value, properties);
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
  return {
    create,
    getById,
    search,
    fetchAll,
    update,
    archive,
    upsert,
    getCustomObjectByCustomField,
  };
}
export { makeCustomObject };
