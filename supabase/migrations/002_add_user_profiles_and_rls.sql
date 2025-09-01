-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- Drop old policies for companies
DROP POLICY IF EXISTS "Allow authenticated users to read companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to insert companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to update companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to delete companies" ON companies;

-- New policies for companies
CREATE POLICY "Admins can do everything on companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read companies they belong to" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND company_id = companies.id
    )
  );

-- Drop old policies for routes
DROP POLICY IF EXISTS "Allow authenticated users to read routes" ON routes;
DROP POLICY IF EXISTS "Allow authenticated users to insert routes" ON routes;
DROP POLICY IF EXISTS "Allow authenticated users to update routes" ON routes;
DROP POLICY IF EXISTS "Allow authenticated users to delete routes" ON routes;

-- New policies for routes
CREATE POLICY "Admins can do everything on routes" ON routes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read routes for their company" ON routes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.company_id = routes.company_id
    )
  );

CREATE POLICY "Users can insert routes for their company" ON routes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.company_id = routes.company_id
    )
  );

CREATE POLICY "Users can update routes for their company" ON routes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.company_id = routes.company_id
    )
  );

CREATE POLICY "Users can delete routes for their company" ON routes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.company_id = routes.company_id
    )
  );