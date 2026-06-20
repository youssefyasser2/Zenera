// src/models/shift_model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * ===============================
 * Shift Interface
 * ===============================
 */
export interface IShift extends Document {
  companyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  title: string;
  date: Date; // Shift date (without time)
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  start: Date; // Computed start datetime
  end: Date; // Computed end datetime
  status: "SCHEDULED" | "COMPLETED" | "MISSED";
  totalHours?: number;
  assignedBy?: mongoose.Types.ObjectId;
  description?: string;
  notes?: string;
  assignedTo: {
    userId?: mongoose.Types.ObjectId;
    name?: string;
  };
  createdAt: Date;
  updatedAt: Date;

  // Methods
  calculateDuration(): number;
}

/**
 * ===============================
 * Shift Schema
 * ===============================
 */
const shiftSchema = new Schema<IShift>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // userId is optional – can be null when assigned by name only
    },
    title: { type: String, required: true, trim: true },
    date: {
      type: Date,
      required: [true, "Shift date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
    },
    // start & end are computed in pre-save → NOT required in schema
    start: { type: Date },
    end: { type: Date },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "MISSED"],
      default: "SCHEDULED",
    },
    totalHours: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTo: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

/**
 * ===============================
 * Pre-save Middleware: 
 * - Calculate `start`, `end`, and `totalHours`
 * - Validate `assignedTo`: either userId OR name must be present
 * ===============================
 */
shiftSchema.pre<IShift>("save", function (next) {
  try {
    // 1. Compute start and end Date objects
    const baseDate = new Date(this.date);
    baseDate.setHours(0, 0, 0, 0); // Normalize to midnight

    const [startH, startM] = this.startTime.split(":").map(Number);
    const [endH, endM] = this.endTime.split(":").map(Number);

    this.start = new Date(baseDate);
    this.start.setHours(startH, startM, 0, 0);

    this.end = new Date(baseDate);
    this.end.setHours(endH, endM, 0, 0);

    // Handle overnight shifts
    if (this.end <= this.start) {
      this.end.setDate(this.end.getDate() + 1);
    }

    // Calculate total hours
    const diffMs = this.end.getTime() - this.start.getTime();
    this.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    // 2. Validate assignedTo
    if (!this.assignedTo) {
      return next(new Error("assignedTo is required: either userId or name must be provided."));
    }

    const hasUserId = !!this.assignedTo.userId;
    const hasName = !!this.assignedTo.name && this.assignedTo.name.trim() !== "";

    if (!hasUserId && !hasName) {
      return next(
        new Error("assignedTo validation failed: either userId or name must be provided.")
      );
    }

    // Trim name if present
    if (this.assignedTo.name) {
      this.assignedTo.name = this.assignedTo.name.trim();
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * ===============================
 * Instance Method: Recalculate duration
 * ===============================
 */
shiftSchema.methods.calculateDuration = function (): number {
  const diffMs = this.end.getTime() - this.start.getTime();
  return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
};

/**
 * ===============================
 * Indexes for Performance
 * ===============================
 */
shiftSchema.index({ companyId: 1 });
shiftSchema.index({ userId: 1 });
shiftSchema.index({ date: 1 });
shiftSchema.index({ start: 1 });
shiftSchema.index({ status: 1 });
shiftSchema.index({ "assignedTo.userId": 1 });

/**
 * ===============================
 * Model Export
 * ===============================
 */
export const Shift: Model<IShift> = mongoose.model<IShift>("Shift", shiftSchema);