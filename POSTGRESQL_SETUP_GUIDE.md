# 🐘 HƯỚNG DẪN SETUP POSTGRESQL DATABASE

## 🎯 **CHỌN PROVIDER POSTGRESQL**

### **1. NEON.TECH (KHUYẾN NGHỊ) - FREE TIER**
- ✅ **Free**: 3GB storage, 1 CPU
- ✅ **Serverless**: Auto sleep/wake  
- ✅ **Easy setup**: 2-3 clicks
- ✅ **Render compatible**

### **2. SUPABASE - FREE TIER**
- ✅ **Free**: 500MB storage, 2 projects
- ✅ **Full PostgreSQL**: + Auth, Storage
- ✅ **Dashboard**: Easy management

### **3. RAILWAY - FREE TIER** 
- ✅ **Free**: $5 credit/month
- ✅ **Simple**: One-click deploy
- ⚠️ **Limited**: Credit-based usage

### **4. RENDER POSTGRESQL - PAID**
- ❌ **$7/month minimum**
- ✅ **Same platform**: Easy integration

---

## 🚀 **PHƯƠNG ÁN 1: NEON.TECH (KHUYẾN NGHỊ)**

### **Bước 1: Đăng ký Neon**
1. Truy cập **https://neon.tech**
2. Đăng ký free account
3. Tạo project mới: "Royal Vietnam Business"

### **Bước 2: Tạo Database**
1. Click **"Create Database"**
2. Database name: `royal_vietnam_db`
3. Copy **Connection String**:
   ```
   postgresql://username:password@host/dbname?sslmode=require
   ```

### **Bước 3: Setup Tables**
1. Mở **Neon Console** > **SQL Editor**
2. Copy toàn bộ nội dung file `MANUAL_DATABASE_SETUP.sql`
3. Paste và **Execute**
4. Verify tables created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### **Bước 4: Update Environment**
```bash
# File .env (local)
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"

# Render deployment
# Thêm DATABASE_URL vào Environment Variables
```

---

## 🚀 **PHƯƠNG ÁN 2: SUPABASE**

### **Bước 1: Đăng ký Supabase**
1. Truy cập **https://supabase.com**
2. Tạo project: "Royal Vietnam Business"
3. Chọn region: **Singapore** (gần Việt Nam nhất)

### **Bước 2: Get Connection String**
1. **Settings** > **Database**
2. Copy **Connection string**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### **Bước 3: Run SQL Setup**
1. **SQL Editor** trong Supabase dashboard
2. Paste `MANUAL_DATABASE_SETUP.sql`
3. Click **Run**

---

## 🚀 **PHƯƠNG ÁN 3: RAILWAY**

### **Bước 1: Deploy to Railway**
1. Truy cập **https://railway.app**
2. **New Project** > **Deploy PostgreSQL**
3. Database auto-created

### **Bước 2: Get Credentials**
1. Click database service
2. **Variables** tab
3. Copy `DATABASE_URL`

### **Bước 3: Connect và Setup**
1. Railway **Query** tab
2. Paste `MANUAL_DATABASE_SETUP.sql`
3. Execute

---

## 🛠️ **SETUP TABLES VỚI SQL SCRIPT**

Dù dùng provider nào, bạn cũng cần chạy script SQL này:

```sql
-- File: MANUAL_DATABASE_SETUP.sql đã có sẵn
-- Copy toàn bộ và paste vào SQL console của provider
```

**Script bao gồm:**
- Tạo 3 tables: `businesses`, `document_transactions`, `admin_users`
- Thêm 43 columns cho businesses (7 loại tài khoản)
- Thêm 22 columns cho document_transactions
- Indexes để tăng hiệu suất
- Triggers auto-update timestamp
- Dữ liệu admin mặc định

---

## ✅ **VERIFY DATABASE HOẠT ĐỘNG**

### **Test Connection:**
```bash
# Test trên Replit
npm run dev

# Kiểm tra logs:
"Database connection verified successfully"
"Database tables created successfully"
```

### **Test trên Browser:**
1. Mở website
2. Login: `quanadmin` / `0102`
3. Tạo doanh nghiệp mới
4. Kiểm tra có lưu được không

---

## 🎯 **CHO RENDER DEPLOYMENT**

### **Environment Variables cần set:**
```bash
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require
NODE_ENV=production
```

### **Connection Pooling (quan trọng):**
Project đã được tối ưu với:
- Max 3 connections (free tier friendly)
- Connection timeout handling
- Graceful shutdown

---

## 🔧 **TROUBLESHOOTING**

### **"Connection refused":**
```bash
# Kiểm tra:
1. Connection string đúng chưa?
2. Database có online không?
3. Firewall/SSL settings
```

### **"Table does not exist":**
```bash
# Chạy lại setup script:
# Copy MANUAL_DATABASE_SETUP.sql vào SQL console
```

### **"Too many connections":**
```bash
# Free tier limits:
- Neon: 100 connections
- Supabase: 60 connections  
- Railway: Varies by plan
```

---

## 🎯 **KHUYẾN NGHỊ**

**Cho Development**: Neon.tech (free, reliable)
**Cho Production**: Neon.tech hoặc upgrade plan
**Cho Testing**: Supabase (có dashboard tốt)

Bạn muốn setup với provider nào? Tôi có thể hướng dẫn chi tiết từng bước!