"use client";

import { useQuery } from "@apollo/client/react";
import { GET_MEDIA_POSTS } from "@/graphql/queries/getPosts";
import SearchUsers from "../../components/search/SearchUsers";
import Navbar from "../../components/layout/Navbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Spinner from "@/components/shared/Spinner";
import { useRouter } from "next/navigation";
import { Card } from "../../components/common/Card";
import { motion } from "framer-motion";
import {
  fadeInScale,
  staggerContainer,
} from "../../components/common/animations";
import Image from "next/image";
import { PageBackground } from "../../components/common";

export default function Explore() {
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_MEDIA_POSTS);

  const handlePostClick = (postId) => {
    router.push(`/post/${postId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <PageBackground>
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Card className="mb-8" animate hover>
              <SearchUsers />
            </Card>
            {loading ? (
              <div className="flex justify-center items-center mt-8">
                <Spinner />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center mt-8">
                Error loading media posts
              </div>
            ) : (
              <motion.div
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {data?.getMediaPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={fadeInScale}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 8px 32px rgba(99,102,241,0.12)",
                    }}
                    className="relative aspect-square cursor-pointer overflow-hidden"
                    onClick={() => handlePostClick(post.id)}
                  >
                    <Card
                      className="h-full w-full flex items-center justify-center p-0"
                      hover
                      animate
                    >
                      {post.media.map((mediaUrl, index) => {
                        const isVideo = mediaUrl.toLowerCase().endsWith(".mp4");
                        return isVideo ? (
                          <video
                            key={index}
                            src={mediaUrl}
                            autoPlay={true}
                            muted
                            playsInline
                            loop
                            className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300"
                            style={{
                              objectFit: "cover",
                              borderRadius: "0.75rem",
                            }}
                          />
                        ) : (
                          <Image
                            key={index}
                            src={mediaUrl}
                            alt={`Post by ${post.author.username}`}
                            width={700}
                            height={500}
                            className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300"
                            style={{
                              objectFit: "cover",
                              borderRadius: "0.25rem",
                            }}
                          />
                        );
                      })}
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </PageBackground>
      </div>
    </ProtectedRoute>
  );
}
