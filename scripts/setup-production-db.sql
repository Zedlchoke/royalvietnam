-- Production Database Setup for Royal Vietnam Business Management
-- This script creates the necessary tables and indexes for Render deployment

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "taxId" VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  "contactPerson" VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- 7 detailed account types
  "taxAccountId" VARCHAR(255),
  "taxAccountPassword" VARCHAR(255),
  
  "hddtLookupId" VARCHAR(255),
  "hddtLookupPassword" VARCHAR(255),
  
  "webHddtWebsite" VARCHAR(255),
  "webHddtId" VARCHAR(255),
  "webHddtPassword" VARCHAR(255),
  
  "socialInsuranceCode" VARCHAR(255),
  "socialInsuranceId" VARCHAR(255),
  "socialInsuranceMainPassword" VARCHAR(255),
  "socialInsuranceSubPassword" VARCHAR(255),
  
  "tokenId" VARCHAR(255),
  "tokenPassword" VARCHAR(255),
  "tokenProvider" VARCHAR(255),
  "tokenRegistrationDate" TIMESTAMP,
  "tokenExpiryDate" TIMESTAMP,
  "tokenManagementLocation" VARCHAR(255),
  
  "statisticsId" VARCHAR(255),
  "statisticsPassword" VARCHAR(255),
  
  "auditSoftwareWebsite" VARCHAR(255),
  "auditSoftwareId" VARCHAR(255),
  "auditSoftwarePassword" VARCHAR(255),
  
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document transactions table
CREATE TABLE IF NOT EXISTS document_transactions (
  id SERIAL PRIMARY KEY,
  "businessId" INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  "documentNumber" VARCHAR(255),
  "documentType" TEXT,
  "documentDetails" JSONB,
  "deliveryCompany" VARCHAR(255),
  "receivingCompany" VARCHAR(255),
  "deliveryPerson" VARCHAR(255),
  "receivingPerson" VARCHAR(255),
  "deliveryDate" TIMESTAMP,
  "receivingDate" TIMESTAMP,
  "handledBy" VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  "signedFilePath" VARCHAR(500),
  "isHidden" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_tax_id ON businesses("taxId");
CREATE INDEX IF NOT EXISTS idx_document_transactions_business_id ON document_transactions("businessId");
CREATE INDEX IF NOT EXISTS idx_document_transactions_created_at ON document_transactions("createdAt");
CREATE INDEX IF NOT EXISTS idx_document_transactions_status ON document_transactions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updated_at
DROP TRIGGER IF EXISTS set_timestamp_businesses ON businesses;
CREATE TRIGGER set_timestamp_businesses
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_document_transactions ON document_transactions;
CREATE TRIGGER set_timestamp_document_transactions
  BEFORE UPDATE ON document_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Insert default test data for verification (optional)
INSERT INTO businesses (
  name, "taxId", address, "contactPerson", phone, email
) VALUES (
  'Công ty Test Deployment',
  '1234567890',
  'Địa chỉ test deployment',
  'Người test',
  '0123456789',
  'test@deployment.com'
) ON CONFLICT ("taxId") DO NOTHING;

COMMIT;