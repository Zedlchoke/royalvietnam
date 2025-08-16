-- ===================================
-- NEON DATABASE SETUP SCRIPT
-- Royal Vietnam Business Management
-- ===================================

-- 1. Tạo bảng businesses với đầy đủ 47 cột
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
  establishment_date TEXT,
  charter_capital TEXT,
  audit_website TEXT,
  account TEXT,
  password TEXT,
  bank_account TEXT,
  bank_name TEXT,
  
  -- 7 loại tài khoản doanh nghiệp
  tax_account_id TEXT,
  tax_account_pass TEXT,
  invoice_lookup_id TEXT,
  invoice_lookup_pass TEXT,
  web_invoice_website TEXT,
  web_invoice_id TEXT,
  web_invoice_pass TEXT,
  social_insurance_code TEXT,
  social_insurance_id TEXT,
  social_insurance_main_pass TEXT,
  social_insurance_secondary_pass TEXT,
  token_id TEXT,
  token_pass TEXT,
  token_provider TEXT,
  token_registration_date TEXT,
  token_expiration_date TEXT,
  token_management_location TEXT,
  statistics_id TEXT,
  statistics_pass TEXT,
  audit_software_website TEXT,
  audit_software_id TEXT,
  audit_software_pass TEXT,
  
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,
  access_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tạo bảng document_transactions
CREATE TABLE IF NOT EXISTS document_transactions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  document_number TEXT,
  document_type TEXT NOT NULL,
  document_details JSONB DEFAULT '{}' NOT NULL,
  delivery_company TEXT NOT NULL,
  receiving_company TEXT NOT NULL,
  delivery_person TEXT,
  receiving_person TEXT,
  delivery_date TEXT NOT NULL,
  receiving_date TEXT,
  handled_by TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  signed_file_path TEXT,
  pdf_file_path TEXT,
  pdf_file_name TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tạo bảng admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Tạo indexes để tăng performance
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_tax_id ON businesses(tax_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at);
CREATE INDEX IF NOT EXISTS idx_document_transactions_business_id ON document_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_document_transactions_created_at ON document_transactions(created_at);

-- 5. Tạo trigger auto-update timestamp
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

-- 6. Tạo admin user mặc định với password mới
INSERT INTO admin_users (username, password, role) 
VALUES ('quanadmin', '01020811', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 7. Tạo dữ liệu mẫu để test
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
  'Công ty TNHH Test Neon Database', 
  'NEON123456789', 
  '123 Đường Neon Test, Quận 1, TP.HCM', 
  '0901234567', 
  'test@neondb.com',
  'Công nghệ thông tin',
  'Nguyễn Neon Manager',
  'neonaccount',
  'neonpass123',
  '1234567890123456',
  'Ngân hàng Neon Test',
  'tax_neon_001', 'taxpass_neon',
  'invoice_neon_001', 'invoicepass_neon',
  'https://hoadon-neon.com', 'webinvoice_neon_001', 'webinvoicepass_neon',
  'BHXH_NEON_001', 'social_neon_001', 'socialpass_main_neon', 'socialpass_sub_neon',
  'token_neon_001', 'tokenpass_neon', 'Neon Tech Provider', '2024-01-01', '2025-12-31', 'Neon Data Center',
  'stats_neon_001', 'statspass_neon',
  'https://audit-neon.com', 'audit_neon_001', 'auditpass_neon',
  'Dữ liệu test cho Neon database - hoạt động hoàn hảo với custom document types và 7 loại tài khoản'
) ON CONFLICT (tax_id) DO NOTHING;

-- 8. Tạo sample document transaction
INSERT INTO document_transactions (
  business_id, document_number, document_type, document_details,
  delivery_company, receiving_company, delivery_person, receiving_person,
  delivery_date, receiving_date, handled_by, notes, status
) 
SELECT 
  b.id, 
  'DOC-NEON-001',
  'Hồ sơ test Neon',
  '{"Hồ sơ thuế": {"quantity": 3, "unit": "bộ", "notes": "Test Neon DB"}, "Giấy phép kinh doanh": {"quantity": 1, "unit": "tờ", "notes": "Bản gốc"}}',
  'Công ty Giao Neon',
  b.name,
  'Nguyễn Giao Neon',
  b.contact_person,
  '2024-08-16T10:00',
  '2024-08-16T11:00',
  'Admin Test Neon',
  'Test transaction cho Neon database với multi-document support',
  'completed'
FROM businesses b 
WHERE b.tax_id = 'NEON123456789'
ON CONFLICT DO NOTHING;

-- 9. Verify setup
SELECT 'Setup completed successfully!' AS status;
SELECT 'Tables created:' AS info, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT 'Admin users:' AS info, username, role FROM admin_users;
SELECT 'Sample businesses:' AS info, name, tax_id FROM businesses;
SELECT 'Sample transactions:' AS info, document_number, document_type FROM document_transactions;

-- 10. Final check
SELECT 
  'Database ready for Royal Vietnam Business Management System!' AS message,
  'Admin Login: quanadmin / 01020811' AS admin_login,
  'Employee Login: any-username / royalvietnam' AS employee_login,
  'Features: Custom document types, 7 account types, multi-document support' AS features;