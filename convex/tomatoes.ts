import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all tomatoes
export const getAllTomatoes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tomatoes").collect();
  },
});

// Query to get a single tomato by ID
export const getTomatoById = query({
  args: { id: v.id("tomatoes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query to search tomatoes by name
export const getTomatoesByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tomatoes")
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();
  },
});

// Query to get tomatoes by variety
export const getTomatoesByVariety = query({
  args: { variety: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tomatoes")
      .withIndex("by_variety", (q) => q.eq("variety", args.variety))
      .collect();
  },
});

// Mutation to create a new tomato
export const createTomato = mutation({
  args: {
    name: v.string(),
    variety: v.string(),
    price: v.number(),
    description: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const tomatoId = await ctx.db.insert("tomatoes", {
      name: args.name,
      variety: args.variety,
      price: args.price,
      description: args.description,
      inStock: args.inStock ?? true,
      createdAt: now,
      updatedAt: now,
    });
    return tomatoId;
  },
});

// Mutation to update a tomato
export const updateTomato = mutation({
  args: {
    id: v.id("tomatoes"),
    name: v.optional(v.string()),
    variety: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateFields } = args;
    const updates: any = { ...updateFields };
    
    // Only include fields that are provided
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });
    
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await ctx.db.patch(id, updates);
    }
    
    return await ctx.db.get(id);
  },
});

// Mutation to delete a tomato
export const deleteTomato = mutation({
  args: { id: v.id("tomatoes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true, id: args.id };
  },
});

