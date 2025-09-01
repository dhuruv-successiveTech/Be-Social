"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { GET_POST_BY_ID } from "@/graphql/queries/getPosts";
import Navbar from "@/components/layout/Navbar";
import Spinner from "@/components/shared/Spinner";
import CommentList from "@/components/comment/CommentList";
import { formatDistanceToNow } from "date-fns";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import { Card } from "@/components/common/Card";
import Image from "next/image";

export default function PostDetail() {
  const params = useParams();

  const { loading, error, data } = useQuery(GET_POST_BY_ID, {
    variables: { id: params.id },
  });

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <Spinner />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <p className="text-red-500 bg-red-50 dark:bg-red-900/30 rounded-xl p-4 shadow">Error loading post</p>
        </div>
      </div>
    );

  const post = data?.getPost;

  if (!post) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen ">
        <Navbar />
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
          <Card className="p-8 animate-fadeIn" animate hover>
            {/* Author info */}
            <div className="flex items-center mb-6">
              <Image
                src={post.author.avatar || "/default-media-placeholder.jpg"}
                alt={post.author.username}
                className="w-12 h-12 rounded-full border-2 border-indigo-100 dark:border-indigo-900 object-cover"
                width={48}
                height={48}
              />
              <div className="ml-4">
                <p className="font-semibold text-indigo-600 dark:text-indigo-300 text-lg">{post.author.username}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatDistanceToNow(new Date(parseInt(post.createdAt)), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Media content */}
            <div className="mb-6">
              {post.media.map((mediaUrl, index) => {
                const isVideo = mediaUrl.toLowerCase().endsWith(".mp4");
                return isVideo ? (
                  <video
                    key={index}
                    src={mediaUrl}
                    controls
                    className="w-full h-[28rem] rounded-xl shadow object-cover"
                  />
                ) : (
                  <Image
                    key={index}
                    src={mediaUrl}
                    alt={`Post content ${index + 1}`}
                    className="w-full h-[28rem] object-cover rounded-xl shadow"
                    width={700}
                    height={500}
                  />
                );
              })}
            </div>

            {/* Caption */}
            <p className="text-gray-900 dark:text-white mb-6 text-lg font-medium">{post.caption}</p>

            {/* Likes and comments count */}
            <div className="flex items-center text-indigo-500 dark:text-indigo-300 text-base mb-8 font-semibold">
              <span>{post.likes.length} likes</span>
              <span className="mx-3">•</span>
              <span>{post.comments.length} comments</span>
            </div>

            {/* Comments section */}
            <div className="border-t border-indigo-100 dark:border-indigo-900 pt-6">
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-300 mb-4 text-lg">Comments</h3>
              <CommentList comments={post?.comments} postId={post.id} />
            </div>
          </Card>
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
