import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Review = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Review</h1>
          <p className="text-muted-foreground text-lg">Weekly, Monthly & Quarterly reviews</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Review Board</CardTitle>
            <CardDescription>Track progress and make strategic decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-12">
              Review feature coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Review;
