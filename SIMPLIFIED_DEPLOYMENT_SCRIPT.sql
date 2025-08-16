-- ========================================
-- SIMPLIFIED PRODUCTION DEPLOYMENT SCRIPT
-- Royal Vietnam Business Management
-- Authentication: Hardcoded (no database)
-- ========================================

-- 1. Basic tables with EXACT client mapping
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
  -- 7 Account Types (exact mapping to business-form.tsx)
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

CREATE TABLE IF NOT EXISTS document_transactions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  document_number TEXT,
  document_type TEXT NOT NULL,
  document_details JSONB DEFAULT '{}' NOT NULL, -- Custom document types
  delivery_company TEXT NOT NULL,
  receiving_company TEXT NOT NULL,
  delivery_person TEXT,
  receiving_person TEXT,
  delivery_date TEXT NOT NULL,
  receiving_date TEXT,
  handled_by TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  is_hidden BOOLEAN DEFAULT FALSE,
  signed_file_path TEXT,
  pdf_file_path TEXT,
  pdf_file_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Essential indexes
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_tax_id ON businesses(tax_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_transactions_business_id ON document_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_document_transactions_created_at ON document_transactions(created_at DESC);

-- 3. Auto-update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_document_transactions
  BEFORE UPDATE ON document_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- DEPLOYMENT READY!
-- Authentication: quanadmin/01020811 (hardcoded in server)
-- Employee: any-username/royalvietnam
-- Features: 7 account types, custom document types, PDF management