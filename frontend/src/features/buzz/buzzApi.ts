import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface BuzzMedia {
  type: "IMAGE" | "VIDEO";
  url: string;
  name?: string;
  size?: number;
}

export interface BuzzPost {
  _id: string;
  author: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  content: string;
  media: BuzzMedia[];
  reshareOf?: BuzzPost | null;
  likes: string[];
  commentsCount: number;
  resharesCount: number;
  createdAt: string;
}

export interface BuzzComment {
  _id: string;
  text: string;
  author: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  createdAt: string;
}

export const buzzApi = createApi({
  reducerPath: "buzzApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Buzz", "Comments"],
  endpoints: (builder) => ({
    getBuzzPosts: builder.query<BuzzPost[], { filter?: string } | void>({
      query: (args) => {
        const filter = (args as any)?.filter;
        return filter ? `buzz?filter=${filter}` : "buzz";
      },
      providesTags: ["Buzz"],
    }),

    createBuzzPost: builder.mutation<
      BuzzPost,
      { content: string; media?: BuzzMedia[] }
    >({
      query: (body) => ({
        url: "buzz",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Buzz"],
    }),

    updateBuzzPost: builder.mutation<BuzzPost, { id: string; content: string }>(
      {
        query: ({ id, content }) => ({
          url: `buzz/${id}`,
          method: "PATCH",
          body: { content },
        }),
        invalidatesTags: ["Buzz"],
      }
    ),

    deleteBuzzPost: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `buzz/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Buzz"],
    }),

    updateComment: builder.mutation<
      BuzzComment,
      { postId: string; commentId: string; text: string }
    >({
      query: ({ postId, commentId, text }) => ({
        url: `buzz/${postId}/comments/${commentId}`,
        method: "PATCH",
        body: { text },
      }),
      invalidatesTags: (_r, _e, { postId }) => [
        { type: "Comments", id: postId },
        "Buzz",
      ],
    }),

    deleteComment: builder.mutation<
      { ok: boolean },
      { postId: string; commentId: string }
    >({
      query: ({ postId, commentId }) => ({
        url: `buzz/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { postId }) => [
        { type: "Comments", id: postId },
        "Buzz",
      ],
    }),

    uploadBuzzMedia: builder.mutation<BuzzMedia[], FormData>({
      query: (form) => ({
        url: "buzz/upload",
        method: "POST",
        body: form,
      }),
    }),

    likeBuzzPost: builder.mutation<
      { liked: boolean; likesCount: number },
      string
    >({
      query: (id) => ({
        url: `buzz/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Buzz"],
    }),

    reshareBuzzPost: builder.mutation<
      BuzzPost,
      { id: string; content?: string }
    >({
      query: ({ id, content }) => ({
        url: `buzz/${id}/reshare`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Buzz"],
    }),

    getComments: builder.query<BuzzComment[], string>({
      query: (postId) => `buzz/${postId}/comments`,
      providesTags: (_r, _e, id) => [{ type: "Comments", id }],
    }),

    addComment: builder.mutation<BuzzComment, { postId: string; text: string }>(
      {
        query: ({ postId, text }) => ({
          url: `buzz/${postId}/comments`,
          method: "POST",
          body: { text },
        }),
        invalidatesTags: (_r, _e, { postId }) => [
          { type: "Comments", id: postId },
          "Buzz",
        ],
      }
    ),
  }),
});

export const {
  useGetBuzzPostsQuery,
  useCreateBuzzPostMutation,
  useUploadBuzzMediaMutation,
  useLikeBuzzPostMutation,
  useReshareBuzzPostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateBuzzPostMutation,
  useDeleteBuzzPostMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = buzzApi;
