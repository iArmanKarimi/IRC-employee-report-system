import { Schema, model, models, Document } from "mongoose";
import { User } from "./User";

export interface IProvince extends Document {
	name: string;
	admin: Schema.Types.ObjectId;
	employees: Schema.Types.ObjectId[];
}

const ProvinceSchema = new Schema<IProvince>({
	name: { type: String, unique: true, required: true },
	admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
	employees: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
});

// Indexes for better query performance
// Note: name index is handled by unique: true
ProvinceSchema.index({ admin: 1 });

export const Province = models.Province || model<IProvince>("Province", ProvinceSchema);
