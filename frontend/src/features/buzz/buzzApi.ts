// frontend/src/features/buzz/buzzApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface BuzzComment {
  author: any;
  text: string;
  createdAt: string;
}

export interface BuzzPost {
  _id: string;
  author: any;
  content: string;
  likes: any[];
  comments: BuzzComment[];
  visibility: "PUBLIC" | "ORGANIZATION";
  createdAt: string;
}

export const buzzApi = createApi({
  reducerPath: "buzzApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["BuzzPost"],
  endpoints: (builder) => ({
    getBuzzPosts: builder.query<BuzzPost[], void>({
      query: () => "buzz/posts",
      providesTags: ["BuzzPost"],
    }),
    createBuzzPost: builder.mutation<BuzzPost, { content: string; visibility?: "PUBLIC" | "ORGANIZATION" }>({
      query: (body) => ({
        url: "buzz/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BuzzPost"],
    }),
    likeBuzzPost: builder.mutation<BuzzPost, string>({
      query: (id) => ({
        url: `buzz/posts/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: ["BuzzPost"],
    }),
    commentOnBuzzPost: builder.mutation<
      BuzzPost,
      { id: string; text: string }
    >({
      query: ({ id, text }) => ({
        url: `buzz/posts/${id}/comment`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["BuzzPost"],
    }),
  }),
});

export const {
  useGetBuzzPostsQuery,
  useCreateBuzzPostMutation,
  useLikeBuzzPostMutation,
  useCommentOnBuzzPostMutation,
} = buzzApi;
