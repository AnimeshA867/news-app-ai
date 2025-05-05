import { z } from "zod";

export const articleSchema = z.object({
  // ... other fields
  isBreakingNews: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  // ... other fields

  // SEO fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  noIndex: z.boolean().default(false),
  structuredData: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      { message: "Invalid JSON format" }
    ),
});

export const schema = articleSchema.extend({
  categoryId: z.string().nonempty("Category is required"),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  isBreakingNews: z.boolean(),
  isFeatured: z.boolean(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  // SEO fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  noIndex: z.boolean().default(false),
});
