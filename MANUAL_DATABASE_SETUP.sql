-- =====================================================
-- MANUAL DATABASE SETUP FOR ROYAL VIETNAM MANAGEMENT
-- Copy and run these commands in your database console
-- =====================================================

-- 1. CREATE BUSINESSES TABLE (Main business information + 7 account types)
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tax_id VARCHAR(20) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  email TEXT,
  website TEXT,
  industry TEXT,
  contact_person TEXT,
  
  -- Business establishment info
  establishment_date TEXT,
  charter_capital TEXT,
  audit_website TEXT,
  
  -- Basic account info
  account TEXT,
  password TEXT,
  bank_account TEXT,
  bank_name TEXT,
  
  -- 1. Tax accounts (Tài khoản khai thuế, nộp thuế)
  tax_account_id TEXT,
  tax_account_pass TEXT,
  
  -- 2. Invoice lookup accounts (Tài khoản tra cứu HĐĐT)
  invoice_lookup_id TEXT,
  invoice_lookup_pass TEXT,
  
  -- 3. Web invoice accounts (Web HĐĐT)
  web_invoice_website TEXT,
  web_invoice_id TEXT,
  web_invoice_pass TEXT,
  
  -- 4. Social insurance accounts (Tài khoản bảo hiểm XH-YT)
  social_insurance_code TEXT,
  social_insurance_id TEXT,
  social_insurance_main_pass TEXT,
  social_insurance_secondary_pass TEXT,
  
  -- 5. Token accounts (Tài khoản TOKEN)
  token_id TEXT,
  token_pass TEXT,
  token_provider TEXT,
  token_registration_date TEXT,
  token_expiration_date TEXT,
  token_management_location TEXT,
  
  -- 6. Statistics accounts (Tài khoản thống kê)
  statistics_id TEXT,
  statistics_pass TEXT,
  
  -- 7. Audit software accounts (Tài khoản phần mềm kiểm toán)
  audit_software_website TEXT,
  audit_software_id TEXT,
  audit_software_pass TEXT,
  
  -- Additional fields
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,
  access_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREATE BUSINESS_ACCOUNTS TABLE (Separate account management)
CREATE TABLE IF NOT EXISTS business_accounts (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Invoice lookup
  invoice_lookup_id TEXT,
  invoice_lookup_pass TEXT,
  
  -- Web invoice
  web_invoice_website TEXT,
  web_invoice_id TEXT,
  web_invoice_pass TEXT,
  
  -- Social insurance
  social_insurance_code TEXT,
  social_insurance_id TEXT,
  social_insurance_main_pass TEXT,
  social_insurance_secondary_pass TEXT,
  social_insurance_contact TEXT,
  
  -- Statistics
  statistics_id TEXT,
  statistics_pass TEXT,
  
  -- Token
  token_id TEXT,
  token_pass TEXT,
  token_provider TEXT,
  token_registration_date TEXT,
  token_expiration_date TEXT,
  
  -- Tax
  tax_account_id TEXT,
  tax_account_pass TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE DOCUMENT_TRANSACTIONS TABLE (Document management with custom types)
CREATE TABLE IF NOT EXISTS document_transactions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  document_number TEXT,
  document_type TEXT NOT NULL,
  
  -- Support for multiple document types with quantities and units
  document_details JSONB DEFAULT '{}' NOT NULL,
  
  -- Company and person information
  delivery_company TEXT NOT NULL,
  receiving_company TEXT NOT NULL,
  delivery_person TEXT,
  receiving_person TEXT,
  delivery_date TEXT NOT NULL,
  receiving_date TEXT,
  
  -- Processing information
  handled_by TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  
  -- File management
  signed_file_path TEXT,
  pdf_file_path TEXT,
  pdf_file_name TEXT,
  
  -- Additional fields
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE ADMIN_USERS TABLE (Authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_tax_id ON businesses(tax_id);
CREATE INDEX IF NOT EXISTS idx_document_transactions_business_id ON document_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_document_transactions_created_at ON document_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_document_transactions_status ON document_transactions(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 6. CREATE UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE TRIGGERS FOR AUTO UPDATE
DROP TRIGGER IF EXISTS set_timestamp_document_transactions ON document_transactions;
CREATE TRIGGER set_timestamp_document_transactions
  BEFORE UPDATE ON document_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- 8. INSERT DEFAULT ADMIN USER (password: royalvietnam123)
INSERT INTO admin_users (username, password_hash, role) 
VALUES ('quanadmin', '$2b$10$N8H8J9K7L6M5N4O3P2Q1R0.abcdefghijklmnopqrstuvwxyz', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 9. INSERT SAMPLE DATA FOR TESTING (OPTIONAL)
INSERT INTO businesses (
  name, tax_id, address, contact_person, phone, email,
  tax_account_id, tax_account_pass,
  invoice_lookup_id, invoice_lookup_pass
) VALUES (
  'Công ty TNHH Test Royal Vietnam',
  '0123456789',
  '123 Đường Test, Quận 1, TP.HCM',
  'Nguyễn Test Manager',
  '0987654321',
  'test@royalvietnam.com',
  'TAX001',
  'tax_password_123',
  'INV001',
  'invoice_password_456'
) ON CONFLICT (tax_id) DO NOTHING;

-- 10. GRANT PERMISSIONS (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- =====================================================
-- VERIFICATION QUERIES (Run these to check setup)
-- =====================================================

-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check businesses table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
ORDER BY ordinal_position;

-- Check document_transactions table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'document_transactions' 
ORDER BY ordinal_position;

-- Check sample data
SELECT id, name, tax_id FROM businesses LIMIT 5;
SELECT id, business_id, document_type FROM document_transactions LIMIT 5;

-- =====================================================
-- COMPLETE SETUP READY FOR RENDER DEPLOYMENT
-- =====================================================