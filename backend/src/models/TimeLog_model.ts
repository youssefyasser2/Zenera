import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * ===============================
 *  TimeLog Interface
 * ===============================
 */
export interface ITimeLog extends Document {
  companyId: Types.ObjectId;
  userId: Types.ObjectId;
  shiftId: Types.ObjectId;
  
  // Clock in/out times
  clockIn: Date;
  clockOut?: Date;
  
  // Auto-calculated fields
  totalHours?: number;
  isClockedIn: boolean;
  
  // Location tracking (optional)
  clockInLocation?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  clockOutLocation?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  
  // Status & verification
  status: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'MISSED_CLOCK_OUT';
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ===============================
 *  TimeLog Schema
 * ===============================
 */
const timeLogSchema = new Schema<ITimeLog>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: 'Shift',
      required: [true, 'Shift ID is required'],
      index: true
    },
    
    // Clock times
    clockIn: {
      type: Date,
      required: [true, 'Clock-in time is required'],
      default: Date.now
    },
    clockOut: {
      type: Date
    },
    
    // Calculated fields
    totalHours: {
      type: Number,
      default: 0
    },
    isClockedIn: {
      type: Boolean,
      default: true
    },
    
    // Location data
    clockInLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: String
    },
    clockOutLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: String
    },
    
    // Status
    status: {
      type: String,
      enum: ['CLOCKED_IN', 'CLOCKED_OUT', 'MISSED_CLOCK_OUT'],
      default: 'CLOCKED_IN'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { 
    timestamps: true 
  }
);

/**
 * ===============================
 *  Indexes
 * ===============================
 */
timeLogSchema.index({ userId: 1, clockIn: 1 });
timeLogSchema.index({ shiftId: 1 });
timeLogSchema.index({ companyId: 1, createdAt: 1 });
timeLogSchema.index({ isClockedIn: 1 });

/**
 * ===============================
 *  Middleware (Hooks)
 * ===============================
 */
timeLogSchema.pre<ITimeLog>('save', function(next) {
  // Calculate total hours when clocking out
  if (this.clockOut && this.isModified('clockOut')) {
    const duration = this.clockOut.getTime() - this.clockIn.getTime();
    this.totalHours = parseFloat((duration / (1000 * 60 * 60)).toFixed(2));
    this.isClockedIn = false;
    this.status = 'CLOCKED_OUT';
  }
  
  // Auto-detect missed clock-out (if still clocked in after 24 hours)
  if (this.isClockedIn) {
    const hoursSinceClockIn = (Date.now() - this.clockIn.getTime()) / (1000 * 60 * 60);
    if (hoursSinceClockIn > 24) {
      this.status = 'MISSED_CLOCK_OUT';
    }
  }
  
  next();
});

/**
 * ===============================
 *  Static Methods
 * ===============================
 */
timeLogSchema.statics = {
  async findActiveClockIn(userId: Types.ObjectId) {
    return this.findOne({ userId, isClockedIn: true });
  },
  
  async getUserTimeLogs(userId: Types.ObjectId, startDate?: Date, endDate?: Date) {
    const query: any = { userId };
    
    if (startDate || endDate) {
      query.clockIn = {};
      if (startDate) query.clockIn.$gte = startDate;
      if (endDate) query.clockIn.$lte = endDate;
    }
    
    return this.find(query).populate('shiftId').sort({ clockIn: -1 });
  }
};

/**
 * ===============================
 *  Model Export
 * ===============================
 */
export const TimeLog: Model<ITimeLog> = mongoose.model<ITimeLog>('TimeLog', timeLogSchema);