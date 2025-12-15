import { Schema, model, Types } from "mongoose";

const BuzzCommentSchema = new Schema(
  {
    post: { type: Types.ObjectId, ref: "BuzzPost", required: true },
    author: { type: Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

BuzzCommentSchema.index({ post: 1, createdAt: -1 });

export const BuzzComment = model("BuzzComment", BuzzCommentSchema);
