import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  Plus, 
  Check, 
  Sliders, 
  Lock, 
  ShieldAlert,
  UserX
} from 'lucide-react';
import { User, Role } from '../../types';

export const UserManagement: React.FC = () => {
  const { users, updateUserRole } = usePlatform();
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E1D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1B3E2B] font-serif">
              Community & Access Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142E20] font-serif">Faculty & Student Directory</h1>
          <p className="text-xs text-[#52685B]">
            Granular access controls across learning tools, curriculum publishing, and administrative utilities.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E6E1D8] p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-serif ${
              activeTab === 'users' ? 'bg-[#1B3E2B] text-white shadow-xs' : 'text-[#52685B] hover:text-[#142E20]'
            }`}
          >
            Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-serif ${
              activeTab === 'roles' ? 'bg-[#1B3E2B] text-white shadow-xs' : 'text-[#52685B] hover:text-[#142E20]'
            }`}
          >
            Permissions Matrix
          </button>
        </div>
      </div>

      {/* VIEW 1: USER LIST */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">User Account</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4">Tool Runs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-6 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-6">
                      <div>
                        <strong className="text-slate-900 block font-semibold">{u.name}</strong>
                        <span className="text-slate-400 font-mono text-[11px]">{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        u.role === 'owner' || u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] uppercase">
                        {u.plan}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                      {u.usageCount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{u.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {u.createdAt}
                    </td>

                    <td className="py-3 px-6 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                        disabled={u.role === 'owner'}
                        className="p-1 border border-slate-200 rounded text-xs bg-white text-slate-700 disabled:opacity-50"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="tool_developer">Tool Developer</option>
                        <option value="editor">Content Editor</option>
                        <option value="user">Registered User</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: GRANULAR RBAC PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Role Capability Matrix</h3>
            <p className="text-xs text-slate-500">
              Deterministic security boundaries configured in platform authentication policies.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3">System Permission</th>
                  <th className="pb-3 text-center">Owner</th>
                  <th className="pb-3 text-center">Admin</th>
                  <th className="pb-3 text-center">Tool Developer</th>
                  <th className="pb-3 text-center">Editor</th>
                  <th className="pb-3 text-center">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { perm: 'Deploy / Delete Tool Modules', owner: true, admin: true, dev: true, editor: false, user: false },
                  { perm: 'Toggle Tool ON / OFF (Maintenance)', owner: true, admin: true, dev: true, editor: false, user: false },
                  { perm: 'Publish / Edit CMS Blog Posts', owner: true, admin: true, dev: false, editor: true, user: false },
                  { perm: 'Access Source Code Inspector', owner: true, admin: true, dev: true, editor: false, user: false },
                  { perm: 'Platform Data Storage Studio Read/Write', owner: true, admin: true, dev: false, editor: false, user: false },
                  { perm: 'View SEO Analytics & Keyword Telemetry', owner: true, admin: true, dev: false, editor: false, user: false },
                  { perm: 'Purge Cloudflare Edge Cache', owner: true, admin: true, dev: true, editor: true, user: false },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-800">{row.perm}</td>
                    <td className="py-3 text-center">{row.owner ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '-'}</td>
                    <td className="py-3 text-center">{row.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '-'}</td>
                    <td className="py-3 text-center">{row.dev ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '-'}</td>
                    <td className="py-3 text-center">{row.editor ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '-'}</td>
                    <td className="py-3 text-center">{row.user ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
