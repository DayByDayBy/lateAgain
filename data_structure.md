# Bus Company Data Structure and Population Plan

## Overview
This document defines the data structure and population strategy for bus companies, regulatory bodies, and useful information resources.

## Extended Companies Table Structure

### Fields Added to Companies Table
- `website` (TEXT): Company/regulatory website URL
- `phone` (TEXT): Contact phone number
- `address` (TEXT): Physical address or headquarters location
- `category` (TEXT): 'bus_company' or 'regulatory_body'
- `priority` (TEXT): 'must', 'should', or 'could' (for implementation prioritization)
- `region` (TEXT): Geographic scope (e.g., 'Scotland', 'UK-wide')

## Bus Companies Data

### MUST Companies (Priority Implementation)
```json
[
  {
    "name": "First Bus",
    "email": "enquiries@firstbus.co.uk",
    "transport_type": "Bus",
    "website": "https://www.firstbus.co.uk",
    "phone": "0344 800 4411",
    "address": "FirstGroup plc, 395 King Street, Aberdeen AB24 5RP",
    "category": "bus_company",
    "priority": "must",
    "region": "UK-wide",
    "notes": "Major bus operator across the UK - contact via website form or phone for specific inquiries. Alternative: complaints@firstbus.co.uk for delay complaints"
  },
  {
    "name": "Stagecoach",
    "email": "enquiries@stagecoachbus.com",
    "transport_type": "Bus",
    "website": "https://www.stagecoachbus.com",
    "phone": "0345 121 0170",
    "address": "Stagecoach Group plc, 10 Dunkeld Road, Perth PH1 5TW",
    "category": "bus_company",
    "priority": "must",
    "region": "UK-wide",
    "notes": "Major UK bus and coach operator"
  },
  {
    "name": "Lothian Buses",
    "email": "enquiries@lothianbuses.com",
    "transport_type": "Bus",
    "website": "https://www.lothianbuses.com",
    "phone": "0131 554 4494",
    "address": "Lothian Buses plc, 55 Annandale Street, Edinburgh EH7 4AZ",
    "category": "bus_company",
    "priority": "must",
    "region": "Scotland",
    "notes": "Edinburgh and Lothians bus operator"
  }
]
```

### SHOULD Companies (Secondary Priority)
```json
[
  {
    "name": "McGill's Bus Services",
    "email": "info@mcgillsbuses.co.uk",
    "transport_type": "Bus",
    "website": "https://www.mcgillsbuses.co.uk",
    "phone": "01506 432 501",
    "address": "McGill's Bus Services Ltd, 1 McGill's Court, Whitburn, Bathgate EH47 0AU",
    "category": "bus_company",
    "priority": "should",
    "region": "Scotland",
    "notes": "West Lothian bus operator"
  }
]
```

### COULD Companies (Future Implementation)
```json
[
  {
    "name": "Scottish Citylink",
    "email": "enquiries@citylink.co.uk",
    "transport_type": "Coach",
    "website": "https://www.citylink.co.uk",
    "phone": "0871 266 3333",
    "address": "Scottish Citylink Coaches Ltd, Buchanan Bus Station, Killermont Street, Glasgow G2 3NW",
    "category": "bus_company",
    "priority": "could",
    "region": "Scotland",
    "notes": "National coach network in Scotland"
  },
  {
    "name": "Megabus",
    "email": "help@uk.megabus.com",
    "transport_type": "Coach",
    "website": "https://uk.megabus.com",
    "phone": "0141 332 2345",
    "address": "Megabus, 1st Floor, 302 St Vincent Street, Glasgow G2 5RZ",
    "category": "bus_company",
    "priority": "could",
    "region": "UK-wide",
    "notes": "Budget coach service"
  }
]
```

## Regulatory Bodies Data

```json
[
  {
    "name": "Bus Users Scotland",
    "email": "info@bususersscotland.org.uk",
    "transport_type": "Regulatory",
    "website": "https://www.bususersscotland.org.uk",
    "phone": "0141 332 9988",
    "address": "Bus Users Scotland, 153 London Road, Glasgow G1 5BJ",
    "category": "regulatory_body",
    "priority": "must",
    "region": "Scotland",
    "notes": "Scottish bus passenger watchdog and advocacy group"
  },
  {
    "name": "Traffic Commissioner",
    "email": "enquiries@trafficcommissioner.gov.uk",
    "transport_type": "Regulatory",
    "website": "https://www.gov.uk/government/organisations/traffic-commissioners",
    "phone": "0300 123 9000",
    "address": "Traffic Commissioner for Scotland, George House, 36 North Hanover Street, Glasgow G1 2AD",
    "category": "regulatory_body",
    "priority": "must",
    "region": "Scotland",
    "notes": "Regulates bus operators and enforces standards"
  },
  {
    "name": "DVSA",
    "email": "information@dvsa.gov.uk",
    "transport_type": "Regulatory",
    "website": "https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency",
    "phone": "0300 123 9000",
    "address": "Driver and Vehicle Standards Agency, Berkeley House, Croydon Street, Bristol BS5 6EB",
    "category": "regulatory_body",
    "priority": "must",
    "region": "UK-wide",
    "notes": "Ensures road safety and vehicle standards"
  }
]
```

## Useful Information Data Structure

### Useful Info Table Structure
- `id` (UUID): Primary key
- `title` (TEXT): Information title
- `content` (TEXT): Detailed information content
- `category` (TEXT): Category classification
- `priority` (INTEGER): Display priority/order
- `region` (TEXT): Geographic scope

### Sample Useful Information Entries

```json
[
  {
    "title": "Passenger Rights",
    "content": "Under UK law, bus passengers have rights to reliable service, compensation for delays, and assistance for disabled passengers. Contact your operator or regulatory body if your rights are not being respected.",
    "category": "passenger_rights",
    "priority": 1,
    "region": "UK-wide"
  },
  {
    "title": "Reporting Bus Issues",
    "content": "Report bus service issues to your local operator first. If unresolved, contact the Traffic Commissioner or passenger advocacy groups like Bus Users Scotland.",
    "category": "complaints",
    "priority": 2,
    "region": "Scotland"
  },
  {
    "title": "Accessibility Information",
    "content": "Most UK buses are wheelchair accessible. Contact your operator for accessibility information or assistance planning your journey.",
    "category": "accessibility",
    "priority": 3,
    "region": "UK-wide"
  }
]
```

## Population Strategy

### Phase 1: Core Implementation
1. Extend companies table with new fields
2. Populate MUST companies and regulatory bodies
3. Create useful_info table with basic entries
4. Update RLS policies

### Phase 2: Enhancement
1. Add SHOULD companies
2. Expand useful information content
3. Implement search and filtering

### Phase 3: Future Expansion
1. Add COULD companies
2. Implement user feedback for data accuracy
3. Add regional variations

## Data Maintenance
- Admin interface for updating contact information
- Quarterly review process
- User reporting mechanism for outdated information
- Version tracking for data changes