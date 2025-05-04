import * as z from "zod";

export const authorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]),
  image: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export type AuthorFormValues = z.infer<typeof authorSchema>;

// For existing authors, password is optional
export const editAuthorSchema = authorSchema.extend({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});
