-- ===============================================
-- NEON DATABASE COMPLETE SETUP SCRIPT
-- Royal Vietnam Business Management System
-- Production Ready - August 16, 2025
-- ===============================================

-- Clean slate setup (uncomment if needed to rebuild)
-- DROP TABLE IF EXISTS document_transactions CASCADE;
-- DROP TABLE IF EXISTS business_accounts CASCADE;
-- DROP TABLE IF EXISTS businesses CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE;

-- ============================================
-- 1. MAIN TABLES WITH EXACT CLIENT MAPPING
-- ============================================

-- Businesses table - matches business-form.tsx exactly
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  
  -- Basic business info
  name TEXT NOT NULL,
  tax_id VARCHAR(20) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  email TEXT,
  website TEXT,
  industry TEXT,
  contact_person TEXT,
  
  -- Extended business info
  establishment_date TEXT,
  charter_capital TEXT,
  audit_website TEXT,
  
  -- Basic account credentials
  account TEXT,
  password TEXT,
  bank_account TEXT,
  bank_name TEXT,
  
  -- 7 ACCOUNT TYPES - exact mapping to client form
  -- 1. Tax accounts
  tax_account_id TEXT,
  tax_account_pass TEXT,
  
  -- 2. Invoice lookup
  invoice_lookup_id TEXT,
  invoice_lookup_pass TEXT,
  
  -- 3. Web invoice
  web_invoice_website TEXT,
  web_invoice_id TEXT,
  web_invoice_pass TEXT,
  
  -- 4. Social insurance
  social_insurance_code TEXT,
  social_insurance_id TEXT,
  social_insurance_main_pass TEXT,
  social_insurance_secondary_pass TEXT,
  
  -- 5. Token accounts
  token_id TEXT,
  token_pass TEXT,
  token_provider TEXT,
  token_registration_date TEXT,
  token_expiration_date TEXT,
  token_management_location TEXT,
  
  -- 6. Statistics
  statistics_id TEXT,
  statistics_pass TEXT,
  
  -- 7. Audit software
  audit_software_website TEXT,
  audit_software_id TEXT,
  audit_software_pass TEXT,
  
  -- Additional fields
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,
  access_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Document transactions - matches document-transaction-form.tsx exactly
CREATE TABLE IF NOT EXISTS document_transactions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Document information
  document_number TEXT,
  document_type TEXT NOT NULL,
  document_details JSONB DEFAULT '{}' NOT NULL, -- Supports custom document types
  
  -- Transaction parties
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
  
  -- File management
  signed_file_path TEXT,
  pdf_file_path TEXT,
  pdf_file_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business accounts (legacy support)
