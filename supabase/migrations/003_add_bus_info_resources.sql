-- Migration: Add bus company information resources
-- Description: Extend companies table and add useful_info table for comprehensive bus company data

-- Extend companies table with additional fields
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('bus_company', 'regulatory_body'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('must', 'should', 'could'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS region TEXT;

-- Create useful_info table for general information resources
CREATE TABLE IF NOT EXISTS useful_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on useful_info
ALTER TABLE useful_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies for useful_info (public read access, admin write access)
CREATE POLICY "Allow public read access to useful_info" ON useful_info
  FOR SELECT USING (true);

CREATE POLICY "Allow admin users to manage useful_info" ON useful_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update existing RLS policies for companies to include new fields
-- Note: Existing policies already cover basic CRUD operations
-- The new fields will be accessible under the same policies

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies(category);
CREATE INDEX IF NOT EXISTS idx_companies_priority ON companies(priority);
CREATE INDEX IF NOT EXISTS idx_companies_region ON companies(region);
CREATE INDEX IF NOT EXISTS idx_useful_info_category ON useful_info(category);
CREATE INDEX IF NOT EXISTS idx_useful_info_region ON useful_info(region);
CREATE INDEX IF NOT EXISTS idx_useful_info_priority ON useful_info(priority);

-- Insert initial data for MUST companies
INSERT INTO companies (name, email, transport_type, website, phone, address, category, priority, region, notes) VALUES
('First Bus', 'enquiries@firstbus.co.uk', 'Bus', 'https://www.firstbus.co.uk', '0344 800 4411', 'FirstGroup plc, 395 King Street, Aberdeen AB24 5RP', 'bus_company', 'must', 'UK-wide', 'Major bus operator across the UK - contact via website form or phone for specific inquiries. Alternative: complaints@firstbus.co.uk for delay complaints'),
('Stagecoach', 'enquiries@stagecoachbus.com', 'Bus', 'https://www.stagecoachbus.com', '0345 121 0170', 'Stagecoach Group plc, 10 Dunkeld Road, Perth PH1 5TW', 'bus_company', 'must', 'UK-wide', 'Major UK bus and coach operator'),
('Lothian Buses', 'enquiries@lothianbuses.com', 'Bus', 'https://www.lothianbuses.com', '0131 554 4494', 'Lothian Buses plc, 55 Annandale Street, Edinburgh EH7 4AZ', 'bus_company', 'must', 'Scotland', 'Edinburgh and Lothians bus operator');

-- Insert initial data for regulatory bodies
INSERT INTO companies (name, email, transport_type, website, phone, address, category, priority, region, notes) VALUES
('Bus Users Scotland', 'info@bususersscotland.org.uk', 'Regulatory', 'https://www.bususersscotland.org.uk', '0141 332 9988', 'Bus Users Scotland, 153 London Road, Glasgow G1 5BJ', 'regulatory_body', 'must', 'Scotland', 'Scottish bus passenger watchdog and advocacy group'),
('Traffic Commissioner', 'enquiries@trafficcommissioner.gov.uk', 'Regulatory', 'https://www.gov.uk/government/organisations/traffic-commissioners', '0300 123 9000', 'Traffic Commissioner for Scotland, George House, 36 North Hanover Street, Glasgow G1 2AD', 'regulatory_body', 'must', 'Scotland', 'Regulates bus operators and enforces standards'),
('DVSA', 'information@dvsa.gov.uk', 'Regulatory', 'https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency', '0300 123 9000', 'Driver and Vehicle Standards Agency, Berkeley House, Croydon Street, Bristol BS5 6EB', 'regulatory_body', 'must', 'UK-wide', 'Ensures road safety and vehicle standards');

-- Insert initial useful information
INSERT INTO useful_info (title, content, category, priority, region) VALUES
('Passenger Rights', 'Under UK law, bus passengers have rights to reliable service, compensation for delays, and assistance for disabled passengers. Contact your operator or regulatory body if your rights are not being respected.', 'passenger_rights', 1, 'UK-wide'),
('Reporting Bus Issues', 'Report bus service issues to your local operator first. If unresolved, contact the Traffic Commissioner or passenger advocacy groups like Bus Users Scotland.', 'complaints', 2, 'Scotland'),
('Accessibility Information', 'Most UK buses are wheelchair accessible. Contact your operator for accessibility information or assistance planning your journey.', 'accessibility', 3, 'UK-wide'),
('Delay Compensation', 'Bus operators may offer compensation for significant delays. Check the operator''s website or contact them directly for their compensation policy.', 'compensation', 4, 'UK-wide'),
('Lost Property', 'Contact your bus operator directly for lost property inquiries. Most operators have dedicated lost property departments.', 'lost_property', 5, 'UK-wide');