import { 
  businesses, 
  businessAccounts,
  documentTransactions, 
  adminUsers,
  type Business, 
  type BusinessAccount,
  type InsertBusiness, 
  type InsertBusinessAccount,
  type UpdateBusiness, 
  type UpdateBusinessAccount,
  type SearchBusiness,
  type DocumentTransaction,
  type InsertDocumentTransaction,
  type AdminUser,
  type InsertAdminUser,
  type LoginRequest,
  type UserLoginRequest,
  type ChangePasswordRequest
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, like, sql } from "drizzle-orm";
import { cache, CACHE_KEYS, CACHE_TTL } from "./cache";

export interface IStorage {
  // Business operations
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessById(id: number): Promise<Business | undefined>;
  getAllBusinesses(page?: number, limit?: number, sortBy?: string, sortOrder?: string): Promise<{ businesses: Business[], total: number }>;
  getAllBusinessesForAutocomplete(): Promise<Business[]>;
  updateBusiness(business: UpdateBusiness): Promise<Business | undefined>;
  deleteBusiness(id: number): Promise<boolean>;
  searchBusinesses(search: SearchBusiness): Promise<Business[]>;
  

  
  // Document transaction operations
  createDocumentTransaction(transaction: InsertDocumentTransaction): Promise<DocumentTransaction>;
  getDocumentTransactionsByBusinessId(businessId: number): Promise<DocumentTransaction[]>;
  getAllDocumentTransactions(): Promise<DocumentTransaction[]>;
  deleteDocumentTransaction(id: number): Promise<boolean>;
  
  // Admin operations
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  authenticateAdmin(login: LoginRequest): Promise<AdminUser | null>;
  changeAdminPassword(username: string, request: ChangePasswordRequest): Promise<boolean>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  
  // New authentication system
  authenticateUser(login: UserLoginRequest): Promise<{ userType: string; userData: any } | null>;
  getBusinessByTaxId(taxId: string): Promise<Business | undefined>;
  updateBusinessAccessCode(id: number, accessCode: string): Promise<boolean>;
  
  // Document transaction enhanced operations
  getDocumentTransactionsByCompany(companyName: string): Promise<DocumentTransaction[]>;
  getDocumentTransactionsByTaxId(taxId: string): Promise<DocumentTransaction[]>;
  updateDocumentNumber(id: number, documentNumber: string): Promise<boolean>;
  updateSignedFilePath(id: number, signedFilePath: string): Promise<boolean>;
  updateDocumentTransactionPdf(id: number, pdfFilePath: string | null, pdfFileName: string | null): Promise<boolean>;
  getDocumentTransaction(id: number): Promise<DocumentTransaction | undefined>;
  
  // Business Account methods
  getBusinessAccount(businessId: number): Promise<BusinessAccount | null>;
  getBusinessAccountByBusinessId(businessId: number): Promise<BusinessAccount | null>;
  createBusinessAccount(account: InsertBusinessAccount): Promise<BusinessAccount>;
  updateBusinessAccount(businessId: number, account: Partial<InsertBusinessAccount>): Promise<BusinessAccount>;
  updateDocumentPdf(id: number, pdfPath: string): Promise<boolean>;
  
  // Database initialization
  initializeDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createBusiness(business: InsertBusiness): Promise<Business> {
    try {
      console.log("Creating business:", business);
      const [createdBusiness] = await db
        .insert(businesses)
        .values([business])
        .returning();
      
      console.log("Business created:", createdBusiness);
      
      // Invalidate businesses cache after creation
      cache.clear(CACHE_KEYS.BUSINESSES_COUNT);
      
      return createdBusiness;
    } catch (error) {
      console.error("Error creating business:", error);
      throw error;
    }
  }

