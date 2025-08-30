'use client';

import { useQuery } from '@apollo/client/react';
import { GET_MEDIA_POSTS } from '@/graphql/queries/getPosts';
import SearchUsers from '../../components/search/SearchUsers';
import Navbar from '../../components/layout/Navbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Spinner from '@/components/shared/Spinner';
import { useRouter } from 'next/navigation';

export default function Explore() {
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_MEDIA_POSTS);

  const handlePostClick = (postId) => {
    router.push(`/post/${postId}`);
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-6">
            <SearchUsers />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center mt-8">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center mt-8">
              Error loading media posts
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-3 gap-4 md:gap-6">
              {data?.getMediaPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => handlePostClick(post.id)}>
                  {post.media.map((mediaUrl, index) => {
                    const isVideo = mediaUrl.toLowerCase().endsWith('.mp4');
                  console.log(mediaUrl);
                  
                    return isVideo ? (
                      <video 
                        key={index}
                        src={mediaUrl}
                        autoPlay={true}
                        muted
                        playsInline
                        loop
                        className="w-full h-full  group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <img
                        key={index}
                        src={mediaUrl}
                        alt={`Post by ${post.author.username}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    );
                  })}
               
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
