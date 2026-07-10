import { z } from "zod";

export const createUrlSchema = z.object({
    url: z
        .string()
        .url("Invalid URL"),

    customAlias: z
        .string()
        .min(3)
        .max(30)
        .optional(),

    expiresAt: z
        .string()
        .datetime()
        .optional(),
});