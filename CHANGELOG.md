# Changelog

## 2.1.0 – 2026-03-30
### Added
  - Add rate Limit Logic, also implement metadata in client function to get rate limit info 
  - Add Typescript functionalities to the hubspot-toolkit


## 2.0.1 – 2026-02-27
### Added

## 0.7.0 – 2025-12-28
### Added

  - Added meetings object type
  - Added `createMeeting` helper
  - Added `updateMeeting` helper
  - Added `searchMeeting` helper
  - Added notes object type
  - Added `createNote` helper
  - Added `updateNote` helper
  - Added `searchNote` helper
## 0.3.4 – 2025-12-28
### Added

  - Added ticket object type
  - Added `getAllTickets` helper
  - Added `createTicket` helper
  - Added `updateTicket` helper
  - Added `searchTicket` helper
  -
## 0.3.0 – 2025-12-28
### Added
- Added **Custom Objects API support**
  - Create, get by ID, search
  - Fetch all records with automatic pagination
  - Update and archive (soft delete)
  - Search-based upsert using unique properties
- Added **Associations API (CRM v4)**
  - Contact ↔ Company
  - Contact ↔ Deal
  - Company ↔ Deal
  - **Custom Object Associations**
    - Associate custom objects with standard objects (contacts, companies, deals)
    - Associate custom objects with other custom objects
    - Support for custom association types
- Added **Properties API**
  - Create custom properties
  - Update existing properties
  - List properties for any object type (standard & custom)
- Added automatic **search pagination helpers** for large datasets
- Added input validation for required IDs, object types, and unique fields

### Improved
- Refactored CRM modules to follow a consistent **factory pattern**
- Improved ES Module structure and clean architecture separation
- Normalized property payloads using `toPropertiesObject`
- Improved code readability, reusability, and maintainability
- Made custom object



## 0.2.0 - 2025-12-10
### Added
- Added full ESM support (`"type": "module"`)
- Added built-in lightweight HubSpot HTTP client
- Added pagination helper (`fetchAllPages`) to fetch all pages of results
- Added upsert helpers (contact by email, company by domain)
- Added `getAllContacts()` and `getAllCompanies()` helpers
- Added improved associations (V4 batch + simplified helper)
- Added more realistic usage examples (CRUD, search, associations)
- Added environment variables section
- Added error handling examples 
- Added jitter delay
- Added throttling and retry removed p-retry

### Improved
- Major README rewrite with organized examples, structure, and instructions
- Refined project folder layout documentation
- Updated installation & setup sections
- Clean and improved exports structure for ES modules

## 0.2.0 - 2025-12-10
### Added
- Added full ESM support (`"type": "module"`)
- Added built-in lightweight HubSpot HTTP client
- Added pagination helper (`fetchAllPages`)
- Added upsert helpers (contact by email, company by domain)
- Added `getAllContacts()` and `getAllCompanies()` helpers
- Added improved associations (V4 batch + simplified helper)
- Added more realistic usage examples (CRUD, search, associations)
- Added environment variables section
- Added error handling examples

### Improved
- Major README rewrite with organized examples, structure, and instructions
- Refined project folder layout documentation
- Updated installation & setup sections
- Clean and improved exports structure for ES modules

---

## 0.1.1 - 2025-12-04
### Added
- Improved README
- Added installation instructions
- Updated usage examples

---

## 0.1.0 - 2025-12-04
### Initial Release
- Contacts API
- Deals API
- Companies API
- Properties API
- Associations API
