export interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  companyId?: string | null;    
  companyName?: string | null;    
  linkedEmployees?: string[];
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  languages?: string[];
  bio?: string;
  jobTitle?: string;
  isProfileVerified: boolean;
  profileVerificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
