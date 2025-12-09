# @mohammadsaddam-dev/hubspot-toolkit

A lightweight and developer-friendly ES Modules toolkit for interacting with HubSpot CRM APIs.  
Supports Contacts, Companies, Deals, Associations, Custom Properties, Search, Pagination, and clean utility helpers.

![npm version](https://img.shields.io/npm/v/@mohammadsaddam-dev/hubspot-toolkit)
![npm downloads](https://img.shields.io/npm/dm/@mohammadsaddam-dev/hubspot-toolkit)
![license](https://img.shields.io/npm/l/@mohammadsaddam-dev/hubspot-toolkit)

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

## 📦 Installation

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

## 📘 Usage Examples

### ➤ Create Contact

```js
import { contacts } from "@mohammadsaddam-dev/hubspot-toolkit";

const response = await contacts.create({
  email: "john@example.com",
  firstname: "John",
  lastname: "Doe",
});

console.log(response);
```

---

### ➤ Update Contact

```js
await contacts.update("12345", {
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

### ➤ Fetch All contacts

```js
const all = await hubspot.contacts.getAllContacts();
console.log("Total contacts:", all.length);
```


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

### ➤ Associate Deal ↔ Contact

```js
import { associations } from "@mohammadsaddam-dev/hubspot-toolkit";

await associations.create(
  "deal",
  "contact",
  "deal_id_here",
  "contact_id_here"
);
```

---

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

---

## 📁 Project Structure

```
src/
  ├── contacts.js
  ├── companies.js
  ├── deals.js
  ├── associations.js
  ├── properties.js
  ├── utils.js
  └── http/
      └── hubspotClient.js
```

---

## 🧪 Environment Variables

```
HUBSPOT_API_KEY=your-private-app-token
```

---

## 🛠️ Error Handling

```js
try {
  await contacts.get("invalid-id");
} catch (err) {
  console.error("HubSpot Error:", err.message);
}
```

---

## 📝 License

MIT © Mohammad Saddam
