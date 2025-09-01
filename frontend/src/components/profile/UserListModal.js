
"use client";

import Link from "next/link";

const UserListModal = ({ users, title, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-indigo-100 dark:border-indigo-900 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-indigo-500 text-3xl font-bold transition-colors duration-200"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="space-y-5">
          {users.map((user) => (
            <div key={user.id} className="flex items-center p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow hover:shadow-lg transition-all duration-200">
              <img
                src={user.avatar || "https://via.placeholder.com/40"}
                alt={user.username}
                loading="lazy"
                className="w-12 h-12 rounded-full border-2 border-indigo-100 dark:border-indigo-900 object-cover mr-4"
              />
              <div>
                <Link href={`/profile/${user.id}`}>
                  <p className="font-semibold text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer">{user.name}</p>
                </Link>
                <p className="text-indigo-500 dark:text-indigo-300 text-sm">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
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
  );
};

export default UserListModal;
