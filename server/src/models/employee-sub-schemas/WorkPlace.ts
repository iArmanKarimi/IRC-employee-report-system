import { Schema } from 'mongoose';

export interface IWorkPlace {
	provinceName: string;
	branch: string;
	rank: string;
	licensedWorkplace: string;
	travelAssignment: boolean;
}

export const WorkPlaceSchema = new Schema<IWorkPlace>({
	provinceName: { type: String, required: true, trim: true },
	branch: { type: String, required: true, trim: true },
	rank: { type: String, required: true, trim: true },
	licensedWorkplace: { type: String, required: true, trim: true },
	travelAssignment: { type: Boolean, default: false }
});
