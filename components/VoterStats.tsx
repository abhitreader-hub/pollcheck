import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, UserCheck, UserX, Activity, BarChart2, PieChart as PieIcon, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { getVoterStats, VoterStatsResponse } from '../services/voters';

const GENDER_COLORS: Record<string, string> = {
  'Male': '#3B82F6',
  'Female': '#EC4899',
  'Other': '#8B5CF6',
  'UNREADABLE': '#9CA3AF'
};

const AGE_COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#F97316'];

interface VoterStatsDashboardProps {
  refreshKey?: number;
}

export const VoterStatsDashboard: React.FC<VoterStatsDashboardProps> = ({ refreshKey = 0 }) => {
  const [stats, setStats] = useState<VoterStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await getVoterStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Refresh stats when refreshKey changes (without showing loading spinner)
  useEffect(() => {
    if (refreshKey > 0) {
      fetchStats(false);
    }
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // Prepare gender data for pie chart
  const genderData = Object.entries(stats.byGender).map(([gender, count]) => ({
    name: gender,
    value: count,
    color: GENDER_COLORS[gender] || '#9CA3AF'
  }));

  // Prepare age data for bar chart
  const ageData = stats.byAgeGroup.map((ag, i) => ({
    range: ag.range,
    count: ag.count,
    color: AGE_COLORS[i % AGE_COLORS.length]
  }));

  const maleCount = stats.byGender['Male'] || 0;
  const femaleCount = stats.byGender['Female'] || 0;
  const votingPercentage = typeof stats.votingPercentage === 'string' 
    ? parseFloat(stats.votingPercentage) 
    : stats.votingPercentage;

  return (
    <div className="space-y-6 mb-8">
      {/* Voting Progress Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <span className="p-2 bg-white/10 rounded-lg">📊</span>
              Voting Progress
            </h2>
            <p className="text-indigo-100 text-sm ml-11">Track real-time voting status</p>
          </div>
          
          <div className="flex items-center gap-6 md:gap-10">
            <div className="text-center group">
              <div className="flex items-center gap-2 mb-1 transition-transform group-hover:scale-105">
                <div className="p-1.5 bg-green-400/20 rounded-full">
                  <CheckCircle2 size={18} className="text-green-300" />
                </div>
                <span className="text-3xl font-bold">{stats.voted?.toLocaleString() || 0}</span>
              </div>
              <p className="text-xs text-indigo-200 font-medium tracking-wide">VOTED</p>
            </div>
            
            <div className="text-center group">
              <div className="flex items-center gap-2 mb-1 transition-transform group-hover:scale-105">
                <div className="p-1.5 bg-amber-400/20 rounded-full">
                  <Clock size={18} className="text-amber-300" />
                </div>
                <span className="text-3xl font-bold">{stats.notVoted?.toLocaleString() || stats.total}</span>
              </div>
              <p className="text-xs text-indigo-200 font-medium tracking-wide">PENDING</p>
            </div>
            
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(votingPercentage / 100) * 264} 264`}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{votingPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative mt-6">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full transition-all duration-700 relative"
              style={{ width: `${votingPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-indigo-200/80 font-medium">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Top Row: Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Voters */}
        <div className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 hover:-translate-y-0.5">
          <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Voters</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</h3>
          </div>
        </div>

        {/* Male Count */}
        <div className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-lg hover:border-blue-100 transition-all duration-300 hover:-translate-y-0.5">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Male Voters</p>
            <h3 className="text-2xl font-bold text-gray-900">{maleCount.toLocaleString()}</h3>
          </div>
        </div>

        {/* Female Count */}
        <div className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-lg hover:border-pink-100 transition-all duration-300 hover:-translate-y-0.5">
          <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl text-pink-600 group-hover:scale-110 transition-transform">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Female Voters</p>
            <h3 className="text-2xl font-bold text-gray-900">{femaleCount.toLocaleString()}</h3>
          </div>
        </div>

        {/* Gender Distribution Pie */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-2 mb-2">
              <Activity size={16} className="text-purple-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender Ratio</span>
          </div>
          <div className="h-24 w-full flex items-center justify-between">
              <div className="text-sm space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm"></span>
                  <span className="text-gray-600 font-medium">{((maleCount / stats.total) * 100).toFixed(1)}% M</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 shadow-sm"></span>
                  <span className="text-gray-600 font-medium">{((femaleCount / stats.total) * 100).toFixed(1)}% F</span>
                </div>
              </div>
              <div className="h-full w-24">
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={35}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                  </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>
        </div>
      </div>

      {/* Second Row: Detailed Analytics Section */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-semibold text-gray-800">Analytics Dashboard</h2>
        <button
          onClick={fetchStats}
          className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <RefreshCw size={14} className="mr-1" />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <PieIcon size={18} className="text-indigo-500" />
              Gender Distribution
            </h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(stats.byGender).map(([gender, count]) => {
              const percentage = (count / stats.total) * 100;
              return (
                <div key={gender}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-medium text-gray-700 capitalize flex items-center gap-2">
                      {gender}
                      <span className="text-xs font-normal text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        {count.toLocaleString()} voters
                      </span>
                    </span>
                    <span className="text-lg font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: GENDER_COLORS[gender] || '#9CA3AF'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Age Distribution Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-500" />
              Age Distribution
            </h3>
          </div>
          
          <div className="flex-1 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={ageData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="range" 
                  tick={{fontSize: 11, fill: '#6B7280'}} 
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{fontSize: 12, fill: '#6B7280'}} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs z-50">
                          <p className="font-bold text-gray-800 mb-1">Age: {data.range}</p>
                          <p className="text-indigo-600 font-semibold">{data.count.toLocaleString()} voters</p>
                          <p className="text-gray-500">{((data.count / stats.total) * 100).toFixed(1)}% of total</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};