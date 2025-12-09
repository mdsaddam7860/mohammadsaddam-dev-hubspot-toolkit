import { createHubspotClient } from './http/hubspotClient.js';
import { makeContacts } from './contacts.js';
import { makeCompanies } from './companies.js';
import { makeDeals } from './deals.js';
import { makeAssociations } from './associations.js';
import { makeProperties } from './properties.js';
import { clean } from './utils.js';
// old Implementation
// export function createClient(cfg) {
//   const client = createHubspotClient(cfg);

//   const contacts = makeContacts(client);
//   const companies = makeCompanies(client);
//   const deals = makeDeals(client);
//   const associations = makeAssociations(client);
//   const properties = makeProperties(client);

//   // -------------------------------------------------------
//   //  UPSERT CONTACT BY EMAIL
//   // -------------------------------------------------------
//   async function upsertContactByEmail(email, props = {}) {
//     const res = await client.post('/crm/v3/objects/contacts/search', {
//       filterGroups: [
//         {
//           filters: [{ propertyName: 'email', operator: 'EQ', value: email }],
//         },
//       ],
//       properties: ['email'],
//       limit: 1,
//     });

//     const found = res.data?.results?.[0];

//     if (found) {
//       return contacts.updateContact(found.id, props);
//     }

//     return contacts.createContact({ email, ...props });
//   }

//   // -------------------------------------------------------
//   //  FIND OR CREATE COMPANY BY DOMAIN
//   // -------------------------------------------------------
//   async function findOrCreateCompanyByDomain(domain, props = {}) {
//     const res = await client.post('/crm/v3/objects/companies/search', {
//       filterGroups: [
//         {
//           filters: [{ propertyName: 'domain', operator: 'EQ', value: domain }],
//         },
//       ],
//       properties: ['domain'],
//       limit: 1,
//     });

//     const found = res.data?.results?.[0];

//     if (found) {
//       return companies.updateCompany(found.id, props);
//     }

//     return companies.createCompany({ domain, ...props });
//   }

//   // -------------------------------------------------------
//   //  CREATE DEAL + ASSOCIATIONS
//   // -------------------------------------------------------
//   async function createDealWithAssociations(
//     dealProps,
//     contactId = null,
//     companyId = null,
//   ) {
//     const dealRes = await deals.createDeal(dealProps);

//     const dealId = dealRes.id || dealRes.data?.id;
//     if (!dealId) throw new Error('Failed to create deal — missing ID.');

//     if (contactId) {
//       await associations.associateContactToDeal(contactId, dealId);
//     }

//     if (companyId) {
//       await associations.associateCompanyToDeal(companyId, dealId);
//     }

//     return dealRes;
//   }

//   return {
//     contacts,
//     companies,
//     deals,
//     associations,
//     properties,
//     upsertContactByEmail,
//     findOrCreateCompanyByDomain,
//     createDealWithAssociations,
//     client,
//     clean,
//   };
// }

function normalizeResponse(res) {
  // Accept either:
  // - full axios response { data: { ... } }
  // - already-stripped data { results: [...], paging: {...} }
  if (!res) return null;
  if (res && typeof res === 'object' && 'data' in res) return res.data;
  return res;
}

export function createClient(cfg) {
  const client = createHubspotClient(cfg);

  const contacts = makeContacts(client);
  const companies = makeCompanies(client);
  const deals = makeDeals(client);
  const associations = makeAssociations(client);
  const properties = makeProperties(client);

  // -------------------------------------------------------
  //  UPSERT CONTACT BY EMAIL (prefer module-level helper)
  // -------------------------------------------------------
  async function upsertContactByEmail(email, props = {}) {
    // use the contacts module's helper (we implemented upsertContactByEmail there)
    if (typeof contacts.upsertContactByEmail === 'function') {
      return contacts.upsertContactByEmail(email, props);
    }

    // fallback to direct search + create/update (backwards compatible)
    const res = await client.post('/crm/v3/objects/contacts/search', {
      filterGroups: [
        { filters: [{ propertyName: 'email', operator: 'EQ', value: email }] },
      ],
      properties: ['email'],
      limit: 1,
    });

    const data = normalizeResponse(res);
    const found = data?.results?.[0];

    if (found) {
      return contacts.updateContact(found.id, props);
    }

    return contacts.createContact({ email, ...props });
  }

  // -------------------------------------------------------
  //  FIND OR CREATE COMPANY BY DOMAIN
  // -------------------------------------------------------
  async function findOrCreateCompanyByDomain(domain, props = {}) {
    // Use searchCompanies if you want, but normalize its response
    const res = await client.post('/crm/v3/objects/companies/search', {
      filterGroups: [
        { filters: [{ propertyName: 'domain', operator: 'EQ', value: domain }] },
      ],
      properties: ['domain'],
      limit: 1,
    });

    const data = normalizeResponse(res);
    const found = data?.results?.[0];

    if (found) {
      return companies.updateCompany(found.id, props);
    }

    return companies.createCompany({ domain, ...props });
  }

  // -------------------------------------------------------
  //  CREATE DEAL + ASSOCIATIONS
  // -------------------------------------------------------
  async function createDealWithAssociations(
    dealProps,
    contactId = null,
    companyId = null,
  ) {
    // createDeal returns an axios response or data — normalize it
    const dealResRaw = await deals.createDeal(dealProps);
    const dealRes = normalizeResponse(dealResRaw);

    // HubSpot create endpoint returns { id: '...', ... } under data
    const dealId = dealRes?.id || dealResRaw?.id;
    if (!dealId) throw new Error('Failed to create deal — missing ID.');

    if (contactId) {
      await associations.associateContactToDeal(contactId, dealId);
    }

    if (companyId) {
      await associations.associateCompanyToDeal(companyId, dealId);
    }

    // return the original raw result (consistent with other create* behavior)
    return dealResRaw;
  }

  return {
    contacts,
    companies,
    deals,
    associations,
    properties,
    upsertContactByEmail,
    findOrCreateCompanyByDomain,
    createDealWithAssociations,
    client,
    clean,
  };
}
