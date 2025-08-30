"use client";

import { useState } from "react";
import NotificationList from "../../components/notification/NotificationList";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/layout/Navbar";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function Notifications() {
  const { user, loading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  if (loading) return <div>Loading...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-full transition duration-150 ease-in-out transform hover:scale-105 shadow-md flex items-center gap-2"
            >
              <span>{showNotifications ? "Hide" : "Show"} Notifications</span>
              {showNotifications ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
          {showNotifications && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
              <NotificationList onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
