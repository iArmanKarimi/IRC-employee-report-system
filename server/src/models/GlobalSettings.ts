import { Schema, model, models, Document } from "mongoose";

export interface IGlobalSettings extends Document {
	performanceLocked: boolean;
	lastLockedBy?: Schema.Types.ObjectId;
	lockedAt?: Date;
}

const GlobalSettingsSchema = new Schema<IGlobalSettings>({
	performanceLocked: { type: Boolean, default: false },
	lastLockedBy: { type: Schema.Types.ObjectId, ref: "User" },
	lockedAt: { type: Date },
});

// Note: Only one GlobalSettings document should exist (enforced at application level)

export const GlobalSettings =
	models.GlobalSettings ||
	model<IGlobalSettings>("GlobalSettings", GlobalSettingsSchema);
