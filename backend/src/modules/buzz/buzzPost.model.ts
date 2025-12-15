import { Schema, model, Types } from "mongoose";

export type BuzzMediaType = "IMAGE" | "VIDEO";

const BuzzMediaSchema = new Schema(
  {
    type: { type: String, enum: ["IMAGE", "VIDEO"], required: true },
    url: { type: String, required: true }, // /uploads/....
    name: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const BuzzPostSchema = new Schema(
  {
    author: { type: Types.ObjectId, ref: "User", required: true },

    // message text (optional when sharing media)
    content: { type: String, default: "" },

    media: { type: [BuzzMediaSchema], default: [] },

    // Reshare
    reshareOf: { type: Types.ObjectId, ref: "BuzzPost", default: null },

    likes: [{ type: Types.ObjectId, ref: "User" }],

    commentsCount: { type: Number, default: 0 },
    resharesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BuzzPostSchema.index({ createdAt: -1 });
BuzzPostSchema.index({ likes: 1 });

export const BuzzPost = model("BuzzPost", BuzzPostSchema);
