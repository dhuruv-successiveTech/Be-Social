"use client";

import ChatContainer from "../../components/chat/ChatContainer";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/layout/Navbar";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function Messages() {
  const { loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow">
            <ChatContainer />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
