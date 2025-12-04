import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FTU_FRAMEWORK } from '@/lib/seed';
import { Compass } from 'lucide-react';

const Explorer = () => {
  const [searchParams] = useSearchParams();
  const ftuParam = searchParams.get('ftu');

  // Parse FTU code (e.g., "F7.T5" or "F7.T5.U3")
  const parsedFTU = ftuParam ? parseFTU(ftuParam) : null;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">FTU Explorer</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Navigate the I❤️CEO v1.2 Framework: Focus → Topic → Unit
          </p>
        </div>

        {parsedFTU && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Deep Link</CardTitle>
              <CardDescription>You've navigated to a specific FTU location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="gradient-ceo text-primary">Focus</Badge>
                  <span className="font-semibold">{parsedFTU.focus?.code} • {parsedFTU.focus?.title}</span>
                </div>
                {parsedFTU.topic && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Topic</Badge>
                    <span>{parsedFTU.topic.code} • {parsedFTU.topic.title}</span>
                  </div>
                )}
                {parsedFTU.unit && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Unit</Badge>
                    <span>{parsedFTU.unit}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>FTU Matrix</CardTitle>
            <CardDescription>10 Focuses × 10 Topics = 100 core areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {FTU_FRAMEWORK.map((focus) => (
                <div key={focus.code} className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3">{focus.code} • {focus.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {focus.topics.map((topic) => (
                      <div
                        key={topic.code}
                        className={`p-2 rounded border text-sm ${
                          ftuParam === `${focus.code}.${topic.code}`
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/70'
                        }`}
                      >
                        <div className="font-medium">{topic.code}</div>
                        <div className="text-xs opacity-90">{topic.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function parseFTU(ftuCode: string) {
  const parts = ftuCode.split('.');
  if (parts.length < 2) return null;

  const focusCode = parts[0];
  const topicCode = parts[1];
  const unitCode = parts[2] || null;

  const focus = FTU_FRAMEWORK.find(f => f.code === focusCode);
  if (!focus) return null;

  const topic = focus.topics.find(t => t.code === topicCode);

  return {
    focus,
    topic,
    unit: unitCode
  };
}

export default Explorer;
