
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user?: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.length > 0 ? activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                  {activity.user?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                  {activity.priority && (
                    <Badge className={`text-xs ${priorityColors[activity.priority]}`}>
                      {activity.priority}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          )) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
