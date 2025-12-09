
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearVaultData() {
    console.log('Clearing Vault data...');

    // Clear vault_items
    const { error: vaultError } = await supabase
        .from('vault_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (vaultError) {
        console.error('Error clearing vault_items:', vaultError);
    } else {
        console.log('Successfully cleared vault_items table.');
    }

    // Clear password_items
    const { error: passwordError } = await supabase
        .from('password_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (passwordError) {
        console.error('Error clearing password_items:', passwordError);
    } else {
        console.log('Successfully cleared password_items table.');
    }
}

clearVaultData();
