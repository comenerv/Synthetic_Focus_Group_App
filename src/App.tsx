import React, { useState, useRef } from 'react';
import { runSyntheticFocusGroup, runCreativeComparison } from './services/geminiService';
import { FocusGroupReport, PersonaDefinition, CreativeComparisonReport } from './types';
import Dashboard from './components/Dashboard';
import CreativeDashboard from './components/CreativeDashboard';
import { Loader2, Play, Settings2, CreditCard, Users, Trash2, Upload, Eye, X, Download, Info, UserPlus, Image as ImageIcon, LayoutDashboard } from 'lucide-react';
import { exportToWord } from './utils/exportWord';

const DEFAULT_PITCH = `
Welcome everyone to our consumer research panel. We are testing a new credit card designed specifically for Californians, called the 'Golden State Rewards Card'.

Here are the full terms of the offer:
- Annual Fee: $95 (Waived for the first year).
- Sign-up Bonus: $300 cash back after spending $1,000 in the first 3 months.
- Rewards Tiers: 
    * 4% Cash Back on Gas and EV Charging.
    * 3% Cash Back on Groceries and Farmers Markets.
    * 2% Cash Back on Dining and Food Delivery.
    * 1% Cash Back on everything else.
- APR: 19.99% - 28.99% Variable, based on creditworthiness.
- Special Perk: Annual $50 statement credit toward California State Parks passes.
- No foreign transaction fees.

Please discuss among yourselves:
1. What is your initial reaction to this card based on your lifestyle and income?
2. Does the $300 sign-up bonus and 1st-year fee waiver convince you to try it?
3. How do you feel about the APR and the specific reward categories?
4. Would you actually apply for this card today? If not, what is the exact dealbreaker?
`;

const DEFAULT_CREATIVE_CONTEXT = `
We are testing two different marketing posters (Creative A and Creative B) for the 'Golden State Rewards Card'.

Please discuss among yourselves:
1. What is your immediate emotional reaction to Creative A vs. Creative B?
2. Which poster communicates the value of the card more clearly to you?
3. Does either poster make you want to apply for the card today? 
4. If you had to choose one that resonates with your lifestyle, which is it and why? Or do neither appeal to you?
`;

