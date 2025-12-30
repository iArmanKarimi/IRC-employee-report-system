import { Schema, model, models, Document } from "mongoose";
import { USER_ROLE, UserRoleType } from "../types/roles";

export interface IUser extends Document {
	username: string;
	passwordHash: string;
	role: UserRoleType;
	provinceId?: Schema.Types.ObjectId;
}

const UserRoleValues: UserRoleType[] = [USER_ROLE.GLOBAL_ADMIN, USER_ROLE.PROVINCE_ADMIN];

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
// Note: username index is handled by unique: true
UserSchema.index({ role: 1 });
UserSchema.index({ provinceId: 1 });

export const User = models.User || model<IUser>("User", UserSchema);
