import { Schema } from 'mongoose';

export interface IBasicInfo {
  firstName: string;
  lastName: string;
  nationalID: string;
  male: boolean;
  married: boolean;
  childrenCount: number;
}

export const BasicInfoSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  nationalID: { type: String, unique: true, required: true, trim: true },
  male: { type: Boolean, required: true },
  married: { type: Boolean, default: false },
  childrenCount: { type: Number, default: 0, min: 0 }
});
