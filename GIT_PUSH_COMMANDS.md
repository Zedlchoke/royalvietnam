# 🚀 GIT COMMANDS ĐỂ PUSH LÊN GITHUB

## 📋 **BƯỚC 1: KIỂM TRA TRẠNG THÁI**

```bash
# Kiểm tra git status
git status

# Nếu chưa init git
git init
```

## 📦 **BƯỚC 2: ADD CÁC FILE QUAN TRỌNG**

```bash
# Core application files
git add client/
git add server/
git add shared/
git add package.json
git add package-lock.json
git add tsconfig.json
git add vite.config.ts
git add tailwind.config.ts
git add postcss.config.js
git add drizzle.config.ts
git add components.json

# Render deployment files
git add render-build.sh
git add render.yaml
git add deploy-to-render.md
git add .env.example
git add MANUAL_DATABASE_SETUP.sql

# Updated gitignore and documentation
git add .gitignore
git add replit.md
git add CLIENT_DATABASE_ANALYSIS.md
git add DATABASE_CLIENT_MISMATCH_ANALYSIS.md
git add DEPLOYMENT_FILES.md
git add GIT_PUSH_COMMANDS.md

# Optional documentation files
git add RENDER_DEPLOYMENT_CHECKLIST.md
git add COLUMN_REFERENCE.md
```

## 🔍 **BƯỚC 3: KIỂM TRA NHỮNG GÌ SẼ ĐƯỢC COMMIT**

```bash
# Xem danh sách files sẽ được commit
git status

# Xem nội dung thay đổi
git diff --cached
```

## 💾 **BƯỚC 4: COMMIT**

```bash
git commit -m "✅ Production-ready Royal Vietnam Business Management System

- ✅ Database schema fixed and synchronized with client APIs
- ✅ Custom document types with free text input
- ✅ Multi-document support with JSONB
- ✅ 7 complete business account types
- ✅ Render deployment optimized for free tier
- ✅ PDF upload/download functionality
- ✅ Authentication system with admin/employee roles
- ✅ Cost-optimized queries and connection pooling
- 🚀 Ready for $0/month Render hosting"
```

## 🌐 **BƯỚC 5: SETUP REMOTE VÀ PUSH**

```bash
# Thay YOUR_USERNAME và YOUR_REPO bằng thông tin thực tế
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push lần đầu
git push -u origin main
```

## 🔐 **BƯỚC 6: XỬ LÝ AUTHENTICATION (NẾU CẦN)**

### **Nếu dùng HTTPS:**
```bash
# GitHub sẽ yêu cầu username và Personal Access Token
# Không dùng password, cần tạo Personal Access Token tại:
# GitHub → Settings → Developer settings → Personal access tokens
```

### **Nếu dùng SSH:**
```bash
# Thay đổi remote URL
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## ✅ **VERIFY PUSH THÀNH CÔNG**

```bash
# Kiểm tra remote
git remote -v

# Kiểm tra branch
git branch -a

# Kiểm tra log
git log --oneline -5
```

## 📋 **CHECKLIST TRƯỚC KHI PUSH**

- [ ] Database đã hoạt động bình thường trên Replit
- [ ] Custom document types functional
- [ ] All APIs working (businesses, documents, auth)
- [ ] render-build.sh có executable permissions
- [ ] .env.example có template đầy đủ
- [ ] .gitignore loại trừ file nhạy cảm
- [ ] Không có file .env thực trong commit

## 🎯 **SAU KHI PUSH THÀNH CÔNG**

1. **Truy cập GitHub repo** để verify files đã upload
2. **Đi đến Render.com** để connect repo
3. **Deploy as Web Service** với:
   - Build command: `./render-build.sh`
   - Start command: `npm start`
4. **Setup PostgreSQL database** với script từ `MANUAL_DATABASE_SETUP.sql`
5. **Set environment variables** từ template `.env.example`
6. **Test website live** trên *.onrender.com domain

## 🚨 **NẾU GẶP LỖI**

### **"remote: Repository not found"**
```bash
# Kiểm tra repo name và permissions
git remote -v
# Tạo repo mới trên GitHub hoặc check quyền access
```

### **"failed to push some refs"**
```bash
# Pull changes trước
git pull origin main --allow-unrelated-histories
git push origin main
```

### **"Authentication failed"**
```bash
# Cần Personal Access Token thay vì password
# Hoặc setup SSH key
```

**Chạy các commands trên từng bước một và repo sẽ ready for Render deployment!**