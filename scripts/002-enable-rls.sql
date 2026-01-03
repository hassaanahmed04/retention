-- Enable Row Level Security on all tables
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for call_records
CREATE POLICY "Agents can view their own call records" ON call_records
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Managers and admins can view all call records" ON call_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'sales_manager'))
  );

CREATE POLICY "Agents can create call records" ON call_records
  FOR INSERT WITH CHECK (agent_id = auth.uid());

-- RLS Policies for lead_notes
CREATE POLICY "Agents can view notes for their assigned leads" ON lead_notes
  FOR SELECT USING (
    agent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'sales_manager'))
  );

CREATE POLICY "Agents can create notes" ON lead_notes
  FOR INSERT WITH CHECK (agent_id = auth.uid());

-- RLS Policies for commissions
CREATE POLICY "Affiliates can view their own commissions" ON commissions
  FOR SELECT USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can manage commissions" ON commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for retention_cases
CREATE POLICY "Agents can view their assigned cases" ON retention_cases
  FOR SELECT USING (
    assigned_agent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'sales_manager'))
  );

CREATE POLICY "Managers can manage retention cases" ON retention_cases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'sales_manager'))
  );
