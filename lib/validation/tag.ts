import * as z from "zod";

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name cannot be longer than 50 characters"),

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
});

export type TagFormValues = z.infer<typeof tagSchema>;
