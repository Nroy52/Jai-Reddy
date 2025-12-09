import { supabase } from '@/lib/supabase';

// Define Interface for KPI Data (adjust fields as needed based on exact JSON structure)
export interface DashboardData {
    netWorthToday: number | null;
    activeObjectives: number;
    focusScores: FocusScore[];
}

export interface FocusScoreMeta {
    net_worth?: number;
    active_objectives?: number;
    [key: string]: unknown;
}

export interface FocusScore {
    id?: string;
    date?: string;
    focus?: string;
    score?: number;
    meta?: FocusScoreMeta;
}

export async function getTodayDashboard(): Promise<DashboardData> {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
        .from<FocusScore>('kpi_focus_scores')
        .select('*')
        .eq('date', today);

    if (error) {
        console.error('Error fetching dashboard data:', error);
        // Return empty fallback instead of crashing
        return { netWorthToday: null, activeObjectives: 0, focusScores: [] };
    }

    const focusScores = data ?? [];

    // F6 is typically Financial or Net Worth related in this KPI system
    const f6 = focusScores.find(r => r.focus === 'F6');
    const netWorthToday = f6?.meta?.net_worth ?? null;
    const activeObjectives = f6?.meta?.active_objectives ?? 0;

    return { netWorthToday, activeObjectives, focusScores };
}
