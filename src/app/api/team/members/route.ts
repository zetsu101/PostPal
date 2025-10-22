import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's organizations and team members
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        subscription_plan,
        team_members!inner(
          id,
          role,
          status,
          joined_at,
          last_active,
          permissions,
          user_id,
          departments(
            id,
            name,
            description,
            color
          ),
          users(
            id,
            name,
            email,
            avatar_url
          )
        )
      `)
      .or(`owner_id.eq.${user.id},team_members.user_id.eq.${user.id}`);

    if (orgError) {
      console.error('Error fetching organizations:', orgError);
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }

    // Flatten the team members data
    const teamMembers = organizations?.flatMap(org => 
      org.team_members?.map(member => ({
        ...member,
        organization: {
          id: org.id,
          name: org.name,
          subscription_plan: org.subscription_plan
        }
      })) || []
    ) || [];

    return NextResponse.json({ teamMembers }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/team/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, email, role, departmentId } = body;

    if (!organizationId || !email || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: organizationId, email, role' 
      }, { status: 400 });
    }

    // Check if user has permission to invite members (owner or admin)
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !teamMember || !['owner', 'admin'].includes(teamMember.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to invite team members' 
      }, { status: 403 });
    }

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userError);
      return NextResponse.json({ error: 'Failed to check existing user' }, { status: 500 });
    }

    let userId = existingUser?.id;

    // If user doesn't exist, create them
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          name: email.split('@')[0], // Use email prefix as default name
          subscription_plan: 'free'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userId = newUser.id;
    }

    // Check if user is already a team member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('team_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return NextResponse.json({ 
        error: 'User is already a member of this organization' 
      }, { status: 400 });
    }

    // Add user to team
    const { data: newMember, error: addError } = await supabase
      .from('team_members')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role,
        department_id: departmentId || null,
        status: 'active'
      })
      .select(`
        id,
        role,
        status,
        joined_at,
        departments(
          id,
          name,
          description,
          color
        ),
        users(
          id,
          name,
          email,
          avatar_url
        )
      `)
      .single();

    if (addError) {
      console.error('Error adding team member:', addError);
      return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
    }

    // Log team activity
    await supabase
      .from('team_activities')
      .insert({
        organization_id: organizationId,
        team_member_id: newMember.id,
        action: 'invited_team_member',
        target_type: 'user',
        target_id: userId,
        details: {
          email,
          role,
          department_id: departmentId
        }
      });

    return NextResponse.json({ teamMember: newMember }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/team/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { memberId, role, status, departmentId } = body;

    if (!memberId) {
      return NextResponse.json({ 
        error: 'Missing required field: memberId' 
      }, { status: 400 });
    }

    // Get the team member to check permissions
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select(`
        id,
        organization_id,
        role,
        user_id
      `)
      .eq('id', memberId)
      .single();

    if (memberError || !teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Check if current user has permission to update this member
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', teamMember.organization_id)
      .single();

    const isOwner = organization?.owner_id === user.id;
    
    // Check if current user is admin in this organization
    const { data: currentUserMember, error: currentUserError } = await supabase
      .from('team_members')
      .select('role')
      .eq('organization_id', teamMember.organization_id)
      .eq('user_id', user.id)
      .single();

    const isAdmin = currentUserMember && ['owner', 'admin'].includes(currentUserMember.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to update team member' 
      }, { status: 403 });
    }

    // Update the team member
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (departmentId !== undefined) updateData.department_id = departmentId;

    const { data: updatedMember, error: updateError } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', memberId)
      .select(`
        id,
        role,
        status,
        departments(
          id,
          name,
          description,
          color
        ),
        users(
          id,
          name,
          email,
          avatar_url
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating team member:', updateError);
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }

    // Log team activity
    await supabase
      .from('team_activities')
      .insert({
        organization_id: teamMember.organization_id,
        team_member_id: memberId,
        action: 'updated_team_member',
        target_type: 'user',
        target_id: teamMember.user_id,
        details: updateData
      });

    return NextResponse.json({ teamMember: updatedMember }, { status: 200 });

  } catch (error) {
    console.error('Error in PUT /api/team/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: memberId' 
      }, { status: 400 });
    }

    // Get the team member to check permissions
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select(`
        id,
        organization_id,
        user_id
      `)
      .eq('id', memberId)
      .single();

    if (memberError || !teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Check if current user is the organization owner or the member themselves
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', teamMember.organization_id)
      .single();

    const isOwner = organization?.owner_id === user.id;
    const isSelf = teamMember.user_id === user.id;

    if (!isOwner && !isSelf) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to remove team member' 
      }, { status: 403 });
    }

    // Remove the team member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('Error removing team member:', deleteError);
      return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
    }

    // Log team activity
    await supabase
      .from('team_activities')
      .insert({
        organization_id: teamMember.organization_id,
        team_member_id: memberId,
        action: 'removed_team_member',
        target_type: 'user',
        target_id: teamMember.user_id,
        details: { removed_by: user.id }
      });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error in DELETE /api/team/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
