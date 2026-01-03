'use server'

// This import will now work because we exported 'createClient' above
import { getSupabaseServerClient as createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function bulkAssignLeads(leadIds: string[], agentId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('retention_cases')
      .update({ 
        assigned_agent_id: agentId,
        updated_at: new Date().toISOString()
      })
      .in('id', leadIds)

    if (error) throw error
    
    revalidatePath('/manager/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}