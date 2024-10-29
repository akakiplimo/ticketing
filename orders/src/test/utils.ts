import mongoose from "mongoose";

export const generateMongooseMockID = () => new mongoose.Types.ObjectId().toHexString();