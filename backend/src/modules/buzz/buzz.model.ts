// backend/src/modules/buzz/buzz.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IBuzzComment {
  author: mongoose.Types.ObjectId; // Employee
  text: string;
  createdAt: Date;
}

export interface IBuzzPost extends Document {
  author: mongoose.Types.ObjectId; // Employee
  content: string;
  likes: mongoose.Types.ObjectId[]; // Employees who liked
  comments: IBuzzComment[];
  visibility: "PUBLIC" | "ORGANIZATION";
}

const BuzzCommentSchema = new Schema<IBuzzComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BuzzPostSchema = new Schema<IBuzzPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
    comments: { type: [BuzzCommentSchema], default: [] },
    visibility: {
      type: String,
      enum: ["PUBLIC", "ORGANIZATION"],
      default: "ORGANIZATION",
    },
  },
  { timestamps: true }
);

export const BuzzPost = mongoose.model<IBuzzPost>("BuzzPost", BuzzPostSchema);
