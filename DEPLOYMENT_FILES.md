# 📁 FILES CẦN PUSH LÊN GITHUB REPO

## 🚀 **CÁC FILE QUAN TRỌNG NHẤT (BẮT BUỘC)**

### **1. Build & Deploy Scripts:**
```
render-build.sh          # Script build production cho Render
render.yaml              # Cấu hình deploy Render
deploy-to-render.md      # Hướng dẫn deploy chi tiết
```

### **2. Package Configuration:**
```
package.json             # Dependencies và scripts
package-lock.json        # Lock exact versions
tsconfig.json           # TypeScript config
```

### **3. Application Code:**
```
client/                  # Toàn bộ thư mục frontend
server/                  # Toàn bộ thư mục backend  
shared/                  # Types và schemas chung
```

### **4. Config Files:**
```
vite.config.ts          # Vite build config
tailwind.config.ts      # Tailwind CSS config
postcss.config.js       # PostCSS config
drizzle.config.ts       # Database config
components.json         # shadcn/ui config
```

### **5. Environment & Database:**
```
.env.example            # Template cho environment variables
MANUAL_DATABASE_SETUP.sql  # SQL script để setup database
```

---

## 📋 **CÁC FILE DOCUMENTATION (TÙY CHỌN)**

### **Hướng dẫn deployment:**
```
CLIENT_DATABASE_ANALYSIS.md     # Phân tích database đã hoàn thành
RENDER_DEPLOYMENT_CHECKLIST.md  # Checklist deploy
replit.md                       # Project overview
```

### **Development guides:**
```
DATABASE_COST_OPTIMIZATION.md   # Tối ưu database
COLUMN_REFERENCE.md             # Reference cột database
```

---

## ⚠️ **CÁC FILE KHÔNG NÊN PUSH**

### **Sensitive Files:**
```
.env                    # Environment variables thật (chứa secrets)
.replit                 # Replit config (chỉ dành cho Replit)
node_modules/           # Dependencies (sẽ được install lại)
```

### **Temporary Files:**
```
attached_assets/        # Files upload của user
*.pdf                   # Test files
test-*.json             # Test data
downloaded_test.pdf     # Test files
```

---

## 🔧 **LỆNH PUSH LÊN GITHUB**

### **Bước 1: Initialize Git (nếu chưa có)**
```bash
git init
git add .gitignore
```

### **Bước 2: Add essential files**
```bash
# Core application
git add client/ server/ shared/
git add package.json package-lock.json
git add tsconfig.json vite.config.ts tailwind.config.ts
git add components.json postcss.config.js drizzle.config.ts

# Render deployment files  
git add render-build.sh render.yaml
git add deploy-to-render.md
git add .env.example
git add MANUAL_DATABASE_SETUP.sql

# Documentation
git add replit.md CLIENT_DATABASE_ANALYSIS.md
git add RENDER_DEPLOYMENT_CHECKLIST.md
```

### **Bước 3: Commit and Push**
```bash
git commit -m "✅ Production-ready: Database fixed, Render optimized, Custom document types"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 📊 **VERIFY TRƯỚC KHI PUSH**

### **Check các file quan trọng:**
- [ ] `render-build.sh` có executable permissions
- [ ] `render.yaml` có đúng build command  
- [ ] `package.json` có đúng start script
- [ ] `.env.example` có template đầy đủ
- [ ] `MANUAL_DATABASE_SETUP.sql` có SQL hoàn chỉnh

### **Check .gitignore bao gồm:**
```
node_modules/
.env
*.log
dist/
.DS_Store
attached_assets/
*.pdf
test-*.json
```

---

## 🎯 **SAU KHI PUSH THÀNH CÔNG**

1. **Truy cập Render.com**
2. **Connect GitHub repo** 
3. **Deploy as Web Service**
4. **Set environment variables** từ .env.example
5. **Setup PostgreSQL database** với MANUAL_DATABASE_SETUP.sql
6. **Website live tại *.onrender.com**

**Chi tiết deployment:** xem file `deploy-to-render.md`