import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IInvite extends Document {
  email: string;
  companyId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  used: boolean;
}

const inviteSchema = new Schema<IInvite>({
  email: { type: String, required: true, lowercase: true },
  companyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  token: { 
    type: String, 
    default: () => uuidv4(),
    unique: true 
  },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
  },
  used: { type: Boolean, default: false }
});

export const InviteModel = model<IInvite>('Invite', inviteSchema);