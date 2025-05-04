import * as z from "zod";

export const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(150, "Slug cannot exceed 150 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    })
    .optional(),

  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(300, "Excerpt cannot exceed 300 characters"),

  content: z.string().min(1, "Content is required"),

  featuredImage: z
    .string()
    .url("Featured image must be a valid URL")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),

  status: z
    .enum(["DRAFT", "PUBLISHED", "SCHEDULED"], {
      required_error: "Status is required",
    })
    .default("DRAFT"),

  publishedAt: z.date().optional().nullable().or(z.string().nullable()),

  isFeatured: z.boolean().default(false),
  isBreakingNews: z.boolean().default(false),

  // The parent schema does not include these as they're extended in the component
  // categoryId: z.string().nonempty("Category is required"),
  // tagIds: z.array(z.string()).optional(),

  authorId: z.string().optional(),

  metaTitle: z
    .string()
    .max(100, "Meta title cannot exceed 100 characters")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),

  metaDescription: z
    .string()
    .max(160, "Meta description cannot exceed 160 characters")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;

// Schema for article list/search queries
export const articleQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1", 10)),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "10", 10)),
  query: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  featured: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  breaking: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export type ArticleQueryParams = z.infer<typeof articleQuerySchema>;
