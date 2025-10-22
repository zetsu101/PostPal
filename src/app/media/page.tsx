'use client';

import React from 'react';
import { Container } from '@/components/Container';
import { PageHeader } from '@/components/PageHeader';
import MediaDashboard from '@/components/MediaDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function MediaPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Please log in to access your media library</h1>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="Media Library"
        subtitle="Upload and manage your media files for social media posts"
      />
      
      <div className="mt-8">
        <MediaDashboard userId={user.id} />
      </div>
    </Container>
  );
}
