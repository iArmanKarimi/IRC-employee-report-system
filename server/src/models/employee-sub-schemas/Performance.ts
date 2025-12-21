import { Schema } from 'mongoose';

export interface IPerformance {
	dailyPerformance: number;
	shiftCountPerLocation: number;
	shiftDuration: number;
	overtime: number;
	dailyLeave: number;
	sickLeave: number;
	absence: number;
	truckDriver: boolean;
	travelAssignment: number;
	month: string;
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
	truckDriver: { type: Boolean, default: false },
	travelAssignment: { type: Number, default: 0, min: 0, max: 31 },
	month: { type: String, required: true /* match: /^\d{4}-(0[1-9]|1[0-2])$/ */ },
	notes: { type: String, trim: true }
});
