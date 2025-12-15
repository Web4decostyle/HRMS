import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { BuzzPost } from "./buzzPost.model";
import { BuzzComment } from "./buzzComment.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { Response } from "express";

function toMediaType(mimetype: string) {
  return mimetype.startsWith("video/") ? "VIDEO" : "IMAGE";
}

// GET /api/buzz?filter=recent|liked|commented
export async function listBuzz(req: AuthRequest, res: Response) {
  const filter = (req.query.filter as string) || "recent";

  const sort =
    filter === "liked"
      ? { "likesCountVirtual": -1, createdAt: -1 }
      : filter === "commented"
      ? { commentsCount: -1, createdAt: -1 }
      : { createdAt: -1 };

  // We compute likesCount in aggregation for "liked" sorting
  const pipeline: any[] = [
    {
      $addFields: { likesCountVirtual: { $size: { $ifNull: ["$likes", []] } } },
    },
    { $sort: sort },
    { $limit: 50 },
  ];

  const posts = await BuzzPost.aggregate(pipeline);

  // populate author + reshareOf author in 2 steps (simple + safe)
  const ids = posts.map((p: any) => p._id);
  const full = await BuzzPost.find({ _id: { $in: ids } })
    .populate("author", "firstName lastName username")
    .populate({
      path: "reshareOf",
      populate: { path: "author", select: "firstName lastName username" },
    })
    .lean();

  // keep aggregation order
  const map = new Map(full.map((x: any) => [String(x._id), x]));
  const ordered = posts.map((p: any) => map.get(String(p._id))).filter(Boolean);

  res.json(ordered);
}

// POST /api/buzz
export async function createBuzz(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const { content, media } = req.body as {
    content?: string;
    media?: { type: "IMAGE" | "VIDEO"; url: string; name?: string; size?: number }[];
  };

  if (!content?.trim() && (!media || media.length === 0)) {
    throw ApiError.badRequest("Post must have text or media");
  }

  const post = await BuzzPost.create({
    author: new Types.ObjectId(userId),
    content: content || "",
    media: media || [],
  });

  const full = await BuzzPost.findById(post._id)
    .populate("author", "firstName lastName username")
    .lean();

  res.status(201).json(full);
}

// POST /api/buzz/:id/like
export async function toggleLike(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const postId = req.params.id;
  const uid = new Types.ObjectId(userId);

  const post = await BuzzPost.findById(postId).select("likes").exec();
  if (!post) throw ApiError.notFound("Post not found");

  const hasLiked = post.likes.some((x: any) => String(x) === String(uid));

  // ✅ atomic update (no TS assignment issues)
  const updated = await BuzzPost.findByIdAndUpdate(
    postId,
    hasLiked
      ? { $pull: { likes: uid } }
      : { $addToSet: { likes: uid } },
    { new: true }
  )
    .select("likes")
    .exec();

  res.json({
    liked: !hasLiked,
    likesCount: updated?.likes?.length ?? (hasLiked ? post.likes.length - 1 : post.likes.length + 1),
  });
}

// POST /api/buzz/:id/reshare
export async function resharePost(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const parentId = req.params.id;
  const { content } = req.body as { content?: string };

  const parent = await BuzzPost.findById(parentId);
  if (!parent) throw ApiError.notFound("Original post not found");

  const child = await BuzzPost.create({
    author: new Types.ObjectId(userId),
    content: content || "",
    reshareOf: parent._id,
  });

  await BuzzPost.updateOne({ _id: parent._id }, { $inc: { resharesCount: 1 } });

  const full = await BuzzPost.findById(child._id)
    .populate("author", "firstName lastName username")
    .populate({
      path: "reshareOf",
      populate: { path: "author", select: "firstName lastName username" },
    })
    .lean();

  res.status(201).json(full);
}

// GET /api/buzz/:id/comments
export async function listComments(req: AuthRequest, res: Response) {
  const postId = req.params.id;
  const comments = await BuzzComment.find({ post: postId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("author", "firstName lastName username")
    .lean();

  res.json(comments);
}

// POST /api/buzz/:id/comments
export async function addComment(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const postId = req.params.id;
  const { text } = req.body as { text?: string };
  if (!text?.trim()) throw ApiError.badRequest("Comment text required");

  const post = await BuzzPost.findById(postId);
  if (!post) throw ApiError.notFound("Post not found");

  const c = await BuzzComment.create({
    post: new Types.ObjectId(postId),
    author: new Types.ObjectId(userId),
    text: text.trim(),
  });

  await BuzzPost.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });

  const full = await BuzzComment.findById(c._id)
    .populate("author", "firstName lastName username")
    .lean();

  res.status(201).json(full);
}

// POST /api/buzz/upload  (multipart)
export async function uploadMedia(req: AuthRequest, res: Response) {
  const files = (req as any).files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) throw ApiError.badRequest("No files");

  const out = files.map((f) => ({
    type: toMediaType(f.mimetype),
    url: `/uploads/buzz/${f.filename}`,
    name: f.originalname,
    size: f.size,
  }));

  res.json(out);
}


export async function updateBuzzPost(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const postId = req.params.id;
  const { content } = req.body as { content?: string };

  const post = await BuzzPost.findById(postId).exec();
  if (!post) throw ApiError.notFound("Post not found");

  // allow only author (or ADMIN if you want)
  if (String(post.author) !== String(userId))
    throw ApiError.forbidden("Not allowed");

  post.content = (content ?? "").trim();
  await post.save();

  const full = await BuzzPost.findById(post._id)
    .populate("author", "firstName lastName username")
    .populate({
      path: "reshareOf",
      populate: { path: "author", select: "firstName lastName username" },
    })
    .lean();

  res.json(full);
}

export async function deleteBuzzPost(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const postId = req.params.id;
  const post = await BuzzPost.findById(postId).exec();
  if (!post) throw ApiError.notFound("Post not found");

  if (String(post.author) !== String(userId))
    throw ApiError.forbidden("Not allowed");

  // delete comments for that post
  await BuzzComment.deleteMany({ post: post._id });

  // if this post is a reshare, decrement parent count
  if (post.reshareOf) {
    await BuzzPost.updateOne(
      { _id: post.reshareOf },
      { $inc: { resharesCount: -1 } }
    );
  }

  await BuzzPost.deleteOne({ _id: post._id });

  res.json({ ok: true });
}

export async function updateBuzzComment(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const commentId = req.params.commentId;
  const { text } = req.body as { text?: string };
  if (!text?.trim()) throw ApiError.badRequest("Comment text required");

  const c = await BuzzComment.findById(commentId).exec();
  if (!c) throw ApiError.notFound("Comment not found");

  if (String(c.author) !== String(userId))
    throw ApiError.forbidden("Not allowed");

  c.text = text.trim();
  await c.save();

  const full = await BuzzComment.findById(c._id)
    .populate("author", "firstName lastName username")
    .lean();

  res.json(full);
}

export async function deleteBuzzComment(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const commentId = req.params.commentId;

  const c = await BuzzComment.findById(commentId).exec();
  if (!c) throw ApiError.notFound("Comment not found");

  if (String(c.author) !== String(userId))
    throw ApiError.forbidden("Not allowed");

  await BuzzComment.deleteOne({ _id: c._id });

  // decrement post comment count
  await BuzzPost.updateOne({ _id: c.post }, { $inc: { commentsCount: -1 } });

  res.json({ ok: true });
}