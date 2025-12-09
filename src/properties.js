function makeProperties(client) {
  return {
    createCustomProperty: (
      objectType,
      name,
      label,
      type = 'string',
      fieldType = 'text',
      groupName = 'contactinformation',
      options = [],
    ) =>
      client.post(`/crm/v3/properties/${objectType}`, {
        name,
        label,
        type,
        fieldType,
        groupName,
        options,
      }),

    updateCustomProperty: (objectType, propertyName, updates) =>
      client.patch(`/crm/v3/properties/${objectType}/${propertyName}`, updates),

    listCustomProperties: (objectType) => client.get(`/crm/v3/properties/${objectType}`),
  };
}
export { makeProperties };
