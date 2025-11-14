// backend/src/modules/buzz/buzz.controller.ts
import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";
import { BuzzPost } from "./buzz.model";

// POST /api/buzz/posts
export async function createBuzzPost(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const { content, visibility } = req.body;

  if (!content) {
    throw ApiError.badRequest("content is required");
  }

  const post = await BuzzPost.create({
    author: req.user.id,
    content,
    visibility: visibility || "ORGANIZATION",
  });

  res.status(201).json(post);
}

// GET /api/buzz/posts
export async function listBuzzPosts(_req: AuthRequest, res: Response) {
  const posts = await BuzzPost.find()
    .populate("author")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(posts);
}

// POST /api/buzz/posts/:id/like
export async function likeBuzzPost(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const { id } = req.params;

  const post = await BuzzPost.findById(id).exec();
  if (!post) {
    throw ApiError.notFound("Post not found");
  }

  const userId = req.user.id;
  if (!post.likes.find((x) => String(x) === String(userId))) {
    post.likes.push(userId as any);
  }

  await post.save();
  res.json(post);
}

// POST /api/buzz/posts/:id/comment
export async function commentOnBuzzPost(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    throw ApiError.badRequest("text is required");
  }

  const post = await BuzzPost.findById(id).exec();
  if (!post) {
    throw ApiError.notFound("Post not found");
  }

  post.comments.push({
    author: req.user.id as any,
    text,
    createdAt: new Date(),
  });

  await post.save();
  res.json(post);
}
