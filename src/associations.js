function makeAssociations(client) {
  return {
    associateContactToCompany: (
      contactId,
      companyId,
      type = "contact_to_company"
    ) =>
      client.post("/crm/v4/associations/contacts/companies/batch/create", {
        inputs: [{ from: { id: contactId }, to: { id: companyId }, type }],
      }),

    associateContactToDeal: (contactId, dealId, type = "contact_to_deal") =>
      client.post("/crm/v4/associations/contacts/deals/batch/create", {
        inputs: [{ from: { id: contactId }, to: { id: dealId }, type }],
      }),

    associateCompanyToDeal: (companyId, dealId, type = "company_to_deal") =>
      client.post("/crm/v4/associations/companies/deals/batch/create", {
        inputs: [{ from: { id: companyId }, to: { id: dealId }, type }],
      }),

    getAssociations: (fromType, fromId, toType, limit = 100, after = null) =>
      client.get(
        `/crm/v3/objects/${fromType}/${fromId}/associations/${toType}`,
        { limit, after }
      ),
  };
}
export { makeAssociations };
