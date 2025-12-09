
import { supabase } from '@/lib/supabase';

export interface VaultItem {
    id: string;
    user_id: string;
    title: string;
    storage_path: string | null;
    file_size: number | null;
    file_type: string | null;
    created_at: string;
    // Support legacy fields
    value?: string;
    type?: string;
    tags?: string[];
    ftu_id?: string;
    sensitivity?: string;
}

export async function listVaultItems() {
    const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as VaultItem[]; // Cast for convenience
}

export async function uploadVaultFile(file: File, meta: { title: string; tags: string[]; ftuId: string; sensitivity: string }) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Not logged in');

    // Simple sanitization
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${Date.now()}-${cleanFileName}`;

    // 1. Upload to Storage
    const { data: storageData, error: storageError } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

    if (storageError) throw storageError;

    // 2. Insert Record
    const newItem = {
        user_id: userId,
        title: meta.title || file.name,
        storage_path: storageData.path,
        file_size: file.size,
        file_type: file.type,
        tags: meta.tags,
        ftu_id: meta.ftuId,
        sensitivity: meta.sensitivity,
        type: 'doc'
    };

    const { error: vaultError } = await supabase
        .from('vault_items')
        .insert(newItem);

    if (vaultError) {
        // Attempt cleanup if DB insert fails? May be overkill for MVP
        throw vaultError;
    }

    // Return a placeholder or the simplified item (we will re-fetch list anyway)
    return { ...newItem, id: 'temp', created_at: new Date().toISOString() } as unknown as VaultItem;
}

export async function getVaultFileUrl(storagePath: string) {
    // Create a signed URL valid for 60 seconds
    const { data, error } = await supabase.storage
        .from('vault')
        .createSignedUrl(storagePath, 60);

    if (error) throw error;
    return data.signedUrl;
}

export async function deleteVaultItem(id: string, storagePath?: string | null) {
    // 1. Delete from Storage if path exists
    if (storagePath) {
        const { error: storageError } = await supabase.storage
            .from('vault')
            .remove([storagePath]);

        if (storageError) {
            console.warn('Failed to delete storage file', storageError);
            // Continue to delete metadata
        }
    }

    // 2. Delete from DB
    const { error } = await supabase
        .from('vault_items')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
