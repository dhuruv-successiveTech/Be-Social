"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { GET_POST_BY_ID } from "@/graphql/queries/getPosts";
import Navbar from "@/components/layout/Navbar";
import Spinner from "@/components/shared/Spinner";
import CommentList from "@/components/comment/CommentList";
import { formatDistanceToNow } from "date-fns";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";

export default function PostDetail() {
  const params = useParams();

  const { loading, error, data } = useQuery(GET_POST_BY_ID, {
    variables: { id: params.id },
  });

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <Spinner />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <p className="text-red-500">Error loading post</p>
        </div>
      </div>
    );

  const post = data?.getPost;

  if (!post) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {/* Author info */}
              <div className="flex items-center mb-4">
                <img
                  src={post.author.avatar || "/default-media-placeholder.jpg"}
                  alt={post.author.username}
                  className="w-10 h-10 rounded-full object-fit"
                />
                <div className="ml-3">
                  <p className="font-semibold">{post.author.username}</p>
                  <p className="text-gray-500 text-sm">
                    {formatDistanceToNow(new Date(parseInt(post.createdAt)), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {/* Media content */}
              <div className="mb-4">
                {post.media.map((mediaUrl, index) => {
                  const isVideo = mediaUrl.toLowerCase().endsWith(".mp4");
                  return isVideo ? (
                    <video
                      key={index}
                      src={mediaUrl}
                      controls
                      className="w-full h-[30rem] rounded-lg"
                    />
                  ) : (
                    <img
                      key={index}
                      src={mediaUrl}
                      alt={`Post content ${index + 1}`}
                      className="w-full h-[30rem] object-scale-down rounded-lg"
                    />
                  );
                })}
              </div>

              {/* Caption */}
              <p className="text-gray-800 mb-4">{post.caption}</p>

              {/* Likes and comments count */}
              <div className="flex items-center text-gray-500 text-sm mb-6">
                <span>{post.likes.length} likes</span>
                <span className="mx-2">•</span>
                <span>{post.comments.length} comments</span>
              </div>

              {/* Comments section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Comments</h3>
                <CommentList comments={post?.comments} postId={post.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
