import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Copy, ExternalLink } from 'lucide-react';
import { FTU_FRAMEWORK, generateTopicScore, generateSparklineData } from '@/lib/seed';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

interface TopicWithScore {
  focusCode: string;
  focusTitle: string;
  topicCode: string;
  topicTitle: string;
  ftuCode: string;
  score: number;
  sparkline: number[];
  deltaWoW: number;
}

export function FocusSpotlight() {
  const [allTopics, setAllTopics] = useState<TopicWithScore[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Generate all topics with scores and momentum
    const topics: TopicWithScore[] = [];
    
    FTU_FRAMEWORK.forEach(focus => {
      focus.topics.forEach(topic => {
        const ftuCode = `${focus.code}.${topic.code}`;
        const sparkline = generateSparklineData(ftuCode);
        const currentScore = sparkline[sparkline.length - 1];
        const prevScore = sparkline[sparkline.length - 2];
        const deltaWoW = currentScore - prevScore;
        
        topics.push({
          focusCode: focus.code,
          focusTitle: focus.title,
          topicCode: topic.code,
          topicTitle: topic.title,
          ftuCode,
          score: currentScore,
          sparkline,
          deltaWoW,
        });
      });
    });

    // Sort by momentum (deltaWoW descending), then by focus index
    topics.sort((a, b) => {
      if (Math.abs(b.deltaWoW - a.deltaWoW) < 0.01) {
        return a.ftuCode.localeCompare(b.ftuCode);
      }
      return b.deltaWoW - a.deltaWoW;
    });

    setAllTopics(topics);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond if card is focused or a descendant is focused
      if (!cardRef.current?.contains(document.activeElement)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : allTopics.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => (prev < allTopics.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpenExplorer();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopyId();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allTopics, currentIndex]);

  if (allTopics.length === 0) return null;

  const current = allTopics[currentIndex];

  const handleCopyId = () => {
    navigator.clipboard.writeText(current.ftuCode);
    toast.success(`Copied ${current.ftuCode} to clipboard`);
  };

  const handleOpenExplorer = () => {
    // Navigate to explorer with FTU deep link
    navigate(`/explorer?ftu=${current.ftuCode}`);
  };

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5 backdrop-blur-sm shadow-xl animate-fade-in"
      role="group"
      tabIndex={0}
      aria-label="Focus Spotlight - Use arrow keys to navigate, Enter to open, C to copy"
    >
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Content */}
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Focus Spotlight
              </h3>
              <Badge variant="secondary" className="text-xs font-medium">
                {currentIndex + 1} / {allTopics.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Tracking highest momentum topics</p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : allTopics.length - 1))}
              className="h-8 w-8 hover-scale"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentIndex(prev => (prev < allTopics.length - 1 ? prev + 1 : 0))}
              className="h-8 w-8 hover-scale"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Focus Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-primary">{current.focusCode}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-medium">{current.focusTitle}</span>
        </div>

        {/* Main Content Card */}
        <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-4 hover-scale transition-all duration-300">
          {/* Topic Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <h4 className="text-xl font-bold">{current.topicTitle}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {current.topicCode}
                </Badge>
                <code className="text-xs text-muted-foreground font-mono">{current.ftuCode}</code>
              </div>
            </div>
            
            {/* Score Display */}
            <div className="text-right space-y-1">
              <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                {current.score}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                current.deltaWoW >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {current.deltaWoW >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {current.deltaWoW >= 0 ? '+' : ''}{current.deltaWoW.toFixed(1)} WoW
              </div>
            </div>
          </div>

          {/* Sparkline Chart */}
          <div className="space-y-2">
            <div className="h-24 relative">
              <svg width="100%" height="100%" className="overflow-visible">
                <defs>
                  <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {(() => {
                  const points = current.sparkline;
                  const max = Math.max(...points);
                  const min = Math.min(...points);
                  const range = max - min || 1;
                  const width = 100;
                  const height = 100;
                  const padding = 10;
                  const step = (width - padding * 2) / (points.length - 1);

                  const pathData = points.map((val, i) => {
                    const x = padding + i * step;
                    const y = padding + (height - padding * 2) - ((val - min) / range) * (height - padding * 2);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');

                  const areaData = `${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

                  return (
                    <>
                      <path
                        d={areaData}
                        fill="url(#sparkline-gradient)"
                        vectorEffect="non-scaling-stroke"
                      />
                      <path
                        d={pathData}
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        filter="url(#glow)"
                      />
                      {points.map((val, i) => {
                        const x = `${padding + i * step}%`;
                        const y = `${(padding + (height - padding * 2) - ((val - min) / range) * (height - padding * 2)) / height * 100}%`;
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r={i === points.length - 1 ? "4" : "3"}
                            fill="hsl(var(--primary))"
                            className={i === points.length - 1 ? "animate-pulse" : ""}
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8 weeks ago</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleOpenExplorer} 
            className="flex-1 gap-2 hover-scale"
            size="lg"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Explorer
          </Button>
          <Button 
            onClick={handleCopyId} 
            variant="outline" 
            size="lg"
            className="gap-2 hover-scale"
          >
            <Copy className="h-4 w-4" />
            Copy ID
          </Button>
        </div>

        {/* Keyboard Hints */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-background border rounded text-xs">←</kbd>
            <kbd className="px-2 py-0.5 bg-background border rounded text-xs">→</kbd>
            Navigate
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-background border rounded text-xs">Enter</kbd>
            Open
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-background border rounded text-xs">C</kbd>
            Copy
          </span>
        </div>
      </div>
    </div>
  );
}
