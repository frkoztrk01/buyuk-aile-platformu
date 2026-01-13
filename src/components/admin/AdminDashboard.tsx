'use client';

import { useState, useEffect } from 'react';
import { Users, Newspaper, Calendar, MessageSquare, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function SummaryCard({ title, value, icon: Icon, trend }: SummaryCardProps) {
  return (
    <div className="bg-white border border-black/10 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-[#1E3A5F]">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span className="text-xs font-bold font-montserrat">
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-600 font-montserrat mb-2">
          {title}
        </p>
        <p className="text-4xl font-black text-[#1E3A5F] font-montserrat">
          {value.toLocaleString('tr-TR')}
        </p>
      </div>
    </div>
  );
}

interface RecentActivity {
  id: string;
  type: 'news' | 'member' | 'event' | 'message';
  title: string;
  date: string;
  status?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    latestNews: 0,
    upcomingEvents: 0,
    newMessages: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [newsRes, membersRes, messagesRes] = await Promise.all([
        fetch('/api/admin/news'),
        fetch('/api/admin/members'),
        fetch('/api/admin/messages').catch(() => null), // Messages API might not exist yet
      ]);

      const news = newsRes.ok ? await newsRes.json() : [];
      const members = membersRes.ok ? await membersRes.json() : [];
      const messages = messagesRes?.ok ? await messagesRes.json() : [];

      // Calculate stats
      setStats({
        totalMembers: members.length,
        latestNews: news.filter((n: any) => n.isPublished).length,
        upcomingEvents: 0, // TODO: Implement meetings API
        newMessages: messages.length || 0,
      });

      // Create recent activities from latest news
      const recentNews = news
        .slice(0, 5)
        .map((item: any) => ({
          id: item.id,
          type: 'news' as const,
          title: item.title,
          date: new Date(item.date).toISOString().split('T')[0],
          status: item.isPublished ? 'Yayında' : 'Taslak',
        }));

      setRecentActivities(recentNews);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'news':
        return Newspaper;
      case 'member':
        return Users;
      case 'event':
        return Calendar;
      case 'message':
        return MessageSquare;
      default:
        return Newspaper;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'news':
        return 'text-blue-600';
      case 'member':
        return 'text-green-600';
      case 'event':
        return 'text-purple-600';
      case 'message':
        return 'text-[#1E3A5F]';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
          DASHBOARD
        </h1>
        <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
          GENEL BAKIŞ
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Toplam Üye"
          value={stats.totalMembers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <SummaryCard
          title="Son Haberler"
          value={stats.latestNews}
          icon={Newspaper}
          trend={{ value: 5, isPositive: true }}
        />
        <SummaryCard
          title="Yaklaşan Etkinlikler"
          value={stats.upcomingEvents}
          icon={Calendar}
        />
        <SummaryCard
          title="Yeni Mesajlar"
          value={stats.newMessages}
          icon={MessageSquare}
          trend={{ value: 8, isPositive: false }}
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-black/10">
        <div className="p-6 border-b border-black/10">
          <h2 className="text-lg font-black uppercase tracking-tight text-[#1E3A5F] font-montserrat">
            SON AKTİVİTELER
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat sticky left-0 bg-[#1E3A5F]">
                  TİP
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  BAŞLIK
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  TARİH
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  DURUM
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  İŞLEM
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const iconColor = getActivityColor(activity.type);
                const isEven = index % 2 === 0;
                
                return (
                  <tr
                    key={activity.id}
                    className={`border-b border-black/10 ${
                      isEven ? 'bg-white' : 'bg-[#F9F9F9]'
                    }`}
                  >
                    <td className="px-6 py-4 sticky left-0 bg-inherit">
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#1E3A5F] font-montserrat">
                        {activity.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 font-sans">
                        {activity.date}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 border border-gray-300 text-xs uppercase tracking-widest text-gray-600 font-montserrat">
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-blue-700 transition-none">
                          DÜZENLE
                        </button>
                        <button className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none">
                          SİL
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
