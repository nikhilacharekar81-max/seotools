/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { PublicHeader } from './components/layout/PublicHeader';
import { PublicFooter } from './components/layout/PublicFooter';
import { PublicWebsite } from './components/public/PublicWebsite';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HealthPerformanceCenter } from './components/admin/HealthPerformanceCenter';
import { ToolRegistry } from './components/admin/ToolRegistry';
import { ToolBuilder } from './components/admin/ToolBuilder';
import { CmsManager } from './components/admin/CmsManager';
import { WebsiteBuilder } from './components/admin/WebsiteBuilder';
import { MonetizationManager } from './components/admin/MonetizationManager';
import { UserManagement } from './components/admin/UserManagement';
import { DeveloperSuite } from './components/admin/DeveloperSuite';
import { PlatformSettings } from './components/admin/PlatformSettings';
import { CommandPalette } from './components/admin/CommandPalette';

const MainAppContent: React.FC = () => {
  const { viewMode, activeAdminTab } = usePlatform();

  return (
    <>
      {/* Global Command Palette modal (Cmd+K) */}
      <CommandPalette />

      {viewMode === 'public' ? (
        /* PUBLIC SEOTOOLS PORTAL & ONLINE UTILITIES */
        <div className="flex flex-col min-h-screen">
          <PublicHeader />
          <PublicWebsite />
          <PublicFooter />
        </div>
      ) : (
        /* ENTERPRISE UNIFIED ADMIN OPERATING CENTER */
        <AdminLayout>
          {activeAdminTab === 'dashboard' && <AdminDashboard />}
          {activeAdminTab === 'health' && <HealthPerformanceCenter />}
          {activeAdminTab === 'tools' && <ToolRegistry />}
          {activeAdminTab === 'tool_builder' && <ToolBuilder />}
          {activeAdminTab === 'cms' && <CmsManager />}
          {activeAdminTab === 'pages' && <WebsiteBuilder />}
          {activeAdminTab === 'monetization' && <MonetizationManager />}
          {activeAdminTab === 'users' && <UserManagement />}
          {activeAdminTab.startsWith('developer_') && <DeveloperSuite />}
          {activeAdminTab === 'settings' && <PlatformSettings />}
        </AdminLayout>
      )}
    </>
  );
};

export default function App() {
  return (
    <PlatformProvider>
      <MainAppContent />
    </PlatformProvider>
  );
}
