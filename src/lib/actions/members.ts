'use server';

import db from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

export async function getMembers() {
  await requireAuth();
  
  try {
    const allMembers = await db.select().from(members).orderBy(members.name);
    return { success: true, data: allMembers };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}

export async function getMemberById(id: string) {
  await requireAuth();
  
  try {
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, id))
      .limit(1);
    
    if (!member) {
      return { success: false, error: 'Member not found' };
    }
    
    return { success: true, data: member };
  } catch (error) {
    console.error('Error fetching member:', error);
    return { success: false, error: 'Failed to fetch member' };
  }
}

export async function createMember(formData: FormData) {
  await requireAuth();
  
  try {
    const name = formData.get('name') as string;
    
    if (!name) {
      return { success: false, error: 'Missing required fields' };
    }
    
    const [newMember] = await db
      .insert(members)
      .values({
        name,
      })
      .returning();
    
    return { success: true, data: newMember };
  } catch (error) {
    console.error('Error creating member:', error);
    return { success: false, error: 'Failed to create member' };
  }
}

export async function updateMember(id: string, formData: FormData) {
  await requireAuth();
  
  try {
    const name = formData.get('name') as string;
    
    const [updatedMember] = await db
      .update(members)
      .set({
        ...(name && { name }),
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();
    
    if (!updatedMember) {
      return { success: false, error: 'Member not found' };
    }
    
    return { success: true, data: updatedMember };
  } catch (error) {
    console.error('Error updating member:', error);
    return { success: false, error: 'Failed to update member' };
  }
}

export async function deleteMember(id: string) {
  await requireAuth();
  
  try {
    const [deletedMember] = await db
      .delete(members)
      .where(eq(members.id, id))
      .returning();
    
    if (!deletedMember) {
      return { success: false, error: 'Member not found' };
    }
    
    return { success: true, message: 'Member deleted successfully' };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}
