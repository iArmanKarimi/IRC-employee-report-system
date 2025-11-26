import { Schema, model, models, Document } from "mongoose";
import { Province } from "./Province";

type UserRole = "globalAdmin" | "provinceAdmin";
const UserRoleValues: UserRole[] = ["globalAdmin", "provinceAdmin"];

export interface IUser extends Document {
	username: string;
	passwordHash: string;
	role: UserRole;
	provinceId?: Schema.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
	username: {
		type: String,
		unique: true,
		required: true,
	},
	passwordHash: { type: String, required: true },
	role: {
		type: String,
		enum: UserRoleValues,
		required: true,
	},
	provinceId: { type: Schema.Types.ObjectId, ref: "Province" },
});

// Indexes for better query performance
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ provinceId: 1 });

export const User = models.User || model<IUser>("User", UserSchema);
