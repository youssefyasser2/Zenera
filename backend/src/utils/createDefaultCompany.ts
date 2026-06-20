// utils/createDefaultCompany.ts
import { CompanyModel, CompanyDocument } from '../models/Company_model';

/**
 * Returns the **string** id of the default company.
 */
export const createDefaultCompany = async (): Promise<string> => {
  // 1. Find existing – typed as CompanyDocument | null
  const existing: CompanyDocument | null = await CompanyModel.findOne({
    name: 'Default Company',
  });

  if (existing) {
    console.log('Default company already exists:', existing._id.toString());
    return existing._id.toString();
  }

  // 2. Create new
  const newDoc = new CompanyModel({
    name: 'Default Company',
    address: 'Default Address',
    typeOfBusiness: 'General',
    email: 'admin@default.com',
    phone: '+1234567890',
  }) as CompanyDocument;              

  const saved: CompanyDocument = await newDoc.save();

  console.log('Default company created:', saved._id.toString());
  return saved._id.toString();
};