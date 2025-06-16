import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tomatoes: defineTable({
    name: v.string(),
    variety: v.string(),
    price: v.number(),
    description: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_variety", ["variety"])
    .index("by_price", ["price"]),
});

