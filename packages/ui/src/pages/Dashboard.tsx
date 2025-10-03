/**
 * User Dashboard
 * Displays user profile, insights, patterns, and analytics
 */

import React from 'react';
import { useLearningLoop } from '@auraos/hooks';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import DashboardComponent from '../components/dashboard/Dashboard';
import DataTable from '../components/dashboard/DataTable';

export function Dashboard() {
  const { userProfile: profile, loading: profileLoading } = useAuth();
  const { loading: learningLoading } = useLearningLoop();

  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path);
    // Implement navigation logic
  };

  if (profileLoading || learningLoading) {
    return (
      <Layout currentPath="/dashboard" onNavigate={handleNavigate}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout currentPath="/dashboard" onNavigate={handleNavigate}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPath="/dashboard" onNavigate={handleNavigate}>
      <div className="space-y-6">
        {/* Modern Dashboard Component */}
        <DashboardComponent />
        
        {/* Data Table for Projects/Workflows */}
        <DataTable 
          onEdit={(id) => console.log('Edit project:', id)}
          onDelete={(id) => console.log('Delete project:', id)}
          onDuplicate={(id) => console.log('Duplicate project:', id)}
          onExport={(ids) => console.log('Export projects:', ids)}
          onArchive={(ids) => console.log('Archive projects:', ids)}
        />
      </div>
    </Layout>
  );
}
