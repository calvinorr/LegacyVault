import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ApplicationSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Application preferences and configurations will be available here.
        </p>
      </CardContent>
    </Card>
  );
};

export default ApplicationSettings;
