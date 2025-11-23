import { Schema, model, models } from "mongoose";
import { User } from "./User";

const ProvinceSchema = new Schema({
  name: { type: String, unique: true, required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  employees: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
});

export const Province = models.Province || model("Province", ProvinceSchema);
