# Bus Company Data and Useful Information Resources - Schema Design

## Overview
This document outlines the database schema extensions needed to implement comprehensive bus company data and useful information resources for the LateAgain app.

## Current Schema Analysis
- **companies**: Basic company info (id, name, email, transport_type, notes)
- **routes**: Route information linked to companies
- **user_profiles**: User roles and permissions

## Proposed Schema Extensions

### Option 1: Extended Companies Table (Recommended)
Extend the existing `companies` table with additional fields to support both bus companies and regulatory bodies:

```sql
-- Add new columns to companies table
ALTER TABLE companies ADD COLUMN website TEXT;
ALTER TABLE companies ADD COLUMN phone TEXT;
ALTER TABLE companies ADD COLUMN address TEXT;
ALTER TABLE companies ADD COLUMN category TEXT CHECK (category IN ('bus_company', 'regulatory_body'));
ALTER TABLE companies ADD COLUMN priority TEXT CHECK (priority IN ('must', 'should', 'could'));
ALTER TABLE companies ADD COLUMN region TEXT; -- e.g., 'Scotland', 'UK-wide'
```

### Option 2: Separate Regulatory Bodies Table
Create a dedicated table for regulatory bodies:

```sql
CREATE TABLE regulatory_bodies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Useful Information Table
Create a table for general useful information:

```sql
CREATE TABLE useful_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'passenger_rights', 'safety', 'accessibility'
  priority INTEGER DEFAULT 1, -- For ordering
  region TEXT, -- e.g., 'Scotland', 'UK-wide'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Recommended Approach
**Option 1 (Extended Companies Table)** is recommended because:
- Leverages existing table structure and relationships
- Maintains consistency with current data model
- Easier to implement and maintain
- Supports the existing QuickReporting flow

## Data Structure for Population

### Bus Companies (MUST)
- First Bus
- Stagecoach
- Lothian Buses

### Bus Companies (SHOULD)
- McGill's Bus Services

### Bus Companies (COULD)
- Scottish Citylink
- Megabus

### Regulatory Bodies
- Bus Users Scotland
- Traffic Commissioner
- DVSA (Driver and Vehicle Standards Agency)

### Useful Information Categories
- Passenger Rights
- Safety Information
- Accessibility Services
- Complaint Procedures
- Fare Information

## Implementation Plan
1. Create migration to extend companies table
2. Create useful_info table
3. Update RLS policies for new data
4. Create seed data for initial population
5. Update frontend components to display new information
6. Add admin interface for data maintenance

## UI/UX Considerations
- Categorize information clearly (Companies vs Regulatory vs Useful Info)
- Make contact information easily accessible (clickable links)
- Implement search/filter functionality
- Ensure mobile-friendly design
- Maintain accessibility standards

## Maintenance Strategy
- Admin-only interface for updating contact information
- Version control for data changes
- Quarterly review process for contact info accuracy
- Automated alerts for outdated information
- User feedback mechanism for reporting incorrect data