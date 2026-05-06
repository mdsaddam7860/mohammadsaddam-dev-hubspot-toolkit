function makeAssociations(client) {
  /**
   * Generic association creator
   * Works for:
   * - standard ↔ standard
   * - standard ↔ custom
   * - custom ↔ custom
   */
  async function associate(
    fromType,
    fromId,
    toType,
    toId,
    associationTypeId,
    associationCategory = 'HUBSPOT_DEFINED',
  ) {
    if (!fromType || !fromId || !toType || !toId || !associationTypeId) {
      throw new Error(
        'fromType, fromId, toType, toId, and associationTypeId are required',
      );
    }

    const payload = {
      inputs: [
        {
          from: { id: String(fromId) },
          to: { id: String(toId) },
          types: [
            {
              associationCategory,
              associationTypeId,
            },
          ],
        },
      ],
    };

    return client.post(
      `/crm/v4/associations/${fromType}/${toType}/batch/create`,
      payload,
    );
  }

  /**
   * Creates multiple associations in a single API call.
   * @param {string} fromType - e.g., 'deals'
   * @param {string} toType - e.g., 'tasks'
   * @param {Array} associationPairs - Array of { fromId, toId }
   * @param {number} associationTypeId - The ID for the association type (e.g., 215)
   */
  async function batchAssociate(
    fromType,
    toType,
    associationPairs,
    associationTypeId,
    associationCategory = 'HUBSPOT_DEFINED',
  ) {
    if (!fromType || !toType || !associationPairs || !associationPairs.length) {
      throw new Error('Missing required parameters for batch association');
    }

    // Transform your array of IDs into the HubSpot Batch format
    const payload = {
      inputs: associationPairs.map((pair) => ({
        from: { id: String(pair.fromId) },
        to: { id: String(pair.toId) },
        types: [
          {
            associationCategory,
            associationTypeId,
          },
        ],
      })),
    };

    // This sends EVERYTHING in the payload.inputs array in one go
    return client.post(
      `/crm/v4/associations/${fromType}/${toType}/batch/create`,
      payload,
    );
  }

  /** Convenience helpers (backward-compatible) */
  const associateContactToCompany = (contactId, companyId, type = 'contact_to_company') =>
    associate('contacts', contactId, 'companies', companyId, type);

  const associateContactToDeal = (contactId, dealId, type = 'contact_to_deal') =>
    associate('contacts', contactId, 'deals', dealId, type);

  const associateCompanyToDeal = (companyId, dealId, type = 'company_to_deal') =>
    associate('companies', companyId, 'deals', dealId, type);

  /** Fetch associations */
  const getAssociations = (fromType, fromId, toType, limit = 100, after) =>
    client.get(`/crm/v3/objects/${fromType}/${fromId}/associations/${toType}`, {
      params: { limit, after },
    });

  return {
    batchAssociate, // 🔥 NEW (generic) Batch Association
    associate, // 🔥 NEW (generic)
    associateContactToCompany,
    associateContactToDeal,
    associateCompanyToDeal,
    getAssociations,
  };
}

export { makeAssociations };
