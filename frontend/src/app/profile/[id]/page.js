'use client';

import { useParams } from 'next/navigation';
import Profile from '../../../components/profile/Profile';
import Navbar from '../../../components/layout/Navbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id;

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-6">
            <Profile userId={userId} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
