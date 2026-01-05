# @mohammadsaddam-dev/hubspot-toolkit

A lightweight and developer-friendly ES Modules toolkit for interacting with HubSpot CRM APIs.  
Supports Contacts, Companies, Deals, Associations, Custom Properties, Search, Pagination, and clean utility helpers.

![npm version](https://img.shields.io/npm/v/@mohammadsaddam-dev/hubspot-toolkit)
![npm downloads](https://img.shields.io/npm/dm/@mohammadsaddam-dev/hubspot-toolkit)
![license](https://img.shields.io/npm/l/@mohammadsaddam-dev/hubspot-toolkit)

## 📚 Table of Contents

- [Installation](#installation)
- [Usage](#usage-examples)
- [API Reference](#api-reference)
  - [Contacts](#contacts-api)
  - [Companies](#companies-api)
  - [Deals](#deals-api)
  - [Associations](#associations-api)
  - [Properties](#properties-api)
  - [Custom Objects](#custom-objects-api)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Error Handling](#error-handling)
- [Hubspot Limitations](#hubspot-limitations)

---

## 🚀 Features

✓ Contacts / Companies / Deals CRUD + Search  
✓ Associations (V4 batch + simple helpers)  
✓ Custom Properties API  
✓ Pagination helper (`fetchAllPages`)  
✓ Upsert helpers (contact by email, company by domain)  
✓ Supports API Key (Private App Token) & Access Token  
✓ Clean lightweight built-in HubSpot HTTP client  
✓ Fully ESM (`"type": "module"`)  

---

## Installation

```bash
npm install @mohammadsaddam-dev/hubspot-toolkit@latest
```


---

## 🔧 Setup

```js
import { createClient } from "@mohammadsaddam-dev/hubspot-toolkit";

const hubspot = createClient({
  apiKey: process.env.HUBSPOT_API_KEY,   // or ACCESS TOKEN
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN, 
});
```
If both are provided, accessToken is used.

---

## Usage Examples


## Contacts API


### ➤ Create Contact

```js

await hubspot.contacts.create({
  email: "john@example.com",
  firstname: "John",
  lastname: "Doe",
});

console.log(response);
```

---

### ➤ Update Contact

```js
await contacts.updateContact("12345", {
  firstname: "Updated Name",
});
```

---

### ➤ Get Contact by ID

```js
const data = await contacts.get("12345");
console.log(data);
```

---

### ➤ Fetch All Contacts

```js
const all = await hubspot.contacts.getAllContacts();
console.log("Total contacts:", all.length);
```


## Deals API

### ➤ Create Deal

```js
import { deals } from "@mohammadsaddam-dev/hubspot-toolkit";

await deals.create({
  dealname: "New Integration Deal",
  amount: 5000,
  dealstage: "appointmentscheduled",
});
```


---

## Companies API

### ➤ Fetch All Companies

```js
const companies = await hubspot.companies.getAllCompanies();
console.log(companies);
```

---

### ➤ Fetch Deal Properties

```js
import { properties } from "@mohammadsaddam-dev/hubspot-toolkit";

const dealProps = await properties.get("deals");
console.log(dealProps);
```

## Associations API
<!-- 🔗 Associations API -->

### Manage relationships between HubSpot CRM objects using the CRM v4 Associations API.

### This module is exposed via client.associations.

### ➤ Custom Object → Contact

```js
await client.associations.associate(
  'p_tickets',
  ticketId,
  'contacts',
  contactId,
  'ticket_to_contact',
);

```
### ➤ Custom Object → Custom Object

```js
await client.associations.associate(
  'p_orders',
  orderId,
  'p_tickets',
  ticketId,
  'order_to_ticket',
);


```
---
### Associate Contact → Company

### Create an association between a contact and a company.
```js
await client.associations.associateContactToCompany(
  contactId,
  companyId
);
```
---
### Custom Association Type
```js
await client.associations.associateContactToCompany(
  contactId,
  companyId,
  'contact_to_company'
);
```

---
### Associate Contact → Deal

### Create an association between a contact and a deal.
```js
await client.associations.associateContactToDeal(
  contactId,
  dealId
);

```

---
### Associate Company → Deal

### Create an association between a company and a deal.
```js
await client.associations.associateCompanyToDeal(
  companyId,
  dealId
);
```
---
### Get Associations

### Retrieve associated records for an object.
```js
const associations = await client.associations.getAssociations(
  'contacts',
  contactId,
  'deals'
);
```
---
| Name       | Type     | Description                                                    |
| ---------- | -------- | -------------------------------------------------------------- |
| `fromType` | `string` | Source object type (`contacts`, `companies`, `deals`, `p_xxx`) |
| `fromId`   | `string` | Source object ID                                               |
| `toType`   | `string` | Target object type                                             |
| `limit`    | `number` | Number of results (default: 100)                               |
| `after`    | `string` | Pagination cursor                                              |

---
🧠 Design Notes

- Uses CRM v4 batch association endpoints

- One association per call (safe & explicit)

- Supports standard and custom objects

- Allows custom association types

---

⚠️ HubSpot Notes & Limitations

- Association types must exist in HubSpot

- Some object pairs require predefined types

- Batch endpoints still allow single-item payloads

- Pagination applies when fetching associations

---

🔧 Recommended Usage

- Create associations immediately after record creation

- Reuse known association types

- Avoid hardcoding IDs inside business logic

- Prefer batch endpoints for future scalability
---
## Properties API

### Manage HubSpot CRM properties (standard & custom) for contacts, companies, deals, and custom objects using the CRM v3 Properties API.

### This module is exposed via client.properties.
---


### ➤ Creates a new custom property for a given object type.

```js
await client.properties.createCustomProperty(
  'contacts',
  'external_id',
  'External ID',
  'string',
  'text',
  'contactinformation'
);
```


| Name         | Type     | Description                                                     |
| ------------ | -------- | --------------------------------------------------------------- |
| `objectType` | `string` | HubSpot object type (`contacts`, `companies`, `deals`, `p_xxx`) |
| `name`       | `string` | Internal property name (snake_case recommended)                 |
| `label`      | `string` | Human-readable label                                            |
| `type`       | `string` | Data type (`string`, `number`, `enumeration`, etc.)             |
| `fieldType`  | `string` | UI field type (`text`, `select`, `textarea`, etc.)              |
| `groupName`  | `string` | Property group (default: `contactinformation`)                  |
| `options`    | `array`  | Required for `enumeration` properties                           |


---

### ➤ Create an Enumeration Property (Example)
```js
await client.properties.createCustomProperty(
  'deals',
  'deal_priority',
  'Deal Priority',
  'enumeration',
  'select',
  'dealinformation',
  [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ]
);
```
---
### ➤ Update a Custom Property

### Update an existing custom property.

```js
await client.properties.updateCustomProperty(
  'contacts',
  'external_id',
  {
    label: 'External System ID',
    fieldType: 'text',
  }
);
```
### ⚠️ Not all property attributes are editable after creation.
### HubSpot enforces restrictions depending on the property type.
---
### ➤ List Properties for an Object Type

### Fetch all properties (standard + custom) for an object type.

```js
const props = await client.properties.listCustomProperties('contacts');
```

---

🧠 Design Notes

### Uses CRM v3 Properties API

### Supports standard objects and custom objects

### Keeps property creation explicit and predictable

### Leaves validation to HubSpot (by design)

---

⚠️ HubSpot Limitations

### Property name is immutable once created

### Enumeration options cannot be removed if already in use

### Some property fields are locked after creation

---

🔧 Recommended Usage

### Create properties once during setup or migrations
### Avoid dynamic property creation at runtime

### Enforce naming conventions (snake_case)

### Use consistent groupName across environments

---
## Custom Objects API


```js
const hubspot = createClient(cfg);
const tickets = hubspot.customObject('p_tickets');

await tickets.create({
  subject: 'Payment failed',
});

---
### 📘 API Reference
### create(props)

### Create a custom object record.
```js
const hubspot = createClient(cfg);
const tickets = hubspot.customObject('p_tickets');


const tickets = makeCustomObject(hubspotClient, 'p_tickets');
```


---
### getById(id, properties?)

### Fetch a record by ID.
```js
const ticket = await tickets.getById('12345', [
  'subject',
  'priority',
]);

```
---
### search(options)

### Search records using HubSpot search filters.
```js
const result = await tickets.search({
  filterGroups: [
    {
      filters: [
        {
          propertyName: 'priority',
          operator: 'EQ',
          value: 'high',
        },
      ],
    },
  ],
  properties: ['subject', 'priority'],
  limit: 10,
});


```
---
###fetchAll(options)

###Fetch all records using automatic pagination.
```js
const allTickets = await tickets.fetchAll({
  properties: ['subject', 'priority'],
});
```
### ⚠️ HubSpot does not provide a “get all” endpoint.
### This method internally paginates using /search.
---
### update(id, props)

### Update a record by ID.
```js
await tickets.update('12345', {
  priority: 'low',
});
```
---
###
```js```
---
### archive(id)

### Archive (soft delete) a record.
```js
await tickets.archive('12345');
```

---
### upsert(uniqueProperty, uniqueValue, props)

### Create or update a record using a unique property.
```js
await tickets.upsert(
  'external_id',
  'TICKET-001',
  {
    subject: 'Payment failed',
    priority: 'high',
  }
);
```
### How it works:

### 1. Searches for a record using the unique property

### 2. Updates if found

### 3. Creates if not found

⚠️ HubSpot does NOT support native upsert.
This is the recommended and safest approach.

### 🧠 Design Decisions

### Uses search-based pagination (HubSpot requirement)

### Explicit upsert to avoid hidden behavior

### Strict property normalization using toPropertiesObject

### No assumptions about object schema

### Client injected for testability

### 🛡️ Error Handling

### This module:

### Validates required inputs (id, objectType, unique fields)

### Prevents invalid payloads

### Relies on the client for:

         Retry logic

        Rate limit handling (429)

        Auth errors



---
### ⚠️ HubSpot Limitations to Know

### Max search limit: 100

### Search results are eventually consistent

### Unique properties must be enforced in HubSpot

### Nested objects are not allowed in property values
---


### Project Structure

```
src/
├── client/
│   └── hubspotClient.js
├── crm/
│   └── makeCustomObject.js
│   └── contacts.js
│   └── deals.js
│   └── properties.js
│   └── associations.js
│   └── companies.js
├── utils/
│   └── toPropertiesObject.js
│   └── retry.js
│   └── errors.js
│   └── fetchAllPages.js
└── index.js

```


### Environment Variables

```
HUBSPOT_API_KEY=your-private-app-key
HUBSPOT_ACCESS_TOKEN=your-private-access-token
```

---

### Error Handling

```js
try {
  await contacts.get("invalid-id");
} catch (err) {
  console.error("HubSpot Error:", err.message);
}
```


## Hubspot Limitations

- This toolkit is a thin abstraction over the HubSpot CRM APIs and therefore inherits the same platform limitations and behaviors.

- API Rate Limits

- HubSpot enforces strict rate limits per app and account

- Excessive requests may result in 429 Too Many Requests

- This toolkit does not retry automatically unless your HTTP client is configured to do so



## Recommendation:
- Add retry logic with exponential backoff and respect the Retry-After header.

- Search & Pagination

- HubSpot does not provide a “list all” endpoint

- All bulk reads use the /search API with cursor-based pagination

- Maximum search page size is 100 records

## Impact:

- Large datasets require multiple API calls

- Results may be eventually consistent

- Upsert Behavior

- HubSpot does not support native upsert operations

- The toolkit implements upsert as:

- Search by a unique property

- Update if found

- Create if not found

## Caveats:

- Duplicate records may occur if uniqueness is not enforced in HubSpot

- Search indexing delays can cause race conditions

- Property Constraints

- Property names are immutable once created

- Some property attributes cannot be updated after creation

- Enumeration options cannot be removed if already in use

- Nested objects are not supported as property values

## Associations

- Association types must already exist in HubSpot

- Some object pairs require predefined association types

- Deleting an object automatically removes its associations

- Custom Objects

- Custom object schemas must be created in HubSpot before use

- Object type names (p_xxx, 2-xxxxx) must be exact

- Property and association availability depends on schema configuration

## Error Handling

- API errors are returned directly from HubSpot

- Error messages and formats may change over time

- The toolkit does not mask or normalize HubSpot errors by default

- No Offline Validation

- Invalid requests will fail at the HubSpot API level

## 🧠 Design Philosophy

- This toolkit intentionally:

- Avoids over-abstracting HubSpot behavior

- Keeps API interactions explicit and predictable

- Leaves retries, caching, and advanced validation to the consumer

## 🔮 Planned Improvements (Optional)

- Automatic retry & rate-limit handling

- Idempotent helpers (safe create/update)

- Schema introspection utilities

- Batch operation helpers

---

### 📝 License

### MIT © Mohammad Saddam
