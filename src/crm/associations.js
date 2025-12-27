/*function makeAssociations(client) {
  return {
    associateContactToCompany: (contactId, companyId, type = 'contact_to_company') =>
      client.post('/crm/v4/associations/contacts/companies/batch/create', {
        inputs: [{ from: { id: contactId }, to: { id: companyId }, type }],
      }),

    associateContactToDeal: (contactId, dealId, type = 'contact_to_deal') =>
      client.post('/crm/v4/associations/contacts/deals/batch/create', {
        inputs: [{ from: { id: contactId }, to: { id: dealId }, type }],
      }),

    associateCompanyToDeal: (companyId, dealId, type = 'company_to_deal') =>
      client.post('/crm/v4/associations/companies/deals/batch/create', {
        inputs: [{ from: { id: companyId }, to: { id: dealId }, type }],
      }),

    getAssociations: (fromType, fromId, toType, limit = 100, after = null) =>
      client.get(`/crm/v3/objects/${fromType}/${fromId}/associations/${toType}`, {
        limit,
        after,
      }),
  };
}
export { makeAssociations };
*/

function makeAssociations(client) {
  /**
   * Generic association creator
   * Works for:
   * - standard ↔ standard
   * - standard ↔ custom
   * - custom ↔ custom
   */
  async function associate(fromType, fromId, toType, toId, associationType) {
    if (!fromType || !fromId || !toType || !toId) {
      throw new Error('fromType, fromId, toType, and toId are required');
    }

    return client.post(`/crm/v4/associations/${fromType}/${toType}/batch/create`, {
      inputs: [
        {
          from: { id: fromId },
          to: { id: toId },
          type: associationType,
        },
      ],
    });
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
    associate, // 🔥 NEW (generic)
    associateContactToCompany,
    associateContactToDeal,
    associateCompanyToDeal,
    getAssociations,
  };
}

export { makeAssociations };
