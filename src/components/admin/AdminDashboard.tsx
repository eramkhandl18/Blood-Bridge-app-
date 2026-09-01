import React, { useState } from 'react';
import {
  AuditEntry,
  DemandRequest,
  InventoryBatch,
  Donor,
  Hospital,
  BloodBank,
  MatchingWeights,
} from '../../types';
import { LiveNetworkMap } from '../map/LiveNetworkMap';
import {
  ShieldAlert,
  Activity,
  Sliders,
  Sparkles,
  TrendingUp,
  FileCheck,
  Zap,
  CheckCircle,
  Database,
  BarChart3,
  Server,
  Layers,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface AdminDashboardProps {
  auditTrail: AuditEntry[];
  demands: DemandRequest[];
  inventory: InventoryBatch[];
  donors: Donor[];
  hospitals: Hospital[];
  bloodBanks: BloodBank[];
  weights: MatchingWeights;
  onUpdateWeights: (newWeights: MatchingWeights) => void;
  onResetWeights: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  auditTrail,
  demands,
  inventory,
  donors,
  hospitals,
  bloodBanks,
  weights,
  onUpdateWeights,
  onResetWeights,
}) => {
  const [activeTab, setActiveTab] = useState<'RADAR' | 'WEIGHTS' | 'AUDIT' | 'INTELLIGENCE' | 'BENCHMARKS'>('RADAR');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  // KPI Calculations
  const totalUnitsInStock = inventory.reduce(
    (acc, cur) => acc + (cur.unitsAvailable - cur.unitsReserved),
    0
  );
  const activeDemandsCount = demands.filter(
    (d) => d.status !== 'FULFILLED' && d.status !== 'CANCELLED'
  ).length;
  const fulfilledDemandsCount = demands.filter((d) => d.status === 'FULFILLED').length;
  const eligibleDonorsCount = donors.filter((d) => d.eligible).length;

  const filteredAudit =
    auditFilter === 'ALL'
      ? auditTrail
      : auditTrail.filter((entry) => entry.actorRole === auditFilter);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards (Slide 5 & 11) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Avg Match Latency</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">1.4s</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            ⚡ Target Match in Seconds
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Incompatibilities</span>
            <ShieldAlert className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">0.0%</div>
          <div className="text-[11px] text-sky-400 font-semibold mt-1">
            ✓ Zero Incompatible Dispatches
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>FEFO Wastage Prevented</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">98.6%</div>
          <div className="text-[11px] text-amber-400 font-semibold mt-1">
            ♻ Expiry-aware Prioritization
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Network Units</span>
            <Database className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalUnitsInStock}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {eligibleDonorsCount} Donors Standby
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'RADAR', label: 'Live Network Radar', icon: Activity },
          { id: 'WEIGHTS', label: 'Matching Logic Tuning (Slide 7)', icon: Sliders },
          { id: 'AUDIT', label: 'Immutable Audit Trail', icon: FileCheck },
          { id: 'INTELLIGENCE', label: 'Phase 3 AI Forecast', icon: Sparkles },
          { id: 'BENCHMARKS', label: 'BloodBridge vs Traditional', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Live Radar */}
      {activeTab === 'RADAR' && (
        <div className="h-[520px]">
          <LiveNetworkMap
            hospitals={hospitals}
            bloodBanks={bloodBanks}
            donors={donors}
            demands={demands}
          />
        </div>
      )}

      {/* TAB 2: Matching Weights Customizer (Slide 7) */}
      {activeTab === 'WEIGHTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Sliders className="w-5 h-5 text-rose-500" />
                Transparent Weighted Scoring Engine (Slide 7)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure clinical and operational weights used to rank matching candidates across metropolitan depots.
              </p>
            </div>
            <button
              onClick={onResetWeights}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Slide Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Sliders */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-rose-400">1. Urgency Weight (Default 40%)</span>
                  <span className="font-mono text-white">{weights.urgency}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={weights.urgency}
                  onChange={(e) => onUpdateWeights({ ...weights, urgency: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Critical trauma and emergency surgeries receive highest operational dispatch priority.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-sky-400">2. Compatibility Weight (Default 25%)</span>
                  <span className="font-mono text-white">{weights.compatibility}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={weights.compatibility}
                  onChange={(e) => onUpdateWeights({ ...weights, compatibility: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Exact ABO/Rh match receives maximum points; universal substitutes get compatible tier.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-teal-400">3. ETA / Distance Weight (Default 15%)</span>
                  <span className="font-mono text-white">{weights.etaDistance}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={weights.etaDistance}
                  onChange={(e) => onUpdateWeights({ ...weights, etaDistance: Number(e.target.value) })}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Faster transit times and closest blood banks receive preferential ranking.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-amber-400">4. Expiry Priority (FEFO) (Default 10%)</span>
                  <span className="font-mono text-white">{weights.fefoExpiry}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={weights.fefoExpiry}
                  onChange={(e) => onUpdateWeights({ ...weights, fefoExpiry: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Units closer to expiration (within safe window) get prioritized to minimize wastage.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-400">5. Quantity Coverage (Default 10%)</span>
                  <span className="font-mono text-white">{weights.quantityCoverage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={weights.quantityCoverage}
                  onChange={(e) => onUpdateWeights({ ...weights, quantityCoverage: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Batches that fulfill full unit requirements score higher than single unit fragments.
                </p>
              </div>

              {/* Weight Total Indicator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex justify-between font-bold text-sm mb-1">
                  <span className="text-slate-200">Total Sum of Weights:</span>
                  <span className="text-emerald-400 font-mono">
                    {weights.urgency + weights.compatibility + weights.etaDistance + weights.fefoExpiry + weights.quantityCoverage}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Rule-based MVP architecture delivers 100% explainable & transparent clinical matching decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Trail (Slide 5, 6, 10) */}
      {activeTab === 'AUDIT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Immutable System Audit Log (Slide 10)
              </h3>
              <p className="text-xs text-slate-400">
                Full chronological traceability of demands, validations, reservations, donor summons, and handovers.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 text-xs">
              {['ALL', 'HOSPITAL', 'BLOOD_BANK', 'DONOR', 'SYSTEM'].map((role) => (
                <button
                  key={role}
                  onClick={() => setAuditFilter(role)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    auditFilter === role
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredAudit.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-start gap-3"
              >
                <div
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase border mt-0.5 ${
                    entry.status === 'ALERT'
                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                      : entry.status === 'WARNING'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : entry.status === 'SUCCESS'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-sky-950 text-sky-400 border-sky-800'
                  }`}
                >
                  {entry.actorRole}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{entry.action.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono text-slate-400">{entry.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{entry.actorName}</div>
                  <p className="text-xs text-slate-400 mt-1">{entry.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Phase 3 AI Forecast & Intelligence (Slide 12) */}
      {activeTab === 'INTELLIGENCE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Phase 3 Intelligence: Demand Forecasting & Anomaly Detection (Slide 12)
              </h3>
              <p className="text-xs text-slate-400">
                Predictive telemetry modeling metropolitan demand spikes, weather hazards, and shortage risks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">O- Negative Deficit Risk</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">HIGH RISK</span>
              </div>
              <p className="text-slate-300">
                Forecasted shortage of 6 units in Downtown Metro over next 48 hours due to holiday traffic surge.
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                → Recommended: Pre-alert 4 standby O- donors in East River.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">Platelet Expiry Optimization</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">FEFO ROUTE</span>
              </div>
              <p className="text-slate-300">
                2 units of A+ Platelets at LifeStream expire in 36 hours. Re-routing priority assigned to elective surgery at St. Jude.
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                → 100% Wastage prevention achieved.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">Transit Delay Anomaly Detection</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">NOMINAL</span>
              </div>
              <p className="text-slate-300">
                All 4 active couriers running within &plusmn;3 minutes of simulated siren ETA routes.
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                No active traffic anomalies detected.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Benchmarks Comparison (Slide 11) */}
      {activeTab === 'BENCHMARKS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white font-display">
              Expected Impact: Typical Approach vs. BloodBridge (Slide 11)
            </h3>
            <p className="text-xs text-slate-400">
              A comprehensive operational comparison between legacy fragmented phone/chat workflows and BloodBridge real-time event-driven matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Typical Approach */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Typical / Legacy Approach
              </div>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> Static blood availability lists updated manually
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> Chaotic phone calls and unverified WhatsApp broadcast groups
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> Search donors without checking nearby bank inventories
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> Nearest unit only without considering shelf-life (FEFO)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> No closed-loop status; duplicate alerts remain after fulfillment
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> Opaque AI black-box or zero clinical explainability
                </li>
              </ul>
            </div>

            {/* BloodBridge */}
            <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-3 shadow-lg shadow-rose-950/20">
              <div className="text-sm font-bold text-rose-400 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                BloodBridge Event-Driven Platform
              </div>
              <ul className="space-y-2 text-slate-200 text-xs">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Live event-driven real-time availability feeds
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Structured Demand → Match → Instant Notification
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Inventory-First + Targeted Donor Fallback (if shortfall remains)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Multi-Factor Operational Ranking (Urgency, Compat, ETA, FEFO, Qty)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Reservation to Closure Tracking (Auto-cancels open donor alerts)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Transparent Rule-Based MVP with explainable audit trails
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
