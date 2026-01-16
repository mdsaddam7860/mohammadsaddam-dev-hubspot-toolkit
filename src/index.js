import { createHubspotClient } from './http/hubspotClient.js';
import { makeContacts } from './crm/contacts.js';
import { makeCompanies } from './crm/companies.js';
import { makeDeals } from './crm/deals.js';
import { makeNotes } from './crm/deals.js';
import { makeMeetings } from './crm/deals.js';
import { makeTickets } from './crm/tickets.js';
import { makeAssociations } from './crm/associations.js';
import { makeProperties } from './crm/properties.js';
import { makeCustomObject } from './crm/customObjects.js';
import { clean } from './utils/toPropertiesObject.js';

export function createClient(cfg) {
  const client = createHubspotClient(cfg);

  return {
    client,

    // Standard CRM objects
    contacts: makeContacts(client),
    companies: makeCompanies(client),
    deals: makeDeals(client),
    tickets: makeTickets(client),
    associations: makeAssociations(client),
    notes: makeNotes(client),
    meetings: makeMeetings(client),
    properties: makeProperties(client),

    // Custom object factory
    customObject(objectType) {
      return makeCustomObject(client, objectType);
    },

    // Utils
    clean,
  };
}
