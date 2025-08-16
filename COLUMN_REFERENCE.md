# 📋 COMPLETE DATABASE COLUMN REFERENCE

## 🏢 **BUSINESSES TABLE** 
### Required columns for all business operations:

```sql
-- Primary identification
id                              SERIAL PRIMARY KEY
name                           TEXT NOT NULL
tax_id                         VARCHAR(20) NOT NULL UNIQUE

-- Basic business info
address                        TEXT
phone                          VARCHAR(20)
email                          TEXT
website                        TEXT
industry                       TEXT
contact_person                 TEXT

-- Establishment details
establishment_date             TEXT
charter_capital                TEXT
audit_website                  TEXT

-- Basic accounts
account                        TEXT
password                       TEXT
bank_account                   TEXT
bank_name                      TEXT

-- 7 DETAILED ACCOUNT TYPES (Core feature)
-- 1. Tax accounts
tax_account_id                 TEXT
tax_account_pass               TEXT

-- 2. Invoice lookup
invoice_lookup_id              TEXT
invoice_lookup_pass            TEXT

-- 3. Web invoice
web_invoice_website            TEXT
web_invoice_id                 TEXT
web_invoice_pass               TEXT

-- 4. Social insurance
social_insurance_code          TEXT
social_insurance_id            TEXT
social_insurance_main_pass     TEXT
social_insurance_secondary_pass TEXT

-- 5. Token accounts
token_id                       TEXT
token_pass                     TEXT
token_provider                 TEXT
token_registration_date        TEXT
token_expiration_date          TEXT
token_management_location      TEXT

-- 6. Statistics
statistics_id                  TEXT
statistics_pass                TEXT

-- 7. Audit software
audit_software_website         TEXT
audit_software_id              TEXT
audit_software_pass            TEXT

-- Additional fields
custom_fields                  JSONB DEFAULT '{}'
notes                          TEXT
access_code                    TEXT
created_at                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 📄 **DOCUMENT_TRANSACTIONS TABLE**
### Required columns for document management:

```sql
-- Primary identification
id                            SERIAL PRIMARY KEY
business_id                   INTEGER REFERENCES businesses(id)

-- Document information
document_number               TEXT
document_type                 TEXT NOT NULL (Custom text input)
document_details              JSONB DEFAULT '{}' (Multi-document support)

-- Company information
delivery_company              TEXT NOT NULL
receiving_company             TEXT NOT NULL
delivery_person               TEXT
receiving_person              TEXT

-- Date information
delivery_date                 TEXT NOT NULL
receiving_date                TEXT

-- Processing information
handled_by                    TEXT
notes                         TEXT
status                        VARCHAR(50) DEFAULT 'pending'

-- File management (PDF upload/download)
signed_file_path              TEXT
pdf_file_path                 TEXT
pdf_file_name                 TEXT

-- Additional fields
is_hidden                     BOOLEAN DEFAULT FALSE
created_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 👥 **ADMIN_USERS TABLE**
### Required columns for authentication:

```sql
id                            SERIAL PRIMARY KEY
username                      VARCHAR(50) NOT NULL UNIQUE
password_hash                 TEXT NOT NULL
role                          VARCHAR(20) DEFAULT 'admin'
created_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 🏦 **BUSINESS_ACCOUNTS TABLE** (Optional - Extended account management)
### Separate table for detailed account management:

```sql
id                            SERIAL PRIMARY KEY
business_id                   INTEGER REFERENCES businesses(id)

-- Extended account details
invoice_lookup_id             TEXT
invoice_lookup_pass           TEXT
web_invoice_website           TEXT
web_invoice_id                TEXT
web_invoice_pass              TEXT
social_insurance_code         TEXT
social_insurance_id           TEXT
social_insurance_main_pass    TEXT
social_insurance_secondary_pass TEXT
social_insurance_contact      TEXT
statistics_id                 TEXT
statistics_pass               TEXT
token_id                      TEXT
token_pass                    TEXT
token_provider                TEXT
token_registration_date       TEXT
token_expiration_date         TEXT
tax_account_id                TEXT
tax_account_pass              TEXT
created_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 🔍 **ESSENTIAL INDEXES**
### Required for performance:

```sql
CREATE INDEX idx_businesses_name ON businesses(name);
CREATE INDEX idx_businesses_tax_id ON businesses(tax_id);
CREATE INDEX idx_document_transactions_business_id ON document_transactions(business_id);
CREATE INDEX idx_document_transactions_created_at ON document_transactions(created_at);
CREATE INDEX idx_document_transactions_status ON document_transactions(status);
CREATE INDEX idx_admin_users_username ON admin_users(username);
```

---

## ⚙️ **TRIGGERS & FUNCTIONS**
### Auto-update timestamps:

```sql
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
```

---

## 🎯 **KEY FEATURES SUPPORTED**

✅ **Business CRUD**: Create, read, update, delete businesses  
✅ **7 Account Types**: Tax, Invoice, Web invoice, Social insurance, Token, Statistics, Audit software  
✅ **Custom Document Types**: Free text input instead of fixed dropdowns  
✅ **Multi-document Transactions**: JSON support for multiple document types with quantities  
✅ **PDF Management**: Upload, download, delete signed documents  
✅ **Search & Filter**: Name, tax ID, address, phone search  
✅ **Authentication**: Admin/Employee 2-tier system  
✅ **Document Reports**: Auto-generated handover reports

---

## 📝 **QUICK SETUP COMMANDS**

**Copy entire `MANUAL_DATABASE_SETUP.sql` file and run in your database console.**

This will create all tables, indexes, triggers, and sample data needed for the Royal Vietnam Business Management system.