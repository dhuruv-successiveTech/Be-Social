
"use client";

import Link from "next/link";

const UserListModal = ({ users, title, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center">
              <img
                src={user.avatar || "https://via.placeholder.com/40"}
                alt={user.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <Link href={`/profile/${user.id}`}>
                  <p className="font-semibold hover:underline">{user.name}</p>
                </Link>
                <p className="text-gray-500 text-sm">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
