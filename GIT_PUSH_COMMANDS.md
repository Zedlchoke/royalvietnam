# 🚀 GIT COMMANDS CHO GITHUB + RENDER DEPLOYMENT

## 📋 **BƯỚC 1: CHUẨN BỊ FILES CHO GITHUB**

### **Add essential files:**
```bash
# Core application files
git add client/ server/ shared/
git add package.json package-lock.json
git add tsconfig.json vite.config.ts
git add tailwind.config.ts postcss.config.js
git add components.json

# Database và deployment files
git add drizzle.config.ts
git add render-build.sh render.yaml
git add .env.example .gitignore

# Documentation
git add NEON_DATABASE_SETUP.sql
git add NEON_RENDER_SETUP_COMPLETE.md
git add replit.md
```

### **Exclude không cần thiết:**
```bash
# Add to .gitignore if not already there
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore
echo "dist/" >> .gitignore
echo ".replit" >> .gitignore
```

## 📋 **BƯỚC 2: GIT COMMANDS**

### **First time setup:**
```bash
git init
git add .
git commit -m "🚀 Initial commit: Royal Vietnam Business Management System

✅ Complete React/TypeScript frontend with shadcn/ui
✅ Express.js backend with PostgreSQL integration  
✅ 43-column businesses table with 7 account types
✅ 20-column document_transactions with custom types
✅ Admin authentication: quanadmin / 01020811
✅ Employee authentication: any-username / royalvietnam
✅ PDF upload/download management
✅ Custom document types with JSONB support
✅ Render deployment ready with build scripts
✅ Neon database setup script included"

git branch -M main
```

### **Connect to GitHub:**
```bash
# Thay YOUR_USERNAME và YOUR_REPO bằng tên thực tế
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### **Future updates:**
```bash
git add .
git commit -m "🔧 Update: [Mô tả thay đổi]"
git push origin main
```

## 📋 **BƯỚC 3: RENDER DEPLOYMENT SETTINGS**

### **Repository Settings:**
- **Repository**: `https://github.com/YOUR_USERNAME/YOUR_REPO`
- **Branch**: `main`
- **Build Command**: `./render-build.sh`
- **Start Command**: `npm start`
- **Environment**: `Node`

### **Environment Variables:**
```bash
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.pooler.neon.tech/royal_vietnam_db?sslmode=require
NODE_ENV=production
```

### **Auto-Deploy Settings:**
- ✅ Auto-Deploy: Yes
- ✅ Build every push to main branch

## 📋 **BƯỚC 4: VERIFY DEPLOYMENT**

### **Check deployment logs:**
1. Render Dashboard → Service → Logs
2. Look for: "serving on port 5000"
3. Check health: `https://your-app.onrender.com/api/health`

### **Test production login:**
1. Visit: `https://your-app.onrender.com`
2. Admin login: `quanadmin` / `01020811`
3. Employee login: `any-username` / `royalvietnam`
4. Test creating businesses and custom document types

## ⚡ **QUICK DEPLOY SCRIPT**

Copy paste này để deploy nhanh:

```bash
# Chuẩn bị files
git add client/ server/ shared/ package.json package-lock.json tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js components.json drizzle.config.ts render-build.sh render.yaml .env.example .gitignore NEON_DATABASE_SETUP.sql NEON_RENDER_SETUP_COMPLETE.md replit.md

# Commit và push
git commit -m "🚀 Production ready: Neon + Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Sau đó vào Render.com setup như hướng dẫn trên!