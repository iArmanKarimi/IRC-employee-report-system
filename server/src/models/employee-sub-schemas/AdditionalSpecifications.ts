import { Schema } from 'mongoose';

export interface IAdditionalSpecifications {
	educationalDegree: string;
	dateOfBirth: Date;
	contactNumber: string;
	jobStartDate: Date;
	jobEndDate?: Date;
	truckDriver: boolean;
}

export const AdditionalSpecificationsSchema = new Schema<IAdditionalSpecifications>({
	educationalDegree: { type: String, required: true, trim: true },
	dateOfBirth: { type: Date, required: true },
	contactNumber: {
		type: String,
		required: true,
		trim: true,
		validate: {
			validator: function (v: string) {
				// Remove spaces and ensure exactly 11 digits
				return /^\d{11}$/.test(v.trim());
			},
			message: (props: any) => `Path 'contactNumber' is invalid (${props.value}). Must be exactly 11 digits.`
		}
	},
	jobStartDate: { type: Date, required: true },
	jobEndDate: { type: Date },
	truckDriver: { type: Boolean, default: false }
});
