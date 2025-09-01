"use client";
import Navbar from "../components/layout/Navbar";
import CreatePost from "../components/post/CreatePost";
import Feed from "../components/post/Feed";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { PageBackground } from "../components/common";

export default function Home() {

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FFFAF5] dark:bg-gray-900 transition-all duration-200">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <PageBackground>
            <CreatePost
            onPostCreated={() => {
              window.location.reload();
            }}
          />
          <Feed />
          </PageBackground>
        </div>
      </main>
    </ProtectedRoute>
  );
}
