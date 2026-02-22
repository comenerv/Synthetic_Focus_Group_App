import React from 'react';
import { FocusGroupReport } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, ThumbsUp, ThumbsDown, HelpCircle, MapPin, Briefcase, DollarSign } from 'lucide-react';

interface DashboardProps {
  report: FocusGroupReport;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function Dashboard({ report }: DashboardProps) {
  const pieData = [
    { name: 'Apply', value: report.verdicts.apply },
    { name: 'On the Fence', value: report.verdicts.fence },
    { name: 'Hard No', value: report.verdicts.reject },
  ];

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Apply': return <ThumbsUp className="w-5 h-5 text-emerald-500" />;
      case 'Hard No': return <ThumbsDown className="w-5 h-5 text-red-500" />;
      default: return <HelpCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Apply': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Hard No': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Executive Summary */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Executive Summary</h2>
        <p className="text-slate-600 leading-relaxed">{report.executiveSummary}</p>
        
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider mb-2">Evolution of Sentiment</h3>
          <p className="text-slate-600 italic">"{report.sentimentEvolution}"</p>
        </div>
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verdicts Pie Chart */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-1 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Final Verdicts</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Feature Sentiment Bar Chart */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Feature Sentiment Analysis</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.featureSentiments} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="feature" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="positive" name="Positive" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#F59E0B" />
                <Bar dataKey="negative" name="Negative" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Persona Grid */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Persona Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {report.personas.map((persona, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {persona.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-2 ${getVerdictBadge(persona.verdict)}`}>
                    {persona.verdict}
                  </span>
                </div>
                {getVerdictIcon(persona.verdict)}
              </div>
              
              <div className="space-y-2 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{persona.occupation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{persona.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{persona.income}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-900 mb-1">Reasoning:</p>
                <p className="text-sm text-slate-600 mb-3">{persona.reason}</p>
                <div className="bg-slate-50 rounded-lg p-3 relative">
                  <span className="text-2xl text-slate-300 absolute top-1 left-2 font-serif">"</span>
                  <p className="text-sm text-slate-700 italic relative z-10 pl-4">{persona.quote}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="bg-slate-900 rounded-2xl shadow-sm p-6 text-white">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="text-amber-400">â¡</span> Missed Opportunities & Recommendations
        </h2>
        <ul className="space-y-3">
          {report.missedOpportunities.map((opp, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <span className="text-slate-300 leading-relaxed">{opp}</span>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
