-- ===================================
-- PRODUCTION DATABASE SETUP - FINAL
-- Royal Vietnam Business Management
-- Neon + Render Deployment Ready
-- ===================================

-- Drop existing tables if needed (uncomment if rebuilding)
-- DROP TABLE IF EXISTS document_transactions CASCADE;
-- DROP TABLE IF EXISTS businesses CASCADE;

-- 1. Create businesses table with EXACT mapping to client components
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  
  -- Basic business information (business-form.tsx fields)
  name TEXT NOT NULL,
  tax_id VARCHAR(20) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  email TEXT,
  website TEXT,
  industry TEXT,
  contact_person TEXT,
  
  -- Additional business info
  establishment_date TEXT,
  charter_capital TEXT,
  audit_website TEXT,
  
  -- Basic account info
  account TEXT,
  password TEXT,
  bank_account TEXT,
  bank_name TEXT,
  
  -- 7 Account Types (exact mapping to client form fields)
  -- Tax accounts
  tax_account_id TEXT,
  tax_account_pass TEXT,
  
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
  
  -- Token accounts
  token_id TEXT,
  token_pass TEXT,
  token_provider TEXT,
  token_registration_date TEXT,
  token_expiration_date TEXT,
  token_management_location TEXT,
  
  -- Statistics
  statistics_id TEXT,
  statistics_pass TEXT,
  
  -- Audit software
  audit_software_website TEXT,
  audit_software_id TEXT,
  audit_software_pass TEXT,
  
  -- Additional fields
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,
  access_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Create document_transactions table with EXACT mapping to client
