'use client';

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      username
      name
      avatar
      bio
      followers {
        id
      }
    }
  }
`;

const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const { user: currentUser } = useAuth();

  const { loading, error, data } = useQuery(SEARCH_USERS, {
    variables: { query },
    skip: !query,
  });

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={handleSearch}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {loading && <div>Searching...</div>}
      {error && <div>Error searching users</div>}

      <div className="space-y-4">
        {data?.searchUsers.map((user) => (
          <Link key={user.id} href={`/profile/${user.id}`}>
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <img
                  src={user.avatar || 'https://via.placeholder.com/40'}
                  alt={user.username}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-4">
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
                {user.bio && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
        {data?.searchUsers.length === 0 && query && (
          <div className="text-center text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
