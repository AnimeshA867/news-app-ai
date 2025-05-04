import { z } from "zod";

export const articleSchema = z.object({
  // ... other fields
  isBreakingNews: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  // ... other fields
});
