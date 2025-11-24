import { Schema, model, models } from 'mongoose';
import { IBasicInfo, BasicInfoSchema } from './employee-sub-schemas/BasicInfoSchema';
import { IWorkPlace, WorkPlaceSchema } from './employee-sub-schemas/WorkPlaceSchema';
import { IAdditionalSpecifications, AdditionalSpecificationsSchema } from './employee-sub-schemas/AdditionalSpecificationsSchema';
import { IPerformance, PerformanceSchema } from './employee-sub-schemas/PerformanceSchema';

export interface IEmployee extends Document {
	provinceId: Schema.Types.ObjectId;
	basicInfo: IBasicInfo;
	workPlace: IWorkPlace;
	additionalSpecifications: IAdditionalSpecifications;
	performances: IPerformance[];
	createdAt: Date;
	updatedAt: Date;
}

const EmployeeSchema = new Schema({
	provinceId: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
	basicInfo: { type: BasicInfoSchema, required: true },
	workPlace: { type: WorkPlaceSchema, required: true },
	additionalSpecifications: { type: AdditionalSpecificationsSchema, required: true },
	performances: [PerformanceSchema]
}, { timestamps: true });

export const Employee = models.Employee || model<IEmployee>('Employee', EmployeeSchema);