CREATE TABLE IF NOT EXISTS business_accounts (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Account details
  invoice_lookup_id TEXT,
  invoice_lookup_pass TEXT,
  web_invoice_website TEXT,
  web_invoice_id TEXT,
  web_invoice_pass TEXT,
  social_insurance_code TEXT,
  social_insurance_id TEXT,
  social_insurance_main_pass TEXT,
  social_insurance_secondary_pass TEXT,
  social_insurance_contact TEXT,
  statistics_id TEXT,
  statistics_pass TEXT,
  token_id TEXT,
  token_pass TEXT,
  token_provider TEXT,
  token_registration_date TEXT,
  token_expiration_date TEXT,
  tax_account_id TEXT,
  tax_account_pass TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- 2. PERFORMANCE INDEXES
-- ============================================

-- Business indexes
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_tax_id ON businesses(tax_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);

-- Document transaction indexes
CREATE INDEX IF NOT EXISTS idx_document_transactions_business_id ON document_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_document_transactions_created_at ON document_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_transactions_status ON document_transactions(status);

-- Business account indexes
CREATE INDEX IF NOT EXISTS idx_business_accounts_business_id ON business_accounts(business_id);

-- ============================================
-- 3. TRIGGERS AND FUNCTIONS
-- ============================================

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to document_transactions
DROP TRIGGER IF EXISTS set_timestamp_document_transactions ON document_transactions;
CREATE TRIGGER set_timestamp_document_transactions
  BEFORE UPDATE ON document_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- 4. SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample businesses with full account information
INSERT INTO businesses (
  name, tax_id, address, phone, email, website, industry, contact_person,
  establishment_date, charter_capital, audit_website,
  account, password, bank_account, bank_name,
  tax_account_id, tax_account_pass,
  invoice_lookup_id, invoice_lookup_pass,
  web_invoice_website, web_invoice_id, web_invoice_pass,
  social_insurance_code, social_insurance_id, social_insurance_main_pass, social_insurance_secondary_pass,
  token_id, token_pass, token_provider, token_registration_date, token_expiration_date, token_management_location,
  statistics_id, statistics_pass,
  audit_software_website, audit_software_id, audit_software_pass,
  notes
) VALUES 
-- Sample 1: Full service company
(
  'Công ty TNHH Tư Vấn Royal Vietnam', 
  'ROYAL2024001', 
  '123 Nguyễn Huệ, Quận 1, TP.HCM', 
  '0901234567', 
  'contact@royalvietnam.com',
  'https://royalvietnam.com',
  'Tư vấn doanh nghiệp',
  'Nguyễn Văn A',
  '2024-01-15',
  '5,000,000,000 VND',
  'https://audit.royalvietnam.com',
  'royal_main_account',
  'royal_password_2024',
  '1234567890123456',
  'Ngân hàng Vietcombank',
  'TAX_ROYAL_001', 'tax_pass_royal_2024',
  'INV_ROYAL_001', 'inv_pass_royal_2024',
  'https://hoadon.royalvietnam.com', 'WEB_ROYAL_001', 'web_pass_royal_2024',
  'BHXH_ROYAL_001', 'SOCIAL_ROYAL_001', 'social_main_royal_2024', 'social_sub_royal_2024',
  'TOKEN_ROYAL_001', 'token_pass_royal_2024', 'Royal Tech Solutions', '2024-01-01', '2025-12-31', 'TP.HCM',
  'STATS_ROYAL_001', 'stats_pass_royal_2024',
  'https://audit-software.royalvietnam.com', 'AUDIT_ROYAL_001', 'audit_pass_royal_2024',
  'Công ty tư vấn chính với đầy đủ 7 loại tài khoản và hỗ trợ custom document types'
),

-- Sample 2: Manufacturing company
(
  'Công ty Sản Xuất ABC Manufacturing', 
  'ABC2024002', 
  '456 Lê Lợi, Quận 3, TP.HCM', 
  '0902345678', 
  'info@abcmanufacturing.vn',
  'https://abcmanufacturing.vn',
  'Sản xuất',
  'Trần Thị B',
  '2023-06-20',
  '10,000,000,000 VND',
  'https://audit.abc.vn',
  'abc_production_account',
  'abc_secure_2024',
  '2345678901234567',
  'Ngân hàng Techcombank',
  'TAX_ABC_002', 'tax_abc_secure_2024',
  'INV_ABC_002', 'inv_abc_secure_2024',
  'https://invoice.abc.vn', 'WEB_ABC_002', 'web_abc_secure_2024',
  'BHXH_ABC_002', 'SOCIAL_ABC_002', 'social_abc_main_2024', 'social_abc_sub_2024',
  'TOKEN_ABC_002', 'token_abc_secure_2024', 'ABC Tech Provider', '2023-06-01', '2025-06-30', 'TP.HCM',
  'STATS_ABC_002', 'stats_abc_secure_2024',
  'https://audit.abc.vn', 'AUDIT_ABC_002', 'audit_abc_secure_2024',
  'Công ty sản xuất với quy trình document management phức tạp'
),

-- Sample 3: Trading company
(
  'Công ty Thương Mại XYZ Trading', 
  'XYZ2024003', 
  '789 Hai Bà Trưng, Quận 1, TP.HCM', 
  '0903456789', 
  'sales@xyztrading.com',
  'https://xyztrading.com',
  'Thương mại',
  'Lê Văn C',
  '2022-03-10',
  '3,000,000,000 VND',
  'https://audit.xyz.com',
  'xyz_trading_account',
  'xyz_trade_2024',
  '3456789012345678',
  'Ngân hàng BIDV',
  'TAX_XYZ_003', 'tax_xyz_2024',
  'INV_XYZ_003', 'inv_xyz_2024',
  'https://hoadon.xyz.com', 'WEB_XYZ_003', 'web_xyz_2024',
  'BHXH_XYZ_003', 'SOCIAL_XYZ_003', 'social_xyz_main_2024', 'social_xyz_sub_2024',
  'TOKEN_XYZ_003', 'token_xyz_2024', 'XYZ Digital', '2022-03-01', '2025-03-31', 'TP.HCM',
  'STATS_XYZ_003', 'stats_xyz_2024',
  'https://audit-soft.xyz.com', 'AUDIT_XYZ_003', 'audit_xyz_2024',
  'Công ty thương mại xuất nhập khẩu với nhiều loại hồ sơ custom'
)
ON CONFLICT (tax_id) DO NOTHING;

-- Insert sample document transactions with custom document types
INSERT INTO document_transactions (
  business_id, document_type, document_details,
  delivery_company, receiving_company, 
  delivery_person, receiving_person,
  delivery_date, receiving_date,
  handled_by, notes, status
) VALUES 
-- Transaction 1: Business establishment
(
  (SELECT id FROM businesses WHERE tax_id = 'ROYAL2024001' LIMIT 1),
  'Hồ sơ thành lập doanh nghiệp',
  '{"Giấy phép đăng ký kinh doanh": {"quantity": 1, "unit": "bộ"}, "Hồ sơ thuế": {"quantity": 1, "unit": "bộ"}, "Giấy chứng nhận đầu tư": {"quantity": 1, "unit": "bộ"}}',
  'Công ty TNHH Tư Vấn Royal Vietnam',
  'Sở Kế hoạch Đầu tư TP.HCM',
  'Nguyễn Văn A',
  'Phạm Thị Lan',
  '2024-08-16',
  '2024-08-16',
  'Chuyên viên Royal',
  'Hồ sơ thành lập công ty với đầy đủ giấy tờ pháp lý',
  'completed'
),

-- Transaction 2: Custom document type
(
  (SELECT id FROM businesses WHERE tax_id = 'ABC2024002' LIMIT 1),
  'Hồ sơ đăng ký nhãn hiệu',
  '{"Đơn đăng ký nhãn hiệu": {"quantity": 1, "unit": "bộ"}, "Bằng sáng chế": {"quantity": 2, "unit": "tài liệu"}, "Giấy ủy quyền": {"quantity": 1, "unit": "tờ"}}',
  'Công ty Sản Xuất ABC Manufacturing',
  'Cục Sở hữu trí tuệ',
  'Trần Thị B',
  'Nguyễn Văn Sở hữu',
  '2024-08-15',
  '2024-08-15',
  'Chuyên viên ABC',
  'Đăng ký bảo hộ nhãn hiệu và sáng chế cho sản phẩm mới',
  'pending'
),

-- Transaction 3: Export license
(
  (SELECT id FROM businesses WHERE tax_id = 'XYZ2024003' LIMIT 1),
  'Giấy phép xuất khẩu',
  '{"Giấy phép xuất khẩu": {"quantity": 1, "unit": "bộ"}, "Hợp đồng thương mại": {"quantity": 3, "unit": "bản"}, "Chứng nhận chất lượng": {"quantity": 5, "unit": "tài liệu"}}',
  'Công ty Thương Mại XYZ Trading',
  'Bộ Công Thương',
  'Lê Văn C',
  'Trần Văn Thương mại',
  '2024-08-14',
  NULL,
  'Chuyên viên XYZ',
  'Xin cấp giấy phép xuất khẩu hàng hóa ra nước ngoài',
  'processing'
),

-- Transaction 4: Custom environmental permit
(
  (SELECT id FROM businesses WHERE tax_id = 'ABC2024002' LIMIT 1),
  'Giấy phép môi trường',
  '{"Báo cáo đánh giá tác động môi trường": {"quantity": 1, "unit": "bộ"}, "Giấy phép xả thải": {"quantity": 1, "unit": "tài liệu"}, "Kế hoạch bảo vệ môi trường": {"quantity": 1, "unit": "bộ"}}',
  'Công ty Sản Xuất ABC Manufacturing',
  'Sở Tài nguyên Môi trường',
  'Trần Thị B',
  'Phạm Văn Môi trường',
  '2024-08-13',
  '2024-08-14',
  'Chuyên viên ABC',
  'Xin cấp các giấy phép liên quan đến bảo vệ môi trường cho nhà máy',
  'completed'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. VERIFICATION AND SUMMARY
-- ============================================

-- Display setup summary
SELECT 
  'Royal Vietnam Business Management Database Setup Complete!' AS status,
  'Authentication: quanadmin/01020811 (hardcoded in server code)' AS admin_auth,
  'Employee: any-username/royalvietnam (hardcoded)' AS employee_auth,
  'Features: 7 account types, custom document types, PDF management' AS features;

-- Show data counts
SELECT 
  (SELECT COUNT(*) FROM businesses) AS business_count,
  (SELECT COUNT(*) FROM document_transactions) AS transaction_count,
  (SELECT COUNT(*) FROM business_accounts) AS account_count;

-- Show sample data
SELECT 'Sample Businesses:' AS info;
SELECT id, name, tax_id, phone, email FROM businesses ORDER BY created_at DESC LIMIT 5;

SELECT 'Sample Transactions:' AS info;
SELECT id, document_type, delivery_company, receiving_company, status FROM document_transactions ORDER BY created_at DESC LIMIT 5;

-- ============================================
-- 6. PRODUCTION NOTES
-- ============================================

/*
DEPLOYMENT CHECKLIST:
✓ Run this script on Neon PostgreSQL database
✓ Verify CONNECTION_STRING in Render environment variables
✓ Authentication is hardcoded - no admin_users table needed
✓ Custom document types supported via JSON fields
✓ 7 account types fully mapped to client components
✓ Indexes optimized for performance
✓ Sample data for immediate testing

AUTHENTICATION (hardcoded in server):
- Admin: quanadmin / 01020811
- Employee: any-username / royalvietnam

FEATURES:
- Business CRUD with 7 account types
- Document transactions with custom types
- PDF file upload/download
- Search and pagination
- Delete protection (password: 0102)
- Vietnamese language support
*/