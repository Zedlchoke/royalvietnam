// Setup database tables using Drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './shared/schema.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://royal:royal@localhost:5432/royalvietnam';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

const db = drizzle(pool, { schema });

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create tables using Drizzle schema
    await db.execute(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS business_accounts (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS document_transactions (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        document_number TEXT,
        document_types TEXT[] NOT NULL,
        quantities INTEGER[] NOT NULL,
        units TEXT[] NOT NULL,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_businesses_tax_id ON businesses(tax_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_document_transactions_business_id ON document_transactions(business_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_document_transactions_created_at ON document_transactions(created_at);`);

    // Insert default admin user
    await db.execute(`
      INSERT INTO admin_users (username, password)
      VALUES ('quanadmin', '01020811')
      ON CONFLICT (username) DO NOTHING
    `);

    console.log('Database setup completed successfully!');
    
    // Verify tables
    const result = await db.execute(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Created tables:', result.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);