const DEFAULT_PERSONAS: PersonaDefinition[] = [
  { name: "Maria", age: 42, occupation: "Agriculture Operations Manager", location: "Fresno, CA", income: "$85,000/year", personality: "Practical, budget-conscious, straightforward, family-oriented.", spending_habits: "Spends heavily on gas for her truck commuting to farms, and groceries for her family of four." },
  { name: "Carlos", age: 34, occupation: "Farm Field Supervisor", location: "Visalia, CA", income: "$55,000/year", personality: "Hardworking, skeptical of banks, relies on cash but wants to build credit.", spending_habits: "High gas spending, buys groceries at local markets, sends money to family. Worried about high interest rates." },
  { name: "Chloe", age: 20, occupation: "Marine Biology Student", location: "Santa Cruz, CA", income: "$12,000/year", personality: "Environmentally conscious, social, very budget-restricted.", spending_habits: "Rides a bike mostly. Spends on thrift stores, local coffee shops, and campus dining. Hates annual fees." },
  { name: "David", age: 22, occupation: "Business Student", location: "San Luis Obispo, CA", income: "$18,000/year", personality: "Ambitious, tech-savvy, impulsive, loves travel hacking.", spending_habits: "Spends on dining out, bars, and saving up for flights. Will pay an annual fee if the sign-up bonus is huge." },
  { name: "Sarah", age: 35, occupation: "Registered Nurse", location: "Bakersfield, CA", income: "$95,000/year", personality: "Exhausted but organized, values convenience and direct cash rewards.", spending_habits: "Long commute to the hospital, buys groceries in bulk at Costco, values cash back over travel points." },
  { name: "James", age: 55, occupation: "Boutique Hotel Owner", location: "Monterey, CA", income: "$150,000/year", personality: "Sophisticated, analytical, values premium perks and customer service.", spending_habits: "Spends heavily on business supplies, dining with clients, and travel. Doesn't mind annual fees if the perks justify it." },
  { name: "Elena", age: 29, occupation: "Remote Software Developer", location: "Merced, CA", income: "$110,000/year", personality: "Introverted, analytical, optimizes everything.", spending_habits: "Drives an EV. Spends heavily on online shopping, food delivery, and home improvement. Always pays balance in full." },
  { name: "Robert", age: 68, occupation: "Retired Teacher", location: "Paso Robles, CA", income: "$60,000/year", personality: "Cautious, enjoys local leisure, loyal to brands he trusts.", spending_habits: "Spends on local dining, wine tasting, and medical expenses. Pays off card monthly. Dislikes complicated reward tiers." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'campaign' | 'creative'>('campaign');
  const [campaignPitch, setCampaignPitch] = useState(DEFAULT_PITCH);
  const [creativeContext, setCreativeContext] = useState(DEFAULT_CREATIVE_CONTEXT);
  const [personas, setPersonas] = useState<PersonaDefinition[]>(DEFAULT_PERSONAS);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FocusGroupReport | null>(null);
  const [creativeReport, setCreativeReport] = useState<CreativeComparisonReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewPersona, setViewPersona] = useState<PersonaDefinition | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPersona, setNewPersona] = useState<Partial<PersonaDefinition>>({});
  
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageARef = useRef<HTMLInputElement>(null);
  const imageBRef = useRef<HTMLInputElement>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'campaign') {
        const result = await runSyntheticFocusGroup(campaignPitch, personas);
        setReport(result);
      } else {
        if (!imageA || !imageB) {
          throw new Error("Please upload both Creative A and Creative B posters.");
        }
        const result = await runCreativeComparison(creativeContext, personas, imageA, imageB);
        setCreativeReport(result);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (side === 'A') setImageA(base64);
      else setImageB(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePersona = (indexToDelete: number) => {
    setPersonas(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleCreatePersona = () => {
    if (!newPersona.name || !newPersona.occupation) {
      setError("Name and Occupation are required to create a persona.");
      return;
    }
    
    const personaToAdd: PersonaDefinition = {
      name: newPersona.name || "Unknown",
      age: newPersona.age || 30,
      occupation: newPersona.occupation || "Unknown",
      location: newPersona.location || "Unknown",
      income: newPersona.income || "Unknown",
      personality: newPersona.personality || "Unknown",
      spending_habits: newPersona.spending_habits || "Unknown"
    };
    
    setPersonas(prev => [...prev, personaToAdd]);
    setIsCreateModalOpen(false);
    setNewPersona({});
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Basic validation for PersonaDefinition
        if (json && typeof json === 'object') {
          const newPersona: PersonaDefinition = {
            name: json.name || json.fullName || "Unknown",
            age: json.age || 30,
            occupation: json.occupation || json.job || json.role || json.title || "Unknown",
            location: json.location || json.city || json.address || "Unknown",
            income: json.income || json.salary || json.revenue || "Unknown",
            personality: json.personality || json.traits || json.character || "Unknown",
            spending_habits: json.spending_habits || json.spendingHabits || json.habits || "Unknown"
          };
          setPersonas(prev => [...prev, newPersona]);
        } else {
          setError("Invalid persona JSON format.");
        }
      } catch (err) {
        setError("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Synthetic Focus Group
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {personas.length} Personas Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/50 rounded-xl w-fit mb-8">
          <button
            onClick={() => setActiveTab('campaign')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'campaign' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Campaign Testing
          </button>
          <button
            onClick={() => setActiveTab('creative')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'creative' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Creative Testing (v2)
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Personas Management Panel */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[550px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                Active Personas
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium rounded-lg hover:bg-emerald-100 focus:outline-none transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Create
                </button>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 focus:outline-none transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Load JSON
                </button>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Upload a JSON file to add a persona. The file should be an object with keys like <code className="font-mono bg-blue-100 px-1 rounded">name</code>, <code className="font-mono bg-blue-100 px-1 rounded">age</code>, <code className="font-mono bg-blue-100 px-1 rounded">occupation</code>, <code className="font-mono bg-blue-100 px-1 rounded">location</code>, <code className="font-mono bg-blue-100 px-1 rounded">income</code>, <code className="font-mono bg-blue-100 px-1 rounded">personality</code>, and <code className="font-mono bg-blue-100 px-1 rounded">spending_habits</code>.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {personas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No personas loaded.</p>
                </div>
              ) : (
                personas.map((persona, idx) => (
                  <div key={idx} className="group flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{persona.name}, {persona.age}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{persona.occupation} • {persona.location}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1" title={persona.spending_habits}>
                        <span className="font-medium">Habits:</span> {persona.spending_habits}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setViewPersona(persona)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Persona Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePersona(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove Persona"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Configuration Panel */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[550px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-slate-400" />
                {activeTab === 'campaign' ? 'Campaign Stimulus' : 'Creative Comparison'}
              </h2>
              <button
                onClick={handleRunSimulation}
                disabled={loading || (activeTab === 'campaign' ? !campaignPitch.trim() : !creativeContext.trim()) || personas.length === 0 || (activeTab === 'creative' && (!imageA || !imageB))}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run {activeTab === 'campaign' ? 'Focus Group' : 'Creative Test'}
                  </>
                )}
              </button>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              <div className={activeTab === 'campaign' ? 'flex-1' : 'h-32'}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {activeTab === 'campaign' ? 'Campaign Context' : 'Creative Context'}
                </label>
                <textarea
                  value={activeTab === 'campaign' ? campaignPitch : creativeContext}
                  onChange={(e) => activeTab === 'campaign' ? setCampaignPitch(e.target.value) : setCreativeContext(e.target.value)}
                  disabled={loading}
                  className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none disabled:opacity-50"
                  placeholder={activeTab === 'campaign' ? "Enter your credit card campaign pitch here..." : "Enter your creative testing questions here..."}
                />
              </div>

              {activeTab === 'creative' && (
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Creative A</label>
                    <div 
                      onClick={() => imageARef.current?.click()}
                      className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden relative group"
                    >
                      {imageA ? (
                        <>
                          <img src={imageA} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs font-bold">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                          <span className="text-xs text-slate-400 font-medium">Upload Poster A</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" ref={imageARef} onChange={(e) => handleImageUpload(e, 'A')} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Creative B</label>
                    <div 
                      onClick={() => imageBRef.current?.click()}
                      className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden relative group"
                    >
                      {imageB ? (
                        <>
                          <img src={imageB} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs font-bold">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                          <span className="text-xs text-slate-400 font-medium">Upload Poster B</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" ref={imageBRef} onChange={(e) => handleImageUpload(e, 'B')} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Results Dashboard */}
        {activeTab === 'campaign' && report && !loading && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Simulation Results</h2>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                  AI Generated
                </span>
              </div>
              <button
                onClick={() => exportToWord(report)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Report (.docx)
              </button>
            </div>
            <Dashboard report={report} />
          </div>
        )}

        {activeTab === 'creative' && creativeReport && !loading && imageA && imageB && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Creative Comparison Results</h2>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium border border-indigo-200">
                  Visual AI Analysis
                </span>
              </div>
            </div>
            <CreativeDashboard report={creativeReport} imageA={imageA} imageB={imageB} />
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'campaign' && !report) || (activeTab === 'creative' && !creativeReport)) && !loading && !error && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
              {activeTab === 'campaign' ? <CreditCard className="w-8 h-8 text-slate-400" /> : <ImageIcon className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Ready to test your {activeTab === 'campaign' ? 'campaign' : 'creatives'}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {activeTab === 'campaign' 
                ? 'Click "Run Focus Group" to simulate a debate among your active personas.'
                : 'Upload two creative posters and click "Run Creative Test" to see which one performs better.'}
            </p>
          </div>
        )}

      </main>

      {/* Persona Detail Modal */}
      {viewPersona && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                Persona Details
              </h3>
              <button 
                onClick={() => setViewPersona(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Name & Age</p>
                <p className="text-base text-slate-900">{viewPersona.name}, {viewPersona.age}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Occupation</p>
                <p className="text-base text-slate-900">{viewPersona.occupation}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Location</p>
                  <p className="text-base text-slate-900">{viewPersona.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Income</p>
                  <p className="text-base text-slate-900">{viewPersona.income}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Personality</p>
                <p className="text-base text-slate-900">{viewPersona.personality}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Spending Habits</p>
                <p className="text-base text-slate-900">{viewPersona.spending_habits}</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewPersona(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Persona Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-slate-400" />
                Create New Persona
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Maria"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={newPersona.name || ''} 
                    onChange={e => setNewPersona({...newPersona, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input 
                    type="number" 
                    placeholder="e.g., 42"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={newPersona.age || ''} 
                    onChange={e => setNewPersona({...newPersona, age: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Occupation *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Agriculture Operations Manager"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={newPersona.occupation || ''} 
                  onChange={e => setNewPersona({...newPersona, occupation: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Fresno, CA"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={newPersona.location || ''} 
                    onChange={e => setNewPersona({...newPersona, location: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Income</label>
                  <input 
                    type="text" 
                    placeholder="e.g., $85,000/year"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={newPersona.income || ''} 
                    onChange={e => setNewPersona({...newPersona, income: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Personality</label>
                <textarea 
                  placeholder="e.g., Practical, budget-conscious, straightforward..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none h-20"
                  value={newPersona.personality || ''} 
                  onChange={e => setNewPersona({...newPersona, personality: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Spending Habits</label>
                <textarea 
                  placeholder="e.g., Spends heavily on gas for her truck commuting to farms..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none h-20"
                  value={newPersona.spending_habits || ''} 
                  onChange={e => setNewPersona({...newPersona, spending_habits: e.target.value})} 
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePersona}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Add Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
