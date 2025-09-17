import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBusinessSchema, 
  updateBusinessSchema, 
  searchBusinessSchema, 
  deleteBusinessSchema,
  deleteDocumentTransactionSchema,
  insertDocumentTransactionSchema,
  insertBusinessAccountSchema,
  updateBusinessAccountSchema,
  uploadSignedDocumentSchema,
  loginSchema,
  userLoginSchema,
  changePasswordSchema
} from "@shared/schema";
import { z } from "zod";
import { 
  ObjectNotFoundError // We still need this for the /objects/:objectPath(*) route
} from "./objectStorage";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const DELETE_PASSWORD = "0102";

// Configure Multer for file uploads
const uploadDir = process.env.PRIVATE_OBJECT_DIR || "/app/uploads"; // Use the same directory as object storage
const storageConfig = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storageConfig });

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render
  app.get("/api/health", async (req, res) => {
    try {
      // Simple database connection test
      const { pool } = await import("./db");
      const client = await pool.connect();
      await client.query('SELECT 1 as health_check');
      client.release();
      
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        database: "connected"
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({ 
        status: "error", 
        message: "Database connection failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Production debug endpoint
  app.get("/api/debug", async (req, res) => {
    try {
      // Check storage methods availability
      const storageCheck = {
        getAllBusinessesForAutocomplete: typeof storage.getAllBusinessesForAutocomplete === 'function',
        getAllDocumentTransactions: typeof storage.getAllDocumentTransactions === 'function',
        createBusiness: typeof storage.createBusiness === 'function',
        getBusinessById: typeof storage.getBusinessById === 'function'
      };
      
      // Try to get data count
      let dataCount: { businesses: number; transactions: number; error: string | null } = { businesses: 0, transactions: 0, error: null };
      try {
        if (storage.getAllBusinessesForAutocomplete) {
          const businesses = await storage.getAllBusinessesForAutocomplete();
          dataCount.businesses = businesses.length;
        }
        if (storage.getAllDocumentTransactions) {
          const transactions = await storage.getAllDocumentTransactions();
          dataCount.transactions = transactions.length;
        }
      } catch (error) {
        dataCount.error = error instanceof Error ? error.message : String(error);
      }
      
      res.json({
        status: "debug_info",
        timestamp: new Date().toISOString(),
        storage_methods: storageCheck,
        data_count: dataCount,
        node_env: process.env.NODE_ENV,
        deployment: "production"
      });
    } catch (error) {
      console.error('Debug check failed:', error);
      res.status(500).json({ 
        status: "debug_error", 
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  });

  // Database initialization endpoint
  app.post("/api/initialize-db", async (req, res) => {
    try {
      console.log("Initializing database...");
      await storage.initializeDatabase();
      res.json({ message: "Database initialized successfully" });
    } catch (error) {
      console.error("Database initialization failed:", error);
      res.status(500).json({ message: "Database initialization failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Simple migration endpoint for production setup
  app.post("/api/migrate", async (req, res) => {
    try {
      console.log("Running production migration...");
      const { pool } = await import("./db");
      const client = await pool.connect();

      // Chỉ tạo admin user, không tạo lại bảng để tránh xung đột với initializeDatabase()
      await client.query(`
        INSERT INTO admin_users (username, password)
        VALUES ('quanadmin', '01020811')
        ON CONFLICT (username) DO NOTHING
      `);

      client.release();
      console.log("Migration completed successfully (tables skipped)");
      res.json({ message: "Migration completed successfully (tables skipped)" });
    } catch (error) {
      console.error("Migration failed:", error);
      res.status(500).json({ message: "Migration failed", error: error instanceof Error ? error.message : String(error) });
    }
  });
  // Get all businesses with pagination and sorting
  app.get("/api/businesses", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = req.query.sortBy as string || 'createdAt'; // createdAt, name, taxId
      const sortOrder = req.query.sortOrder as string || 'asc'; // asc, desc
      
      const result = await storage.getAllBusinesses(page, limit, sortBy, sortOrder);
      res.json(result);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Lỗi khi tải danh sách doanh nghiệp" });
    }
  });

  // Get all businesses (without pagination) for autocomplete
  app.get("/api/businesses/all", async (req, res) => {
    try {
      const businesses = await storage.getAllBusinessesForAutocomplete();
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching all businesses:", error);
      res.status(500).json({ message: "Lỗi khi tải danh sách doanh nghiệp" });
    }
  });

  // Get business by ID
  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const business = await storage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });
      }

      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Lỗi khi tải thông tin doanh nghiệp" });
    }
  });

  // Create new business
  app.post("/api/businesses", async (req, res) => {
    try {
      const validatedData = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness(validatedData);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ",
          errors: error.errors 
        });
      }
      
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return res.status(400).json({ message: "Mã số thuế đã tồn tại" });
      }
      
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Lỗi khi tạo doanh nghiệp mới" });
    }
  });

  // Update business
  app.put("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const validatedData = updateBusinessSchema.parse({ ...req.body, id });
      const business = await storage.updateBusiness(validatedData);
      
      if (!business) {
        return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });
      }

      res.json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật doanh nghiệp" });
    }
  });

  // Search businesses
  app.post("/api/businesses/search", async (req, res) => {
    try {
      const validatedData = searchBusinessSchema.parse(req.body);
      const businesses = await storage.searchBusinesses(validatedData);
      res.json(businesses);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu tìm kiếm không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error searching businesses:", error);
      res.status(500).json({ message: "Lỗi khi tìm kiếm doanh nghiệp" });
    }
  });

  // Delete business (with password protection)
  app.delete("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const validatedData = deleteBusinessSchema.parse({ ...req.body, id });
      
      if (validatedData.password !== DELETE_PASSWORD) {
        return res.status(403).json({ message: "Mật khẩu không đúng" });
      }

      const success = await storage.deleteBusiness(id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy doanh nghiệp" });
      }

      res.json({ message: "Xóa doanh nghiệp thành công" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error deleting business:", error);
      res.status(500).json({ message: "Lỗi khi xóa doanh nghiệp" });
    }
  });

  // Simple token storage for authentication - updated for new system
  const authTokens = new Map<string, { userType: string; userData: any }>();
  
  function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // New unified authentication route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = userLoginSchema.parse(req.body);
      const authResult = await storage.authenticateUser(validatedData);
      
      if (!authResult) {
        return res.status(401).json({ message: "Thông tin đăng nhập không đúng" });
      }

      const token = generateToken();
      authTokens.set(token, authResult);

      res.json({ 
        success: true, 
        token,
        user: {
          userType: authResult.userType,
          userData: authResult.userData
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu đăng nhập không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error during login:", error);
      res.status(500).json({ message: "Lỗi khi đăng nhập" });
    }
  });

  // Legacy admin login for backward compatibility
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const admin = await storage.authenticateAdmin(validatedData);
      
      if (!admin) {
        return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
      }

      const token = generateToken();
      authTokens.set(token, { userType: "admin", userData: admin });

      res.json({ 
        success: true, 
        token,
        admin: { id: admin.id, username: admin.username } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu đăng nhập không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Lỗi khi đăng nhập admin" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      authTokens.delete(token);
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const authData = token ? authTokens.get(token) : null;
    
    if (authData) {
      res.json({ 
        isAuthenticated: true, 
        user: {
          userType: authData.userType,
          userData: authData.userData
        }
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const authData = token ? authTokens.get(token) : null;
      
      if (!authData || authData.userType !== "admin") {
        return res.status(401).json({ message: "Chưa đăng nhập hoặc không có quyền" });
      }

      const validatedData = changePasswordSchema.parse(req.body);
      const success = await storage.changeAdminPassword(authData.userData.username, validatedData);
      
      if (!success) {
        return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
      }

      res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Lỗi khi đổi mật khẩu" });
    }
  });

  // Route to update business access code (admin only)
  app.put("/api/businesses/:id/access-code", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const authData = token ? authTokens.get(token) : null;
      
      if (!authData || authData.userType !== "admin") {
        return res.status(401).json({ message: "Chỉ admin mới có quyền thay đổi mã truy cập" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const { accessCode } = req.body;
      if (!accessCode || typeof accessCode !== 'string') {
        return res.status(400).json({ message: "Mã truy cập không hợp lệ" });
      }

      const success = await storage.updateBusinessAccessCode(id, accessCode);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy doanh nghiệp hoặc cập nhật thất bại" });
      }

      res.json({ success: true, message: "Cập nhật mã truy cập thành công" });
    } catch (error) {
      console.error("Error updating access code:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật mã truy cập" });
    }
  });

  // Update document transaction with PDF file
  app.put("/api/documents/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const { pdfUrl, fileName } = req.body;
      if (!pdfUrl || !fileName) {
        return res.status(400).json({ message: "URL PDF và tên file là bắt buộc" });
      }

      // The pdfUrl from client is already the relative path from Multer
      const normalizedPath = pdfUrl; 

      console.log("Calling updateDocumentTransactionPdf with:", { id, normalizedPath, fileName });
      const success = await storage.updateDocumentTransactionPdf(id, normalizedPath, fileName);
      console.log("updateDocumentTransactionPdf result:", success);
      
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy giao dịch" });
      }

      res.json({ success: true, objectPath: normalizedPath });
    } catch (error) {
      console.error("Error updating PDF:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật file PDF" });
    }
  });

  // Delete PDF file from transaction
  app.delete("/api/documents/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const transaction = await storage.getDocumentTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Không tìm thấy giao dịch" });
      }

      // Delete file from object storage if exists
      if (transaction.pdfFilePath) {
        // Extract the actual file path from the stored /objects/ prefix
        const localFilePath = path.join(uploadDir, transaction.pdfFilePath.replace('/objects/', ''));
        try {
          await fs.unlink(localFilePath);
          console.log(`Deleted file: ${localFilePath}`);
        } catch (error) {
          console.warn("Could not delete file from local storage:", localFilePath, error);
        }
      }

      // Update database to remove file references
      const success = await storage.updateDocumentTransactionPdf(id, null, null);
      if (!success) {
        return res.status(500).json({ message: "Lỗi khi xóa thông tin file" });
      }

      res.json({ success: true, message: "Xóa file PDF thành công" });
    } catch (error) {
      console.error("Error deleting PDF:", error);
      res.status(500).json({ message: "Lỗi khi xóa file PDF" });
    }
  });

  // Download PDF file from transaction
  app.get("/api/documents/:id/pdf/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const transaction = await storage.getDocumentTransaction(id);
      if (!transaction || !transaction.pdfFilePath) {
        return res.status(404).json({ message: "Không tìm thấy file PDF" });
      }

      // Construct local file path
      const localFilePath = path.join(uploadDir, transaction.pdfFilePath.replace('/objects/', ''));
      
      try {
        // Check if file exists
        await fs.access(localFilePath);
      } catch (e) {
        console.error(`File not found at ${localFilePath}:`, e);
        return res.status(404).json({ message: "Không tìm thấy file PDF trên hệ thống" });
      }

      // Set content disposition for download
      const fileName = transaction.pdfFileName || `transaction_${id}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Content-Type', 'application/pdf');

      // Stream the file to the response
      res.sendFile(localFilePath);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Lỗi khi tải file PDF" });
      }
    }
  });

  // Business accounts routes
  app.get('/api/businesses/:id/accounts', async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "ID doanh nghiệp không hợp lệ" });
      }

      const account = await storage.getBusinessAccount(businessId);
      return res.json(account);
    } catch (error) {
      console.error("Error fetching business account:", error);
      return res.status(500).json({ message: "Lỗi khi tải thông tin tài khoản" });
    }
  });

  app.post('/api/businesses/:id/accounts', async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const data = req.body;
      const account = await storage.createBusinessAccount({ ...data, businessId });
      return res.status(201).json(account);
    } catch (error) {
      console.error("Error creating business account:", error);
      return res.status(500).json({ message: "Lỗi khi tạo tài khoản" });
    }
  });

  app.put('/api/businesses/:id/accounts', async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const data = req.body;
      const account = await storage.updateBusinessAccount(businessId, data);
      return res.json(account);
    } catch (error) {
      console.error("Error updating business account:", error);
      return res.status(500).json({ message: "Lỗi khi cập nhật tài khoản" });
    }
  });

  // Document transaction routes
  app.post("/api/businesses/:businessId/documents", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "ID doanh nghiệp không hợp lệ" });
      }

      const validatedData = insertDocumentTransactionSchema.parse({ 
        ...req.body, 
        businessId 
      });
      
      console.log(`🔍 Server received request body:`, req.body);
      console.log(`🔍 Server documentDetails:`, req.body.documentDetails);
      console.log(`🔍 Validated data documentDetails:`, validatedData.documentDetails);
      console.log(`Creating document transaction for business ID: ${businessId}`, { businessId, documentDetails: validatedData.documentDetails, deliveryCompany: validatedData.deliveryCompany });
      const transaction = await storage.createDocumentTransaction(validatedData);
      console.log(`Created transaction with ID: ${transaction.id} for business ${businessId}`);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error creating document transaction:", error);
      res.status(500).json({ message: "Lỗi khi tạo giao dịch hồ sơ" });
    }
  });

  app.get("/api/businesses/:businessId/documents", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "ID doanh nghiệp không hợp lệ" });
      }

      console.log(`Fetching documents for business ID: ${businessId}`);
      const transactions = await storage.getDocumentTransactionsByBusinessId(businessId);
      console.log(`Found ${transactions.length} transactions for business ${businessId}:`, transactions.map(t => ({ id: t.id, businessId: t.businessId, documentDetails: t.documentDetails })));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching document transactions:", error);
      res.status(500).json({ message: "Lỗi khi tải lịch sử giao nhận hồ sơ" });
    }
  });

  // API lấy tất cả document transactions
  app.get("/api/documents", async (req, res) => {
    try {
      const transactions = await storage.getAllDocumentTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching all document transactions:", error);
      res.status(500).json({ message: "Lỗi khi tải danh sách giao dịch hồ sơ" });
    }
  });

  // API lấy documents liên quan đến một công ty (giao hoặc nhận)
  app.get("/api/documents/company/:companyName", async (req, res) => {
    try {
      const companyName = decodeURIComponent(req.params.companyName);
      const transactions = await storage.getDocumentTransactionsByCompany(companyName);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching document transactions by company:", error);
      res.status(500).json({ message: "Lỗi khi tải hồ sơ theo công ty" });
    }
  });

  // API lấy documents theo mã số thuế
  app.get("/api/documents/tax-id/:taxId", async (req, res) => {
    try {
      const taxId = req.params.taxId;
      const transactions = await storage.getDocumentTransactionsByTaxId(taxId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching document transactions by tax ID:", error);
      res.status(500).json({ message: "Lỗi khi tải danh sách giao dịch hồ sơ theo mã số thuế" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      // Validate password for deletion
      const validatedData = deleteDocumentTransactionSchema.parse({
        id,
        password: req.body.password
      });

      if (validatedData.password !== DELETE_PASSWORD) {
        return res.status(403).json({ message: "Mật khẩu xóa không đúng" });
      }

      const success = await storage.deleteDocumentTransaction(id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy giao dịch hồ sơ" });
      }

      res.json({ message: "Xóa giao dịch hồ sơ thành công" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu xóa không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error deleting document transaction:", error);
      res.status(500).json({ message: "Lỗi khi xóa giao dịch hồ sơ" });
    }
  });

  // Business accounts endpoints
  app.post("/api/businesses/:businessId/accounts", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "ID doanh nghiệp không hợp lệ" });
      }

      const validatedData = insertBusinessAccountSchema.parse({
        ...req.body,
        businessId
      });

      const account = await storage.createBusinessAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu tài khoản không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error creating business account:", error);
      res.status(500).json({ message: "Lỗi khi tạo tài khoản doanh nghiệp" });
    }
  });

  app.get("/api/businesses/:businessId/accounts", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "ID doanh nghiệp không hợp lệ" });
      }

      const account = await storage.getBusinessAccountByBusinessId(businessId);
      res.json(account || null);
    } catch (error) {
      console.error("Error fetching business account:", error);
      res.status(500).json({ message: "Lỗi khi lấy thông tin tài khoản" });
    }
  });

  app.put("/api/businesses/:businessId/accounts", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "ID doanh nghiệp không hợp lệ" });
      }

      const validatedData = updateBusinessAccountSchema.parse(req.body);
      const account = await storage.updateBusinessAccount(businessId, validatedData);
      
      if (!account) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }

      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu cập nhật không hợp lệ",
          errors: error.errors 
        });
      }
      
      console.error("Error updating business account:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật tài khoản" });
    }
  });

  // New PDF upload endpoint using Multer
  app.post("/api/upload-pdf", upload.single('pdfFile'), async (req, res) => {
    console.log("PDF upload request received.");
    try {
      if (req.file) {
        console.log("File received:", req.file);
      } else {
        console.log("No file received in request.");
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      // req.file.path will be something like /app/uploads/pdfFile-123456789.pdf
      const filePathInContainer = req.file.path;
      // We need to store a path relative to the object storage service's base path, or a public URL
      // For now, let's just return the path relative to the container's UPLOAD_DIR
      const relativePath = path.relative(uploadDir, filePathInContainer);
      console.log("Upload directory:", uploadDir);
      console.log("File path in container:", filePathInContainer);
      console.log("Relative path:", relativePath);
      res.json({ 
        message: "File uploaded successfully",
        filePath: `${relativePath}` // Return the relative path for consistency with client
      });
    } catch (error) {
      console.error("Error uploading PDF with Multer:", error);
      if (error instanceof Error) {
        console.error("Multer error details:", error.message, error.stack);
      }
      res.status(500).json({ message: "Failed to upload PDF" });
    }
  });

  // Update document number
  app.put("/api/documents/:id/number", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const authData = token ? authTokens.get(token) : null;
      
      if (!authData) {
        return res.status(401).json({ message: "Chưa đăng nhập" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const { documentNumber } = req.body;
      if (typeof documentNumber !== 'string') {
        return res.status(400).json({ message: "Số văn bản không hợp lệ" });
      }

      const success = await storage.updateDocumentNumber(id, documentNumber);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy giao dịch hồ sơ" });
      }

      res.json({ message: "Cập nhật số văn bản thành công" });
    } catch (error) {
      console.error("Error updating document number:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật số văn bản" });
    }
  });

  // Get document transactions by tax ID (chỉ hiển thị giao dịch liên quan đến doanh nghiệp có mã số thuế này)
  app.get("/api/documents/tax-id/:taxId", async (req, res) => {
    try {
      const taxId = req.params.taxId;
      const transactions = await storage.getDocumentTransactionsByTaxId(taxId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching document transactions by tax ID:", error);
      res.status(500).json({ message: "Lỗi khi tải danh sách giao dịch hồ sơ theo mã số thuế" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
