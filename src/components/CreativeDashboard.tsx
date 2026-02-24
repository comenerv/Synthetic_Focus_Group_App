import React from 'react';
import { CreativeComparisonReport } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, ThumbsUp, ThumbsDown, Star, Quote, MessageSquare } from 'lucide-react';

interface Props {
  report: CreativeComparisonReport;
  imageA: string;
  imageB: string;
}

export default function CreativeDashboard({ report, imageA, imageB }: Props) {
  const preferenceData = [
    { name: 'Creative A', count: report.personaPreferences.filter(p => p.preferredCreative === 'Creative A').length },
    { name: 'Creative B', count: report.personaPreferences.filter(p => p.preferredCreative === 'Creative B').length },
    { name: 'None', count: report.personaPreferences.filter(p => p.preferredCreative === 'None').length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overall Winner Banner */}
      <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-lg flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-300" />
            <span className="text-emerald-100 font-semibold uppercase tracking-wider text-sm">Overall Winner</span>
          </div>
          <h2 className="text-4xl font-black mb-4">{report.overallWinner}</h2>
          <p className="text-emerald-50 max-w-2xl text-lg leading-relaxed">
            {report.summary}
          </p>
        </div>
        <Trophy className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-emerald-500/20 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Creative A Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="aspect-video bg-slate-100 relative">
            <img src={imageA} alt="Creative A" className="w-full h-full object-contain" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
              Creative A
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-lg">Appeal Score</span>
              </div>
              <span className="text-3xl font-black text-slate-900">{report.creativeAAnalysis.appealScore}/10</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Strengths
                </h4>
                <ul className="space-y-2">
                  {report.creativeAAnalysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> Weaknesses
                </h4>
                <ul className="space-y-2">
                  {report.creativeAAnalysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-400 mt-2 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Creative B Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="aspect-video bg-slate-100 relative">
            <img src={imageB} alt="Creative B" className="w-full h-full object-contain" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
              Creative B
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-lg">Appeal Score</span>
              </div>
              <span className="text-3xl font-black text-slate-900">{report.creativeBAnalysis.appealScore}/10</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Strengths
                </h4>
                <ul className="space-y-2">
                  {report.creativeBAnalysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> Weaknesses
                </h4>
                <ul className="space-y-2">
                  {report.creativeBAnalysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-400 mt-2 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preference Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-slate-400" />
          Persona Preference Distribution
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={preferenceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {preferenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Creative A' ? '#10b981' : entry.name === 'Creative B' ? '#6366f1' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Persona Feedbacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {report.personaPreferences.map((pref, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900">{pref.personaName}</h4>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  pref.preferredCreative === 'Creative A' ? 'bg-emerald-100 text-emerald-700' :
                  pref.preferredCreative === 'Creative B' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  Prefers {pref.preferredCreative}
                </span>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  pref.wouldApply ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {pref.wouldApply ? 'Would Apply' : 'Would Not Apply'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4 flex-1">
              {pref.reasoning}
            </p>
            <div className="bg-slate-50 rounded-xl p-3 relative">
              <Quote className="w-4 h-4 text-slate-200 absolute top-2 left-2" />
              <p className="text-xs italic text-slate-500 pl-4">
                "{pref.quote}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Strategic Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
