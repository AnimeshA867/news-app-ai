import * as z from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name cannot be longer than 50 characters"),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug cannot be longer than 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    }),

  description: z
    .string()
    .max(500, "Description cannot be longer than 500 characters")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),

  imageUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),

  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Please enter a valid hex color code (e.g., #FF0000)",
    })
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
