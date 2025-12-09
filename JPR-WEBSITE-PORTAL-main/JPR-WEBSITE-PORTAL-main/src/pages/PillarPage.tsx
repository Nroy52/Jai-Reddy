import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ChevronRight,
    TrendingUp,
    Sparkles,
    Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CEO_DASHBOARD_DATA, Pillar, KPI } from '@/data/ceoDashboardData';
import { getStatusEmoji, calculateAggregateTrend } from '@/lib/utils';

const PillarPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pillar, setPillar] = useState<Pillar | null>(null);
    const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);

    useEffect(() => {
        if (id) {
            const foundPillar = CEO_DASHBOARD_DATA.find((p) => p.id === id);
            if (foundPillar) {
                setPillar(foundPillar);
            } else {
                navigate('/dashboard'); // Fallback if ID not found
            }
        }
    }, [id, navigate]);

    if (!pillar) return null;

    const pillarIndex = CEO_DASHBOARD_DATA.findIndex(p => p.id === pillar.id) + 1;
    const Icon = pillar.icon;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className={`p-3 rounded-full ${pillar.colorClass} bg-opacity-10 bg-current`}>
                        <Icon className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            F{pillarIndex}. {pillar.title} {getStatusEmoji(calculateAggregateTrend(pillar.kpis))}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            10 Key Performance Indicators (The 100 Layer)
                        </p>
                    </div>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {pillar.kpis.map((kpi, index) => (
                        <Card
                            key={kpi.id}
                            className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 border-none group cursor-pointer h-full ${pillar.gradientClass}`}
                            onClick={() => setSelectedKPI(kpi)}
                        >
                            <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full relative z-10">
                                <div className={`p-4 rounded-full bg-white/90 shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300 ${pillar.colorClass}`}>
                                    <span className="text-3xl" role="img" aria-label="status">
                                        {getStatusEmoji(kpi.trend)}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg leading-tight text-slate-800 dark:text-slate-100 mb-2">
                                    F{pillarIndex}.T{index + 1} {kpi.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-slate-700 dark:text-slate-200">
                                        {kpi.value}
                                    </span>
                                    {kpi.trend !== 'neutral' && (
                                        <Badge variant={kpi.trend === 'up' ? 'default' : 'destructive'} className="text-[10px] px-1.5 h-5">
                                            {kpi.trendValue}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click for Analytics
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* KPI Detail Modal (Drill-down) */}
            <Dialog open={!!selectedKPI} onOpenChange={(open) => !open && setSelectedKPI(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
                    {selectedKPI && (
                        <>
                            <DialogHeader className="p-6 border-b bg-white dark:bg-slate-950">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                        F{pillarIndex}.T{pillar.kpis.findIndex(k => k.id === selectedKPI.id) + 1} {selectedKPI.title} {getStatusEmoji(selectedKPI.trend)}
                                        <Badge variant="outline" className="ml-2 text-sm font-normal">
                                            Current: {selectedKPI.value}
                                        </Badge>
                                    </DialogTitle>
                                </div>
                                <DialogDescription>
                                    Detailed Analytics & Advisor Note (The 1000 Layer) {getStatusEmoji(selectedKPI.trend)}
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="flex-1 p-6">

                                {/* Advisor Note */}
                                <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 mb-6">
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg h-fit">
                                            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Royal Advisor's Note {getStatusEmoji(selectedKPI.trend)}</h4>
                                            <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                                                "{selectedKPI.advisorNote}"
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Datapoints Grid */}
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Supporting Analytics (10 Datapoints) {getStatusEmoji(selectedKPI.trend)}
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {selectedKPI.datapoints.map((dp) => (
                                        <div key={dp.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                <span className="font-mono font-bold text-slate-400 mr-2">
                                                    F{pillarIndex}.T{pillar.kpis.findIndex(k => k.id === selectedKPI.id) + 1}.U{selectedKPI.datapoints.findIndex(d => d.id === dp.id) + 1}
                                                </span>
                                                {dp.label}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-medium">{dp.value}</span>
                                                {dp.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                                {dp.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PillarPage;
