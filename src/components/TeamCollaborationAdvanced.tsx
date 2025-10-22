'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  MoreHorizontal, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Download, 
  Upload, 
  Search 
} from 'lucide-react';

// Mock data for demonstration
const mockMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2024-01-20',
    department: 'Marketing',
    avatar: '/avatars/sarah.jpg'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@company.com',
    role: 'editor',
    status: 'active',
    joinedAt: '2024-01-10',
    lastActive: '2024-01-19',
    department: 'Content',
    avatar: '/avatars/mike.jpg'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@company.com',
    role: 'viewer',
    status: 'pending',
    joinedAt: '2024-01-18',
    lastActive: '2024-01-18',
    department: 'Analytics',
    avatar: '/avatars/emily.jpg'
  }
];

const mockDepartments = [
  {
    id: '1',
    name: 'Marketing',
    description: 'Social media marketing and brand management',
    memberCount: 3,
    managerName: 'Sarah Johnson'
  },
  {
    id: '2',
    name: 'Content',
    description: 'Content creation and creative strategy',
    memberCount: 2,
    managerName: 'Mike Chen'
  },
  {
    id: '3',
    name: 'Analytics',
    description: 'Data analysis and performance optimization',
    memberCount: 1,
    managerName: 'Emily Rodriguez'
  }
];

const mockPermissions = [
  { id: '1', name: 'Create Posts', description: 'Create and schedule social media posts', category: 'content' },
  { id: '2', name: 'Edit Posts', description: 'Edit existing posts and content', category: 'content' },
  { id: '3', name: 'Delete Posts', description: 'Delete posts and content', category: 'content' },
  { id: '4', name: 'View Analytics', description: 'Access analytics dashboard and reports', category: 'analytics' },
  { id: '5', name: 'Export Data', description: 'Export analytics data and reports', category: 'analytics' },
  { id: '6', name: 'Manage Team', description: 'Invite and manage team members', category: 'team' },
  { id: '7', name: 'View Billing', description: 'Access billing information', category: 'billing' },
  { id: '8', name: 'Manage Settings', description: 'Configure account and app settings', category: 'settings' }
];

const mockActivities = [
  {
    id: '1',
    memberName: 'Sarah Johnson',
    action: 'created',
    target: 'Instagram post',
    details: 'Posted about new product launch',
    timestamp: new Date('2024-01-20T10:30:00')
  },
  {
    id: '2',
    memberName: 'Mike Chen',
    action: 'scheduled',
    target: 'LinkedIn article',
    details: 'Scheduled for tomorrow at 2 PM',
    timestamp: new Date('2024-01-20T09:15:00')
  },
  {
    id: '3',
    memberName: 'Emily Rodriguez',
    action: 'updated',
    target: 'Analytics report',
    details: 'Generated weekly performance report',
    timestamp: new Date('2024-01-20T08:45:00')
  }
];

export default function TeamCollaborationAdvanced() {
  const [activeTab, setActiveTab] = useState('members');
  const [members] = useState(mockMembers);
  const [permissions] = useState(mockPermissions);
  const [departments] = useState(mockDepartments);
  const [activities] = useState(mockActivities);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member',
    department: ''
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock invite functionality
    console.log('Inviting member:', inviteForm);
    setInviteForm({ email: '', role: 'member', department: '' });
    setShowInviteModal(false);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      case 'viewer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Collaboration</h1>
          <p className="text-gray-600">Manage your team members, permissions, and collaboration tools</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold">{members.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold">{members.filter(m => m.status === 'active').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-bold">{members.filter(m => m.status === 'pending').length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold">{departments.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'members', label: 'Team Members' },
              { id: 'departments', label: 'Departments' },
              { id: 'permissions', label: 'Permissions' },
              { id: 'activity', label: 'Activity Feed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Team Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Team Members</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No members found matching your search.' : 'No team members found.'}
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{member.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-sm text-gray-500">
                            {member.department} • Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={member.role} 
                          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Departments</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{dept.name}</h3>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {dept.memberCount} members
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                    {dept.managerName && (
                      <p className="text-sm text-gray-500">Manager: {dept.managerName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Permission System</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{permission.name}</h3>
                      <span className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded-full">
                        {permission.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{permission.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {activity.memberName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.memberName}</span>
                        <span className="text-sm text-gray-600">{activity.action}</span>
                        <span className="text-sm text-gray-600">{activity.target}</span>
                      </div>
                      {activity.details && (
                        <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Invite Team Member</h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select 
                  value={inviteForm.role} 
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="member">Member</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select 
                  value={inviteForm.department} 
                  onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Send Invite</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}