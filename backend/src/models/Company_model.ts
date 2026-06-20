// src/models/company_model.ts
import mongoose, {
  Schema,
  Model,
  HydratedDocument,
  Types,
} from 'mongoose';

/* -------------------------------------------------
 *  Plain interface – what the app works with
 * ------------------------------------------------- */
export interface ICompany {
  _id: Types.ObjectId;
  name: string;
  address: string;
  typeOfBusiness: string;
  numberOfEmployees?: number;
  email: string;          // required only for manually created companies
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* -------------------------------------------------
 *  Hydrated document – what Mongoose returns
 * ------------------------------------------------- */
export type CompanyDocument = HydratedDocument<ICompany>;

/* -------------------------------------------------
 *  Schema
 * ------------------------------------------------- */
const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,               
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    typeOfBusiness: {
      type: String,
      required: [true, 'Type of business is required'],
      trim: true,
    },
    numberOfEmployees: { type: Number, default: 0 },

    // Email is **required** only for manually created companies.
    // Auto‑created companies get a generated e‑mail that is guaranteed unique.
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },

    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

/* -------------------------------------------------
 *  Middleware
 * ------------------------------------------------- */
companySchema.pre('save', function (next) {
  console.log(`Creating/Updating company: ${this.name}`);
  next();
});

/* -------------------------------------------------
 *  Virtual – populate users that belong to this company
 * ------------------------------------------------- */
companySchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'companyId',
});

/* -------------------------------------------------
 *  Model export
 * ------------------------------------------------- */
export const CompanyModel: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);