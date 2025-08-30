'use client';

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { GET_FEED, GET_USER_POSTS } from '@/graphql/queries';
import toast from 'react-hot-toast';
import { useApolloClient } from '@apollo/client/react';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { theme } = useTheme();
  const client = useApolloClient(); // Initialize Apollo Client

  const [error, setError] = useState('');
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    const maxFileSize = 50 * 1024 * 1024; // 50MB max file size

    // Validate file types and sizes
    const invalidFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        const error = `File type ${file.type} is not supported. Please use JPG, PNG, GIF, WEBP images or MP4, MOV, AVI, WEBM videos.`;
        setError(error);
        toast.error(error);
        return true;
      }
      if (file.size > maxFileSize) {
        const error = `File ${file.name} is too large. Maximum size is 50MB.`;
        setError(error);
        toast.error(error);
        return true;
      }
      return false;
    });

    if (invalidFiles.length > 0) {
      e.target.value = ''; // Reset file input
      return;
    }

    setError('');
    setMediaFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) {
      const error = 'Please add some content or media to your post';
      setError(error);
      toast.error(error);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      // Add each media file with a type indicator
      mediaFiles.forEach((file) => {
        formData.append('media', file);
        // Add the media type (video/image) as additional data
        formData.append('mediaTypes', file.type.startsWith('video/') ? 'video' : 'image');
      });

      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/create-post-with-media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create post');
      }

      // Format the new post to match the query structure
      const newPost = {
        ...result.data,
        __typename: 'Post',
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        likes: [],
        comments: [],
        author: {
          __typename: 'User',
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          name: user.name
        }
      };

      // Update Apollo cache to include the new post
      try {
        // Update feed cache
        const feedData = client.cache.readQuery({
          query: GET_FEED,
          variables: { offset: 0, limit: 10 }
        });

        if (feedData && feedData.getFeed) {
          client.cache.writeQuery({
            query: GET_FEED,
            variables: { offset: 0, limit: 10 },
            data: {
              getFeed: [newPost, ...feedData.getFeed]
            }
          });
        } else {
          // If there's no existing feed data, write the new post as the only item
          client.cache.writeQuery({
            query: GET_FEED,
            variables: { offset: 0, limit: 10 },
            data: {
              getFeed: [newPost]
            }
          });
        }

        // Update user posts cache
        const userPostsData = client.cache.readQuery({
          query: GET_USER_POSTS,
          variables: { userId: user.id, offset: 0, limit: 10 }
        });

        if (userPostsData && userPostsData.getUserPosts) {
          client.cache.writeQuery({
            query: GET_USER_POSTS,
            variables: { userId: user.id, offset: 0, limit: 10 },
            data: {
              getUserPosts: [newPost, ...userPostsData.getUserPosts]
            }
          });
        }
      } catch (e) {
        console.error('Cache update failed:', e);
        // If cache update fails, fall back to refetching
        await client.refetchQueries({
          include: ['GetFeed', 'GetUserPosts']
        });
      }

      setContent('');
      setMediaFiles([]);
      onPostCreated && onPostCreated(result); // Pass the new post data
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className={`${theme === 'light' ? 'bg-[#FFFAF5]' : 'bg-gray-800'} shadow-md hover:shadow-lg rounded-xl p-6 mb-6 transition-all duration-200`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <img
            src={user?.avatar || "https://via.placeholder.com/40"}
            alt={user?.username}
            className={`w-10 h-10 rounded-full ring-2 ring-indigo-500/20 ${theme === 'light' ? 'bg-[#FFF6E9]' : 'bg-gray-700'}`}
          />
          <div className="flex-1">
            <textarea
              className={`w-full p-4 border-0 rounded-xl focus:ring-2 resize-none transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-[#FFF6E9] text-gray-800 placeholder-gray-500 focus:ring-indigo-500'
                  : 'bg-gray-700/50 text-gray-200 placeholder-gray-500 focus:ring-indigo-400'
              }`}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="3"
            />
          </div>
        </div>
        
        <div className={`mt-4 flex items-center justify-between border-t pt-4 ${
          theme === 'light' ? 'border-gray-200' : 'border-gray-700'
        }`}>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className={`flex items-center space-x-2 transition-colors ${
                theme === 'light'
                  ? 'text-gray-600 hover:text-indigo-500'
                  : 'text-gray-400 hover:text-indigo-400'
              }`}
              onClick={() => document.getElementById('media-input').click()}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">Add media</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || (!content.trim() && mediaFiles.length === 0)}
            className={`px-6 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ${
              theme === 'light' ? 'focus:ring-offset-[#FFFAF5]' : 'focus:ring-offset-gray-800'
            } ${
              loading || (!content.trim() && mediaFiles.length === 0)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Posting...</span>
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>
        
        <input
          id="media-input"
          type="file"
          multiple
          accept="image/*, video/mp4, video/quicktime, video/x-msvideo, video/webm"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {mediaFiles.length > 0 && (
          <div className={`mt-4 p-3 rounded-lg ${theme === 'light' ? 'bg-[#FFF6E9]' : 'bg-gray-700/50'}`}>
            <div className="grid grid-cols-2 gap-2">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="rounded-lg w-full h-40 object-cover"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      className="rounded-lg w-full h-40 object-cover"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = [...mediaFiles];
                      newFiles.splice(index, 1);
                      setMediaFiles(newFiles);
                      if (newFiles.length === 0 && !content.trim()) {
                        setError('Please add some content or media to your post');
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
          
};

export default CreatePost;