import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1),
  phoneE164: z.string().optional(),
  chromeProfileDir: z.string().min(1)
});

export const contactSchema = z.object({
  name: z.string().min(1),
  phoneE164: z.string().min(3),
  notes: z.string().optional(),
  status: z.string()
});
