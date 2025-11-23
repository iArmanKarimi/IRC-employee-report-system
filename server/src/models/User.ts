import { Schema, model, models } from "mongoose";
import { Province } from "./Province";

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["globalAdmin", "provinceAdmin"],
    required: true,
  },
  provinceAdmin: { type: Schema.Types.ObjectId, ref: "Province" },
});

export const User = models.User || model("User", UserSchema);
