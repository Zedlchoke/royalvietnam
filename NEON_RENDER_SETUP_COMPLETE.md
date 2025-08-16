# 🚀 HƯỚNG DẪN ĐẦY ĐỦ: NEON DATABASE + RENDER DEPLOYMENT

## 📋 **BƯỚC 1: SETUP NEON DATABASE**

### **1.1 Tạo Neon Database**
1. Truy cập **https://neon.tech**
2. Sign up free account
3. **Create Project**: "Royal Vietnam Business"
4. **Database name**: `royal_vietnam_db`
5. **Region**: Chọn gần Việt Nam (Singapore/Tokyo)

### **1.2 Lấy Connection String**
1. Neon Dashboard → **Connection Details**
2. Copy **Pooled connection string**:
```
postgresql://username:password@ep-xxx-xxx.pooler.neon.tech/royal_vietnam_db?sslmode=require
```

### **1.3 Setup Tables và Admin User**
1. Neon Console → **SQL Editor**
2. Copy và execute script sau:

```sql
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

CREATE TRIGGER set_timestamp_document_transactions
  BEFORE UPDATE ON document_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- 6. Tạo admin user mặc định
INSERT INTO admin_users (username, password, role) 
VALUES ('quanadmin', '0102', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 7. Tạo dữ liệu mẫu để test
INSERT INTO businesses (
  name, tax_id, address, phone, email, industry, contact_person,
  account, password, bank_account, bank_name
) VALUES (
  'Công ty TNHH Test Neon', 
  '1234567890', 
  '123 Đường Test, TP.HCM', 
  '0901234567', 
  'test@neon.com',
  'Công nghệ thông tin',
  'Nguyễn Test Manager',
  'testaccount',
  'testpass123',
  '1234567890123',
  'Ngân hàng Test'
) ON CONFLICT (tax_id) DO NOTHING;

-- 8. Verify setup
SELECT 'Tables created successfully' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'Admin user:', username FROM admin_users;
SELECT 'Sample business:', name FROM businesses LIMIT 1;
```

---

## 📋 **BƯỚC 2: UPDATE REPLIT PROJECT**

### **2.1 Update Environment Variable**
```bash
# File .env trên Replit
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.pooler.neon.tech/royal_vietnam_db?sslmode=require"
```

### **2.2 Test Connection**
```bash
# Restart server
npm run dev

# Kiểm tra logs:
# ✅ "Database connection verified successfully"
# ✅ "Database tables created successfully"
```

### **2.3 Test Login**
1. Mở website Replit
2. Login: `quanadmin` / `0102`
3. Tạo doanh nghiệp mới
4. Test custom document types

---

## 📋 **BƯỚC 3: SETUP RENDER DEPLOYMENT**

### **3.1 Push Code lên GitHub**
```bash
# Add essential files
git add client/ server/ shared/
git add package.json package-lock.json tsconfig.json
git add vite.config.ts tailwind.config.ts postcss.config.js
git add drizzle.config.ts components.json
git add render-build.sh render.yaml deploy-to-render.md
git add .env.example .gitignore

# Commit & push
git commit -m "✅ Production ready: Neon DB + Render optimized"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### **3.2 Deploy to Render**
1. Truy cập **https://render.com**
2. **New** → **Web Service**
3. **Connect Repository** → Chọn GitHub repo
4. **Settings**:
   - **Name**: `royal-vietnam-business`
   - **Build Command**: `./render-build.sh`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### **3.3 Set Environment Variables**
Render Dashboard → **Environment**:
```bash
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.pooler.neon.tech/royal_vietnam_db?sslmode=require
NODE_ENV=production
```

### **3.4 Deploy & Verify**
1. Click **Deploy** 
2. Wait 5-10 minutes for build
3. Test website tại: `https://royal-vietnam-business.onrender.com`
4. Login: `quanadmin` / `0102`

---

## ✅ **VERIFICATION CHECKLIST**

### **Database Ready:**
- [ ] Neon database created
- [ ] 3 tables: businesses, document_transactions, admin_users
- [ ] Admin user: quanadmin/0102 exists
- [ ] Sample business data created
- [ ] Indexes and triggers working

### **Replit Working:**
- [ ] DATABASE_URL updated
- [ ] Server starts without errors
- [ ] Login successful
- [ ] Can create businesses
- [ ] Custom document types working

### **Render Deployed:**
- [ ] GitHub repo pushed
- [ ] Render service deployed
- [ ] Environment variables set
- [ ] Website accessible
- [ ] Production login working

---

## 🔧 **TROUBLESHOOTING**

### **"Login failed":**
```sql
-- Check admin user exists:
SELECT * FROM admin_users WHERE username = 'quanadmin';

-- If not exists, create:
INSERT INTO admin_users (username, password, role) 
VALUES ('quanadmin', '0102', 'admin');
```

### **"Database connection failed":**
```bash
# Check connection string format:
postgresql://username:password@host/dbname?sslmode=require

# Ensure pooled connection used (faster)
```

### **"Table does not exist":**
```sql
-- Re-run the complete setup script above
-- Check tables:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

## 🎯 **FINAL RESULT**

**Development**: Replit với Neon database hoạt động 100%
**Production**: Render.com hosting với $0/month
**Database**: Neon PostgreSQL free tier
**Features**: Full Vietnamese business management system

Website sẽ có URL: `https://royal-vietnam-business.onrender.com`