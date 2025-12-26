import { Schema } from 'mongoose';

export interface IPerformance {
	dailyPerformance: number;
	shiftCountPerLocation: number;
	shiftDuration: number;
	overtime: number;
	dailyLeave: number;
	sickLeave: number;
	absence: number;
	travelAssignment: number;
	status: string;
	notes?: string;
}

export const PerformanceSchema = new Schema<IPerformance>({
	dailyPerformance: { type: Number, required: true, min: 0 },
	shiftCountPerLocation: { type: Number, required: true, min: 0 },
	shiftDuration: { type: Number, required: true, enum: [8, 16, 24] },
	overtime: { type: Number, default: 0, min: 0 },
	dailyLeave: { type: Number, default: 0, min: 0 },
	sickLeave: { type: Number, default: 0, min: 0 },
	absence: { type: Number, default: 0, min: 0 },
	travelAssignment: { type: Number, default: 0, min: 0, max: 31 },
	status: { type: String, default: 'active', enum: ['active', 'inactive', 'on_leave'] },
	notes: { type: String, trim: true }
});
