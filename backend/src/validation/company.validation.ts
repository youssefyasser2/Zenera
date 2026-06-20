// src/validation/company.validation.ts
import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  typeOfBusiness: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();