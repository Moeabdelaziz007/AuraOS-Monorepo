import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Zap,
  Settings,
  Plus
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  trendValue: string;
  description: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  description,
  className = ""
}) => (
  <Card className={`relative overflow-hidden ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="text-muted-foreground">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        {trend === 'up' ? (
          <TrendingUp className="h-3 w-3 text-green-500" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-500" />
        )}
        <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
          {trendValue}
        </span>
        <span>{description}</span>
      </div>
    </CardContent>
  </Card>
);

interface RecentActivityItem {
  id: string;
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const Dashboard: React.FC = () => {
  const recentActivity: RecentActivityItem[] = [
    {
      id: '1',
      action: 'Workflow "Data Processing" completed successfully',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      action: 'New project "AI Model Training" created',
      timestamp: '15 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      action: 'System backup completed',
      timestamp: '1 hour ago',
      status: 'success'
    },
    {
      id: '4',
      action: 'High CPU usage detected',
      timestamp: '2 hours ago',
      status: 'warning'
    },
    {
      id: '5',
      action: 'Database connection failed',
      timestamp: '3 hours ago',
      status: 'error'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'new-project',
      label: 'New Project',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => logger.info('New Project clicked')
    },
    {
      id: 'run-workflow',
      label: 'Run Workflow',
      icon: <Zap className="h-4 w-4" />,
      onClick: () => logger.info('Run Workflow clicked')
    },
    {
      id: 'system-settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => logger.info('Settings clicked')
    },
    {
      id: 'view-logs',
      label: 'View Logs',
      icon: <Activity className="h-4 w-4" />,
      onClick: () => logger.info('View Logs clicked')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AuraOS Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening with your system.
            </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="neon-cyan">
            <Activity className="h-3 w-3 mr-1" />
            System Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value="24"
          icon={<HardDrive className="h-4 w-4" />}
          trend="up"
          trendValue="+12%"
          description="from last month"
          className="neon-cyan"
        />
        <StatCard
          title="Active Workflows"
          value="8"
          icon={<Zap className="h-4 w-4" />}
          trend="up"
          trendValue="+3"
          description="running now"
          className="neon-purple"
        />
        <StatCard
          title="CPU Usage"
          value="45%"
          icon={<Cpu className="h-4 w-4" />}
          trend="down"
          trendValue="-5%"
          description="from last hour"
          className="neon-green"
        />
        <StatCard
          title="Memory Usage"
          value="2.1 GB"
          icon={<MemoryStick className="h-4 w-4" />}
          trend="up"
          trendValue="+0.2 GB"
          description="of 8 GB total"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest system events and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(item.status)}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.action}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="justify-start h-auto p-4 hover:neon-cyan"
                  onClick={action.onClick}
                >
                  <div className="flex items-center space-x-3">
                    {action.icon}
                    <span>{action.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
