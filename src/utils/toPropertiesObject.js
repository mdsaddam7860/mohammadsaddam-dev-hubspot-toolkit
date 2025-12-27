function clean(obj = {}) {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== ''),
  );
}

function toPropertiesObject(props = {}) {
  // HubSpot expects { properties: { a: 'x' } }
  return { properties: clean(props) };
}

export { clean, toPropertiesObject };