CREATE TABLE IF NOT EXISTS document_transactions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Document info (document-transaction-form.tsx fields)
  document_number TEXT,
  document_type TEXT NOT NULL,
  document_details JSONB DEFAULT '{}' NOT NULL, -- Custom document types support
  
  -- Company info
  delivery_company TEXT NOT NULL,
  receiving_company TEXT NOT NULL,
  delivery_person TEXT,
  receiving_person TEXT,
  
  -- Dates
  delivery_date TEXT NOT NULL,
  receiving_date TEXT,
  
  -- Management
  handled_by TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  is_hidden BOOLEAN DEFAULT FALSE,
  
  -- PDF file management
  signed_file_path TEXT,
  pdf_file_path TEXT,
  pdf_file_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_tax_id ON businesses(tax_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_transactions_business_id ON document_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_document_transactions_created_at ON document_transactions(created_at DESC);

-- 4. Create auto-update timestamp trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_document_transactions ON document_transactions;
CREATE TRIGGER set_timestamp_document_transactions
  BEFORE UPDATE ON document_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- 5. Insert sample data for testing (matching client expectations)
INSERT INTO businesses (
  name, tax_id, address, phone, email, industry, contact_person,
  account, password, bank_account, bank_name,
  tax_account_id, tax_account_pass,
  invoice_lookup_id, invoice_lookup_pass,
  web_invoice_website, web_invoice_id, web_invoice_pass,
  social_insurance_code, social_insurance_id, social_insurance_main_pass, social_insurance_secondary_pass,
  token_id, token_pass, token_provider, token_registration_date, token_expiration_date, token_management_location,
  statistics_id, statistics_pass,
  audit_software_website, audit_software_id, audit_software_pass,
  notes
) VALUES (
  'Công ty TNHH Royal Vietnam Test', 
  'ROYAL2024001', 
  '123 Đường Test Production, Quận 1, TP.HCM', 
  '0901234567', 
  'test@royalvietnam.com',
  'Tư vấn doanh nghiệp',
  'Nguyễn Test Manager',
  'royalaccount',
  'royalpass123',
  '1234567890123456',
  'Ngân hàng Royal Test',
  'tax_royal_001', 'taxpass_royal',
  'invoice_royal_001', 'invoicepass_royal',
  'https://hoadon-royal.com', 'webinvoice_royal_001', 'webinvoicepass_royal',
  'BHXH_ROYAL_001', 'social_royal_001', 'socialpass_main_royal', 'socialpass_sub_royal',
  'token_royal_001', 'tokenpass_royal', 'Royal Tech Provider', '2024-01-01', '2025-12-31', 'TP.HCM',
  'stats_royal_001', 'statspass_royal',
  'https://audit-royal.com', 'audit_royal_001', 'auditpass_royal',
  'Doanh nghiệp test cho production với đầy đủ 7 loại tài khoản và custom document types'
) ON CONFLICT (tax_id) DO NOTHING;

-- 6. Insert sample document transaction
INSERT INTO document_transactions (
  business_id, document_type, document_details,
  delivery_company, receiving_company, 
  delivery_person, receiving_person,
  delivery_date, receiving_date,
  handled_by, notes, status
) VALUES (
  (SELECT id FROM businesses WHERE tax_id = 'ROYAL2024001' LIMIT 1),
  'Hồ sơ thành lập doanh nghiệp',
  '{"Giấy phép kinh doanh": {"quantity": 1, "unit": "bộ"}, "Hồ sơ thuế": {"quantity": 2, "unit": "tài liệu"}}',
  'Công ty TNHH Royal Vietnam Test',
  'Sở Kế hoạch Đầu tư TP.HCM',
  'Nguyễn Giao Hàng',
  'Trần Nhận Hồ Sơ',
  '2024-08-16',
  '2024-08-16',
  'Nhân viên Royal',
  'Giao dịch test cho production deployment',
  'completed'
);

-- 7. Verify setup
SELECT 
  'Database ready for Royal Vietnam Business Management!' AS message,
  'Admin Login: quanadmin / 01020811 (hardcoded in server)' AS admin_login,
  'Employee Login: any-username / royalvietnam' AS employee_login,
  'Features: Custom document types, 7 account types, no admin_users table needed' AS features;

-- Check data
SELECT 'Sample data:' AS info;
SELECT COUNT(*) as business_count FROM businesses;
SELECT COUNT(*) as transaction_count FROM document_transactions;
SELECT name, tax_id FROM businesses;
SELECT document_type, delivery_company FROM document_transactions;

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Test business creation (matches client form)
/*
INSERT INTO businesses (
  name, tax_id, address, phone, email, industry, contact_person,
  tax_account_id, tax_account_pass,
  invoice_lookup_id, invoice_lookup_pass,
  web_invoice_website, web_invoice_id, web_invoice_pass,
  social_insurance_code, social_insurance_id, social_insurance_main_pass,
  token_id, token_pass, token_provider,
  statistics_id, statistics_pass,
  audit_software_website, audit_software_id, audit_software_pass
) VALUES (
  'Test Company API', 'API001', 'Test Address', '0909000001', 'api@test.com', 'IT', 'API Tester',
  'tax_api_001', 'tax_pass_api',
  'invoice_api_001', 'invoice_pass_api', 
  'https://invoice-api.com', 'web_api_001', 'web_pass_api',
  'BHXH_API_001', 'social_api_001', 'social_pass_api',
  'token_api_001', 'token_pass_api', 'API Provider',
  'stats_api_001', 'stats_pass_api',
  'https://audit-api.com', 'audit_api_001', 'audit_pass_api'
);
*/

-- Test document transaction creation (matches client form)
/*
INSERT INTO document_transactions (
  business_id, document_type, document_details,
  delivery_company, receiving_company,
  delivery_date, handled_by
) VALUES (
  1, 'Hồ sơ tùy chỉnh từ API',
  '{"Loại hồ sơ A": {"quantity": 5, "unit": "bộ"}, "Loại hồ sơ B": {"quantity": 3, "unit": "tài liệu"}}',
  'Company A', 'Company B',
  '2024-08-16', 'API Handler'
);
*/