  async getBusinessById(id: number): Promise<Business | undefined> {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id));
    return business || undefined;
  }

  async getAllBusinesses(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc'): Promise<{ businesses: Business[], total: number }> {
    // COST-OPTIMIZED: Reasonable limits for Railway free tier
    const limitNumber = Math.min(limit, 75); // Reduced from 100 for cost efficiency
    const offset = (page - 1) * limitNumber;
    
    // COST-OPTIMIZED: Use indexed columns only
    let orderByColumn;
    switch (sortBy) {
      case 'name':
        orderByColumn = businesses.name; // Uses idx_businesses_name
        break;
      case 'taxId':
        orderByColumn = businesses.taxId; // Uses idx_businesses_tax_id
        break;
      case 'createdAt':
      default:
        orderByColumn = businesses.createdAt; // Uses idx_businesses_created_at
        break;
    }
    
    // COST-OPTIMIZED: Cached count + parallel execution
    const [businessList, totalResult] = await Promise.all([
      db
        .select()
        .from(businesses)
        .orderBy(sortOrder === 'desc' ? sql`${orderByColumn} DESC` : orderByColumn)
        .limit(limitNumber)
        .offset(offset),
      this.getCachedBusinessCount() // Use cached count to save compute
    ]);

    return {
      businesses: businessList,
      total: totalResult
    };
  }

  // Cost-efficient cached count to avoid expensive COUNT queries
  private businessCountCache: { count: number; timestamp: number } | null = null;
  
  async getCachedBusinessCount(): Promise<number> {
    const CACHE_TTL = 45000; // 45 seconds cache for cost efficiency
    const now = Date.now();
    
    if (this.businessCountCache && (now - this.businessCountCache.timestamp) < CACHE_TTL) {
      return this.businessCountCache.count;
    }
    
    const result = await db.select({ count: sql<number>`count(*)` }).from(businesses);
    const count = result[0]?.count || 0;
    
    this.businessCountCache = { count, timestamp: now };
    return count;
  }

  async getAllBusinessesForAutocomplete(): Promise<Business[]> {
    // COST-OPTIMIZED: Minimal fields + reasonable limit
    const businessList = await db
      .select({ 
        id: businesses.id, 
        name: businesses.name, 
        taxId: businesses.taxId 
      })
      .from(businesses)
      .orderBy(businesses.name) // Uses idx_businesses_name index
      .limit(80); // Reduced for cost efficiency while maintaining functionality
    
    return businessList as Business[];
  }

  async updateBusiness(business: UpdateBusiness): Promise<Business | undefined> {
    const { id, ...updateData } = business;
    const [updatedBusiness] = await db
      .update(businesses)
      .set(updateData)
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness || undefined;
  }

  async deleteBusiness(id: number): Promise<boolean> {
    const result = await db
      .delete(businesses)
      .where(eq(businesses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchBusinesses(search: SearchBusiness): Promise<Business[]> {
    const { field, value } = search;
    
    // OPTIMIZATION: Use indexes and limit search results
    switch (field) {
      case "name":
        return await db
          .select()
          .from(businesses)
          .where(eq(businesses.name, value)) // Uses idx_businesses_name
          .limit(50); // Cost-optimized limit
      case "namePartial":
        return await db
          .select()
          .from(businesses)
          .where(like(businesses.name, `%${value}%`)) // Uses idx_businesses_name
          .limit(50);
      case "taxId":
        return await db
          .select()
          .from(businesses)
          .where(eq(businesses.taxId, value)) // Uses idx_businesses_tax_id
          .limit(50);
      case "address":
        return await db
          .select()
          .from(businesses)
          .where(eq(businesses.address, value))
          .limit(30); // Reduced for cost efficiency
      case "addressPartial":
        return await db
          .select()
          .from(businesses)
          .where(like(businesses.address, `%${value}%`))
          .limit(30);
      case "phone":
        return await db
          .select()
          .from(businesses)
          .where(eq(businesses.phone, value))
          .limit(30); // Essential searches only with reduced limits
      default:
        return [];
    }
  }

  // Document transaction operations
  async createDocumentTransaction(transaction: InsertDocumentTransaction): Promise<DocumentTransaction> {
    try {
      console.log("Creating document transaction:", transaction);
      const [createdTransaction] = await db
        .insert(documentTransactions)
        .values([transaction])
        .returning();
      console.log("Document transaction created:", createdTransaction);
      return createdTransaction;
    } catch (error) {
      console.error("Error creating document transaction:", error);
      throw error;
    }
  }

  async getDocumentTransactionsByBusinessId(businessId: number): Promise<DocumentTransaction[]> {
    // COST-OPTIMIZED: Balanced limit for business documents
    return await db
      .select()
      .from(documentTransactions)
      .where(eq(documentTransactions.businessId, businessId))
      .orderBy(sql`${documentTransactions.createdAt} DESC`)
      .limit(150); // Reduced from 200 for cost efficiency
  }

  async getAllDocumentTransactions(): Promise<DocumentTransaction[]> {
    // COST-OPTIMIZED: Reasonable limit for Railway free tier
    return await db
      .select()
      .from(documentTransactions)
      .orderBy(sql`${documentTransactions.createdAt} DESC`) // Uses idx_document_transactions_created_at
      .limit(1500); // Reduced from 2000 for cost efficiency
  }

  async getDocumentTransactionsByCompany(companyName: string): Promise<DocumentTransaction[]> {
    return await db
      .select()
      .from(documentTransactions)
      .where(
        sql`${documentTransactions.deliveryCompany} = ${companyName} OR ${documentTransactions.receivingCompany} = ${companyName}`
      )
      .orderBy(documentTransactions.createdAt);
  }

  async updateDocumentNumber(id: number, documentNumber: string): Promise<boolean> {
    try {
      const result = await db
        .update(documentTransactions)
        .set({ documentNumber })
        .where(eq(documentTransactions.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error updating document number:", error);
      return false;
    }
  }

  async updateSignedFilePath(id: number, signedFilePath: string): Promise<boolean> {
    try {
      const result = await db
        .update(documentTransactions)
        .set({ signedFilePath })
        .where(eq(documentTransactions.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error updating signed file path:", error);
      return false;
    }
  }



  async deleteDocumentTransaction(id: number): Promise<boolean> {
    const result = await db
      .delete(documentTransactions)
      .where(eq(documentTransactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateDocumentTransactionSignedFile(id: number, signedFilePath: string): Promise<boolean> {
    try {
      const result = await db
        .update(documentTransactions)
        .set({ signedFilePath })
        .where(eq(documentTransactions.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error updating document transaction signed file:", error);
      return false;
    }
  }

  async updateDocumentTransactionPdf(id: number, pdfFilePath: string | null, pdfFileName: string | null): Promise<boolean> {
    try {
      console.log("Updating PDF for transaction:", { id, pdfFilePath, pdfFileName });
      const result = await db
        .update(documentTransactions)
        .set({ pdfFilePath, pdfFileName })
        .where(eq(documentTransactions.id, id))
        .returning();
      console.log("Update result:", result);
      return result.length > 0;
    } catch (error) {
      console.error("Error updating document transaction PDF:", error);
      return false;
    }
  }

  async getDocumentTransaction(id: number): Promise<DocumentTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(documentTransactions)
      .where(eq(documentTransactions.id, id));
    return transaction || undefined;
  }



  async getDocumentTransactionsByTaxId(taxId: string): Promise<DocumentTransaction[]> {
    // Lấy business có mã số thuế này
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.taxId, taxId));
    
    if (!business) {
      return [];
    }

    // Lấy tất cả giao dịch có liên quan đến công ty này (deliveryCompany hoặc receivingCompany)
    return await db
      .select()
      .from(documentTransactions)
      .where(
        sql`${documentTransactions.deliveryCompany} = ${business.name} OR ${documentTransactions.receivingCompany} = ${business.name}`
      )
      .orderBy(documentTransactions.createdAt);
  }

  // Admin operations
  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const [createdUser] = await db
      .insert(adminUsers)
      .values(user)
      .returning();
    return createdUser;
  }

  async authenticateAdmin(login: LoginRequest): Promise<AdminUser | null> {
    // Hardcoded admin authentication - no database needed
    if (login.username === "quanadmin" && login.password === "01020811") {
      return {
        id: 1,
        username: "quanadmin",
        password: "01020811",
        role: "admin",
        createdAt: new Date()
      };
    }
    return null;
  }

  async changeAdminPassword(username: string, request: ChangePasswordRequest): Promise<boolean> {
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    
    if (!user || user.password !== request.currentPassword) {
      return false;
    }

    const result = await db
      .update(adminUsers)
      .set({ password: request.newPassword })
      .where(eq(adminUsers.username, username));
    
    return (result.rowCount ?? 0) > 0;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return user || undefined;
  }

  async initializeDatabase(): Promise<void> {
    // Drizzle Kit sẽ quản lý migrations, không tạo bảng thủ công
    try {
      const client = await pool.connect();
      // Không cần tạo bảng thủ công ở đây nữa, Drizzle Kit sẽ lo
      client.release();
      console.log("Database connection verified, migrations will be handled by Drizzle Kit.");
    } catch (error) {
      console.error("Error during database initialization (manual table creation removed):", error);
      throw error; // Quan trọng: ném lỗi để biết nếu database không kết nối được
    }

    // No admin user creation needed - authentication is hardcoded
    console.log("Admin authentication: hardcoded (quanadmin/01020811)");
    console.log("Database initialization completed");
  }

  // Business Account implementation
  async getBusinessAccountByBusinessId(businessId: number): Promise<BusinessAccount | null> {
    return this.getBusinessAccount(businessId);
  }

  async getBusinessAccount(businessId: number): Promise<BusinessAccount | null> {
    const [account] = await db
      .select()
      .from(businessAccounts)
      .where(eq(businessAccounts.businessId, businessId));
    return account || null;
  }

  async createBusinessAccount(account: InsertBusinessAccount): Promise<BusinessAccount> {
    const [createdAccount] = await db
      .insert(businessAccounts)
      .values(account)
      .returning();
    return createdAccount;
  }

  async updateBusinessAccount(businessId: number, account: Partial<InsertBusinessAccount>): Promise<BusinessAccount> {
    const [updatedAccount] = await db
      .update(businessAccounts)
      .set(account)
      .where(eq(businessAccounts.businessId, businessId))
      .returning();
    
    if (!updatedAccount) {
      // If no record exists, create one
      return this.createBusinessAccount({ ...account, businessId } as InsertBusinessAccount);
    }
    
    return updatedAccount;
  }

  async updateDocumentPdf(id: number, pdfPath: string): Promise<boolean> {
    try {
      const result = await db
        .update(documentTransactions)
        .set({ signedFilePath: pdfPath })
        .where(eq(documentTransactions.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error updating document PDF:", error);
      return false;
    }
  }

  // New authentication methods
  async authenticateUser(login: UserLoginRequest): Promise<{ userType: string; userData: any } | null> {
    const { userType, identifier, password } = login;

    switch (userType) {
      case "admin":
        const admin = await this.authenticateAdmin({ username: identifier, password });
        if (admin) {
          return { userType: "admin", userData: admin };
        }
        break;

      case "employee":
        // Employee authentication với mật khẩu cố định
        if (password === "royalvietnam") {
          return { 
            userType: "employee", 
            userData: { 
              id: 0, 
              username: identifier, 
              role: "employee" 
            } 
          };
        }
        break;
    }

    return null;
  }

  async getBusinessByTaxId(taxId: string): Promise<Business | undefined> {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.taxId, taxId));
    return business || undefined;
  }

  async updateBusinessAccessCode(id: number, accessCode: string): Promise<boolean> {
    try {
      const result = await db
        .update(businesses)
        .set({ accessCode })
        .where(eq(businesses.id, id));
      return true;
    } catch (error) {
      console.error("Error updating business access code:", error);
      return false;
    }
  }

  // Additional methods for complete sync - removed duplicates

}

export const storage = new DatabaseStorage();
