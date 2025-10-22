import { createClient } from '@/lib/supabase';

export interface TeamMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  departmentId?: string;
  permissions: Record<string, boolean>;
  joinedAt: string;
  lastActive: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  department?: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
  organization: {
    id: string;
    name: string;
    subscriptionPlan: string;
  };
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  managerId?: string;
  color: string;
  memberCount: number;
}

export interface TeamActivity {
  id: string;
  organizationId: string;
  teamMemberId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  createdAt: string;
  teamMember: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export interface TeamInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  departmentId?: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

class TeamService {
  private supabase = createClient();

  async getTeamMembers(organizationId?: string): Promise<TeamMember[]> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch('/api/team/members', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch team members: ${response.statusText}`);
      }

      const data = await response.json();
      return data.teamMembers || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  async inviteTeamMember(
    organizationId: string,
    email: string,
    role: string,
    departmentId?: string
  ): Promise<TeamMember> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch('/api/team/members', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          email,
          role,
          departmentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite team member');
      }

      const data = await response.json();
      return data.teamMember;
    } catch (error) {
      console.error('Error inviting team member:', error);
      throw error;
    }
  }

  async updateTeamMember(
    memberId: string,
    updates: {
      role?: string;
      status?: string;
      departmentId?: string;
    }
  ): Promise<TeamMember> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch('/api/team/members', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team member');
      }

      const data = await response.json();
      return data.teamMember;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  }

  async removeTeamMember(memberId: string): Promise<void> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(`/api/team/members?memberId=${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  async getDepartments(organizationId: string): Promise<Department[]> {
    try {
      const { data, error } = await this.supabase
        .from('departments')
        .select(`
          *,
          team_members(count)
        `)
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;

      return data.map(dept => ({
        id: dept.id,
        organizationId: dept.organization_id,
        name: dept.name,
        description: dept.description,
        managerId: dept.manager_id,
        color: dept.color,
        memberCount: dept.team_members?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  async createDepartment(
    organizationId: string,
    name: string,
    description: string,
    color: string = '#3B82F6'
  ): Promise<Department> {
    try {
      const { data, error } = await this.supabase
        .from('departments')
        .insert({
          organization_id: organizationId,
          name,
          description,
          color,
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        organizationId: data.organization_id,
        name: data.name,
        description: data.description,
        managerId: data.manager_id,
        color: data.color,
        memberCount: 0,
      };
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  async updateDepartment(
    departmentId: string,
    updates: {
      name?: string;
      description?: string;
      color?: string;
      managerId?: string;
    }
  ): Promise<Department> {
    try {
      const { data, error } = await this.supabase
        .from('departments')
        .update(updates)
        .eq('id', departmentId)
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        organizationId: data.organization_id,
        name: data.name,
        description: data.description,
        managerId: data.manager_id,
        color: data.color,
        memberCount: 0, // This would need to be calculated separately
      };
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('departments')
        .delete()
        .eq('id', departmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  async getTeamActivities(
    organizationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TeamActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('team_activities')
        .select(`
          *,
          team_members!inner(
            user:users(
              name,
              email
            )
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data.map(activity => ({
        id: activity.id,
        organizationId: activity.organization_id,
        teamMemberId: activity.team_member_id,
        action: activity.action,
        targetType: activity.target_type,
        targetId: activity.target_id,
        details: activity.details,
        createdAt: activity.created_at,
        teamMember: {
          id: activity.team_members.id,
          user: activity.team_members.user,
        },
      }));
    } catch (error) {
      console.error('Error fetching team activities:', error);
      throw error;
    }
  }

  async getOrganizations(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    subscriptionPlan: string;
    ownerId: string;
    memberCount: number;
  }>> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await this.supabase
        .from('organizations')
        .select(`
          *,
          team_members(count)
        `)
        .or(`owner_id.eq.${session.user.id},team_members.user_id.eq.${session.user.id}`)
        .order('name');

      if (error) throw error;

      return data.map(org => ({
        id: org.id,
        name: org.name,
        description: org.description,
        subscriptionPlan: org.subscription_plan,
        ownerId: org.owner_id,
        memberCount: org.team_members?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  }

  async createOrganization(
    name: string,
    description?: string
  ): Promise<{
    id: string;
    name: string;
    description: string;
    subscriptionPlan: string;
  }> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await this.supabase
        .from('organizations')
        .insert({
          name,
          description: description || '',
          owner_id: session.user.id,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Add the creator as the owner team member
      await this.supabase
        .from('team_members')
        .insert({
          organization_id: data.id,
          user_id: session.user.id,
          role: 'owner',
          status: 'active',
        });

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        subscriptionPlan: data.subscription_plan,
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }
}

export const teamService = new TeamService();
