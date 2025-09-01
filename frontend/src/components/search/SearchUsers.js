"use client";

import { useState, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Card } from "../common/Card";
import { SEARCH_USERS } from "../../graphql/queries/user";
import Image from "next/image";
import useAuth from "../../hooks/useAuth";

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const { loading, error, data } = useQuery(SEARCH_USERS, {
    variables: { query },
    skip: false
  });

  const [showList, setShowList] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setShowList(true);
  };

  const handleFocus = () => {
    setShowList(true);
  };

  const handleBlur = (e) => {
    // Delay hiding to allow click
    setTimeout(() => setShowList(false), 150);
  };

  // Filter users by query if present
  const users = query
    ? data?.searchUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.name.toLowerCase().includes(query.toLowerCase())
      )
    : data?.searchUsers.filter((sUser) => sUser?.id != user?.id);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="mb-6" animate hover>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
        />
      </Card>

      {loading && (
        <div className="text-center text-indigo-500">Searching...</div>
      )}
      {error && (
        <div className="text-center text-red-500">Error searching users</div>
      )}

      {showList && (
        <div className="space-y-4">
          {users?.map((user) => (
            <Card
              key={user.id}
              className="p-4 hover:shadow-xl cursor-pointer transition-all duration-300"
              animate
              hover
              onMouseDown={() => router.push(`/profile/${user.id}`)}
            >
              <div className="flex items-center">
                <Image
                  src={user.avatar || "https://via.placeholder.com/40"}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-indigo-100 dark:border-indigo-900 object-cover"
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-indigo-500 dark:text-indigo-300">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
                <span className="ml-4 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium">
                  {user.followers.length} followers
                </span>
              </div>
            </Card>
          ))}
          {users?.length === 0 && query && (
            <Card className="text-center text-gray-500 p-4" animate>
              No users found
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
