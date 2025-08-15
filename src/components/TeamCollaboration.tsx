"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "manager" | "creator" | "viewer";
  status: "active" | "pending" | "inactive";
  joinedDate: string;
  lastActive: string;
  permissions: string[];
}

interface TeamWorkspace {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  projects: string[];
  createdAt: string;
  owner: string;
}

interface ApprovalRequest {
  id: string;
  title: string;
  content: string;
  platform: string;
  scheduledDate: string;
  requester: TeamMember;
  approver?: TeamMember;
  status: "pending" | "approved" | "rejected" | "draft";
  createdAt: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: TeamMember;
  content: string;
  timestamp: string;
  type: "comment" | "approval" | "rejection";
}

export default function TeamCollaboration() {
  const [activeTab, setActiveTab] = useState("members");
  const [, setShowWorkspaceModal] = useState(false);
  const [, setShowInviteModal] = useState(false);
  const [, setSelectedMember] = useState<TeamMember | null>(null);

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@postpal.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      role: "admin",
      status: "active",
      joinedDate: "2024-01-15",
      lastActive: "2 minutes ago",
      permissions: ["manage_team", "approve_content", "view_analytics", "create_content"]
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@postpal.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      role: "manager",
      status: "active",
      joinedDate: "2024-01-20",
      lastActive: "5 minutes ago",
      permissions: ["approve_content", "view_analytics", "create_content"]
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma@postpal.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      role: "creator",
      status: "active",
      joinedDate: "2024-01-25",
      lastActive: "1 hour ago",
      permissions: ["create_content", "view_analytics"]
    },
    {
      id: "4",
      name: "Alex Rodriguez",
      email: "alex@postpal.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      role: "viewer",
      status: "pending",
      joinedDate: "2024-01-30",
      lastActive: "Never",
      permissions: ["view_analytics"]
    }
  ]);

  const [workspaces] = useState<TeamWorkspace[]>([
    {
      id: "1",
      name: "Marketing Campaign",
      description: "Q1 2024 product launch campaign",
      members: teamMembers.slice(0, 3),
      projects: ["Product Launch", "Brand Awareness", "Lead Generation"],
      createdAt: "2024-01-15",
      owner: "Sarah Johnson"
    },
    {
      id: "2",
      name: "Content Calendar",
      description: "Weekly content planning and scheduling",
      members: teamMembers.slice(0, 2),
      projects: ["Weekly Posts", "Story Content", "Reel Production"],
      createdAt: "2024-01-20",
      owner: "Mike Chen"
    }
  ]);

  const [approvalRequests] = useState<ApprovalRequest[]>([
    {
      id: "1",
      title: "Product Launch Announcement",
      content: "Excited to announce our new AI-powered features! 🚀",
      platform: "Instagram",
      scheduledDate: "2024-02-15 10:00 AM",
      requester: teamMembers[2],
      status: "pending",
      createdAt: "2024-02-10 09:30 AM",
      comments: [
        {
          id: "1",
          author: teamMembers[1],
          content: "Great content! Just need to add the product link.",
          timestamp: "2024-02-10 10:15 AM",
          type: "comment"
        }
      ]
    },
    {
      id: "2",
      title: "Behind the Scenes",
      content: "A day in the life of our development team 💻",
      platform: "LinkedIn",
      scheduledDate: "2024-02-16 02:00 PM",
      requester: teamMembers[2],
      approver: teamMembers[1],
      status: "approved",
      createdAt: "2024-02-09 03:45 PM",
      comments: []
    }
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "from-[#EF4444] to-[#F87171]";
      case "manager": return "from-[#F59E0B] to-[#FCD34D]";
      case "creator": return "from-[#10B981] to-[#34D399]";
      case "viewer": return "from-[#6B7280] to-[#9CA3AF]";
      default: return "from-[#6B7280] to-[#9CA3AF]";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-[#10B981]";
      case "pending": return "text-[#F59E0B]";
      case "inactive": return "text-[#EF4444]";
      default: return "text-[#6B7280]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return "🟢";
      case "pending": return "🟡";
      case "inactive": return "🔴";
      default: return "⚪";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Team Collaboration</h2>
          <p className="text-[#6B7280]">Manage your team, workspaces, and approval workflows</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowWorkspaceModal(true)}
            className="px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors"
          >
            + New Workspace
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            + Invite Member
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {[
          { id: "members", label: "Team Members", icon: "👥" },
          { id: "workspaces", label: "Workspaces", icon: "📁" },
          { id: "approvals", label: "Approvals", icon: "✅" },
          { id: "activity", label: "Activity", icon: "📊" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#87CEFA] shadow-md"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Based on Active Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "members" && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-[#87CEFA]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-[#1F2937]">{member.name}</div>
                        <div className="text-sm text-[#6B7280]">{member.email}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(member.role)} text-white`}>
                      {member.role}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{getStatusIcon(member.status)}</span>
                      <span className={`font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      Last active: {member.lastActive}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-[#6B7280] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                    <button className="px-3 py-2 bg-[#87CEFA] text-white rounded-lg text-sm font-medium hover:bg-[#5F9EC7] transition-colors">
                      Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Team Statistics */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Team Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#87CEFA]">{teamMembers.length}</div>
                  <div className="text-sm text-[#6B7280]">Total Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#10B981]">
                    {teamMembers.filter(m => m.status === 'active').length}
                  </div>
                  <div className="text-sm text-[#6B7280]">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F59E0B]">
                    {teamMembers.filter(m => m.status === 'pending').length}
                  </div>
                  <div className="text-sm text-[#6B7280]">Pending Invites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#40E0D0]">{workspaces.length}</div>
                  <div className="text-sm text-[#6B7280]">Workspaces</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "workspaces" && (
          <motion.div
            key="workspaces"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Workspaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workspaces.map((workspace) => (
                <motion.div
                  key={workspace.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-[#87CEFA]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#1F2937]">{workspace.name}</h3>
                      <p className="text-[#6B7280] mt-1">{workspace.description}</p>
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-sm font-medium text-[#1F2937] mb-2">Members ({workspace.members.length})</div>
                      <div className="flex -space-x-2">
                        {workspace.members.map((member) => (
                          <Image
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            title={member.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-[#1F2937] mb-2">Projects</div>
                      <div className="flex flex-wrap gap-2">
                        {workspace.projects.map((project) => (
                          <span
                            key={project}
                            className="px-2 py-1 bg-[#87CEFA]/10 text-[#87CEFA] rounded text-xs font-medium"
                          >
                            {project}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-[#87CEFA] text-white rounded-lg text-sm font-medium hover:bg-[#5F9EC7] transition-colors">
                      Open Workspace
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-[#6B7280] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      Settings
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "approvals" && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Approval Requests */}
            <div className="space-y-4">
              {approvalRequests.map((request) => (
                <motion.div
                  key={request.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-[#87CEFA]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={request.requester.avatar}
                        alt={request.requester.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-[#1F2937]">{request.title}</div>
                        <div className="text-sm text-[#6B7280]">
                          Requested by {request.requester.name} • {request.platform}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                      request.status === 'approved' ? 'bg-[#10B981]/10 text-[#10B981]' :
                      request.status === 'rejected' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                      'bg-[#6B7280]/10 text-[#6B7280]'
                    }`}>
                      {request.status}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-[#6B7280] mb-2">Content Preview:</div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      {request.content}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[#6B7280]">
                      Scheduled: {request.scheduledDate}
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors">
                            Approve
                          </button>
                          <button className="px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="px-4 py-2 bg-gray-100 text-[#6B7280] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Activity Feed */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#87CEFA] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    S
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-[#1F2937]">Sarah Johnson</span>
                      <span className="text-[#6B7280]"> approved a post for Instagram</span>
                    </div>
                    <div className="text-xs text-[#6B7280] mt-1">2 minutes ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#40E0D0] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-[#1F2937]">Mike Chen</span>
                                             <span className="text-[#6B7280]"> created a new workspace &ldquo;Q2 Campaign&rdquo;</span>
                    </div>
                    <div className="text-xs text-[#6B7280] mt-1">15 minutes ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    E
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-[#1F2937]">Emma Davis</span>
                      <span className="text-[#6B7280]"> submitted content for approval</span>
                    </div>
                    <div className="text-xs text-[#6B7280] mt-1">1 hour ago</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 