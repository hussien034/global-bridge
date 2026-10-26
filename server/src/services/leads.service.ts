import { db } from "../db";
import { partnershipLeads, type PartnershipLead, type InsertPartnershipLead } from "@shared/schema";
import { and, eq, desc } from "drizzle-orm";

export interface LeadFilters {
  requestType?: PartnershipLead["requestType"];
  status?: PartnershipLead["status"];
  limit?: number;
  offset?: number;
}

export const leadsService = {
  // 1. Create partnership lead
  async createLead(input: InsertPartnershipLead) {
    const [lead] = await db
      .insert(partnershipLeads)
      .values({
        ...input,
        status: "new",
      })
      .returning();

    return lead;
  },

  // 2. List partnership leads for admin
  async listLeads(filters: LeadFilters = {}) {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const conditions = [];
    if (filters.requestType) conditions.push(eq(partnershipLeads.requestType, filters.requestType));
    if (filters.status) conditions.push(eq(partnershipLeads.status, filters.status));

    return await db
      .select()
      .from(partnershipLeads)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(partnershipLeads.createdAt))
      .limit(limit)
      .offset(offset);
  },

  // 3. Update lead status
  async updateStatus(id: number, status: PartnershipLead["status"]) {
    const [updated] = await db
      .update(partnershipLeads)
      .set({ status })
      .where(eq(partnershipLeads.id, id))
      .returning();

    return updated || null;
  },
};
