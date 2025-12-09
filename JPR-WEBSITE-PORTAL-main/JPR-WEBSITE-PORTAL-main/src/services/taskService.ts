import { supabase } from '@/lib/supabase';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    focus?: string;
    topic?: string;
    unit?: string;
    due_date?: string;
    user_id: string;
    priority?: string;
    created_at: string;
}

export async function getMyTasks() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id) // Ensure we only get own tasks (RLS does this too, but good form)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
    return data as Task[];
}

export async function createTask(payload: {
    title: string;
    description?: string;
    focus?: string;
    topic?: string;
    unit?: string;
    due_date?: string;
    status?: string;
}) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            ...payload,
            user_id: session.user.id, // Explicitly set user_id
            status: payload.status || 'todo'
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error creating task:', error);
        throw error;
    }
    return data;
}

export async function updateTaskStatus(id: string, status: string) {
    const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();

    if (error) {
        console.error('Error updating task:', error);
        throw error;
    }
    return data;
}

export async function deleteTask(id: string) {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
