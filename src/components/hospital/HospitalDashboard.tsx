import React, { useState } from 'react';
import {
  DemandRequest,
  InventoryBatch,
  Donor,
  Hospital,
  BloodGroup,
  BloodComponent,
  UrgencyLevel,
  MatchCandidate,
} from '../../types';
import { rankMatches } from '../../utils/matchingEngine';
import { soundEffects } from '../../utils/audio';
import {
  PlusCircle,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  Users,
  ShieldCheck,
  ChevronRight,
  Flame,
  Activity,
  HeartHandshake,
  ArrowRight,
  FileText,
  MapPin,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HospitalDashboardProps {
  hospitals: Hospital[];
  demands: DemandRequest[];
  inventory: InventoryBatch[];
  donors: Donor[];
  currentHospitalId: string;
  onHospitalChange: (id: string) => void;
  onCreateDemand: (demand: Partial<DemandRequest>) => void;
  onReserveMatch: (demandId: string, candidate: MatchCandidate, unitsToReserve: number) => void;
  onTriggerDonorFallback: (demandId: string) => void;
  onFulfillDemand: (demandId: string) => void;
  onOpenCompatibilityModal: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS: BloodComponent[] = [
  'Packed RBCs',
  'Platelets',
  'Fresh Frozen Plasma',
  'Whole Blood',
  'Cryoprecipitate',
];

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  hospitals,
  demands,
  inventory,
  donors,
  currentHospitalId,
  onHospitalChange,
  onCreateDemand,
  onReserveMatch,
  onTriggerDonorFallback,
  onFulfillDemand,
  onOpenCompatibilityModal,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDemandId, setSelectedDemandId] = useState<string>(
    demands.find((d) => d.status !== 'FULFILLED')?.id || demands[0]?.id || ''
  );

  // Form State for new demand
  const [patientCase, setPatientCase] = useState('');
  const [patientAge, setPatientAge] = useState(35);
  const [patientGender, setPatientGender] = useState<'M' | 'F' | 'Other'>('M');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<BloodComponent>('Packed RBCs');
  const [unitsRequested, setUnitsRequested] = useState(3);
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL_TRAUMA');
  const [requiredWithinHours, setRequiredWithinHours] = useState(1);
  const [clinicalNotes, setClinicalNotes] = useState('');

  const currentHospital =
    hospitals.find((h) => h.id === currentHospitalId) || hospitals[0];

  const selectedDemand =
    demands.find((d) => d.id === selectedDemandId) || demands[0];

  // Calculate live matches for selected demand
  const matchCandidates = selectedDemand
    ? rankMatches(selectedDemand, inventory, donors)
    : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientCase.trim()) return;

    onCreateDemand({
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      patientCase,
      patientAge,
      patientGender,
      bloodGroup,
      component,
      unitsRequested: Number(unitsRequested),
      urgency,
      requiredWithinHours: Number(requiredWithinHours),
      location: currentHospital.location,
      clinicalNotes: clinicalNotes || 'Emergency clinical transfusion order verified by attending staff.',
    });

    soundEffects.playAlert();
    setShowCreateModal(false);
    // Reset form
    setPatientCase('');
    setClinicalNotes('');
  };

  const applyPreset = (preset: {
    title: string;
    bg: BloodGroup;
    comp: BloodComponent;
    qty: number;
    urg: UrgencyLevel;
    notes: string;
  }) => {
    setPatientCase(preset.title);
    setBloodGroup(preset.bg);
    setComponent(preset.comp);
    setUnitsRequested(preset.qty);
    setUrgency(preset.urg);
    setClinicalNotes(preset.notes);
  };

  const handleFulfillWithCelebration = (demandId: string) => {
    onFulfillDemand(demandId);
    soundEffects.playSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06D6A0', '#E63946', '#38BDF8'],
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Hospital Selector Bar & Top Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xl">
            ✚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                Active Hospital Facility
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentHospital?.traumaLevel.replace('_', ' ')}
              </span>
            </div>
            <select
              value={currentHospitalId}
              onChange={(e) => onHospitalChange(e.target.value)}
              className="bg-slate-950 text-white font-display font-bold text-base sm:text-lg rounded-lg px-3 py-1 border border-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer mt-0.5"
            >
              {hospitals.map((hosp) => (
                <option key={hosp.id} value={hosp.id}>
                  {hosp.name} ({hosp.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCompatibilityModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Transfusion Rules
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-all shadow-lg shadow-rose-900/30 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Demand
          </button>
        </div>
      </div>

      {/* Main Grid: Left Demand List & Right Smart Match Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Demands List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Hospital Demands ({demands.length})
            </h3>
            <span className="text-xs text-slate-400">Live Auto-Sync</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {demands.map((demand) => {
              const isSelected = demand.id === selectedDemandId;
              const isCritical = demand.urgency === 'CRITICAL_TRAUMA';
              const remainingUnits = demand.unitsRequested - demand.unitsFulfilled;

              return (
                <div
                  key={demand.id}
                  onClick={() => setSelectedDemandId(demand.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-rose-500 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                      : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  {isCritical && demand.status !== 'FULFILLED' && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse" />
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm border border-rose-500/30">
                        {demand.bloodGroup}
                      </span>
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {demand.id}
                        </span>
                        <div className="text-xs font-semibold text-slate-200">
                          {demand.component}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        demand.status === 'FULFILLED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : demand.status === 'DISPATCHED'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 animate-pulse'
                          : demand.status === 'DONOR_FALLBACK_ACTIVE'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                          : demand.status === 'MATCH_FOUND'
                          ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {demand.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white mb-2 line-clamp-1">
                    {demand.patientCase}
                  </p>

                  {/* Progress Bar & Fulfillment Stats */}
                  <div className="space-y-1.5 mb-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Fulfillment:</span>
                      <span className="font-bold text-slate-200">
                        {demand.unitsFulfilled} / {demand.unitsRequested} Units
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          demand.unitsFulfilled === demand.unitsRequested
                            ? 'bg-emerald-500'
                            : demand.unitsFulfilled > 0
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${(demand.unitsFulfilled / demand.unitsRequested) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Req. within {demand.requiredWithinHours}h
                    </span>
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">
                      {demand.hospitalName.split(' ')[0]} Hospital
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Demand Details & Ranked Smart Matches (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDemand ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              {/* Selected Demand Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                      {selectedDemand.id}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        selectedDemand.urgency === 'CRITICAL_TRAUMA'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {selectedDemand.urgency.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white font-display">
                    {selectedDemand.patientCase}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Location: {selectedDemand.location.address}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-rose-400 font-display">
                    {selectedDemand.bloodGroup}
                  </div>
                  <div className="text-xs font-semibold text-slate-300">
                    {selectedDemand.component}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedDemand.unitsRequested - selectedDemand.unitsFulfilled} units still needed
                  </div>
                </div>
              </div>

              {/* Clinical Notes & Verification Status */}
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-300 mb-1">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Attending Clinical Notes & Verification:
                </div>
                <p className="text-slate-400 leading-relaxed">{selectedDemand.clinicalNotes}</p>
              </div>

              {/* Active Reservations & In-Transit Couriers */}
              {selectedDemand.reservations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      Active Dispatch Reservations ({selectedDemand.reservations.length})
                    </span>
                    {selectedDemand.status !== 'FULFILLED' && (
                      <button
                        onClick={() => handleFulfillWithCelebration(selectedDemand.id)}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-md transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Received & Fulfilled
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {selectedDemand.reservations.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{res.units} Units {res.bloodGroup} {res.component}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {res.status}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Source: {res.bloodBankName}
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-emerald-400 font-bold">
                            ETA ~{res.etaMinutes} mins
                          </div>
                          <div className="text-[10px] text-slate-400">Siren Priority Route</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Match Candidates Engine Output */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Smart Match Candidates Ranked by Engine (Slide 7)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Weighted: Urgency 40% • Comp 25% • ETA 15% • FEFO 10% • Qty 10%
                    </p>
                  </div>

                  {selectedDemand.status !== 'FULFILLED' &&
                    selectedDemand.unitsRequested > selectedDemand.unitsFulfilled && (
                      <button
                        onClick={() => onTriggerDonorFallback(selectedDemand.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1.5 transition-all"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Trigger Donor Fallback
                      </button>
                    )}
                </div>

                {matchCandidates.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    No compatible supply currently available. Please trigger Donor Fallback alerts to summon emergency donors.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchCandidates.slice(0, 4).map((candidate, idx) => {
                      const isTopMatch = idx === 0;
                      const isDonor = candidate.type === 'DONOR_FALLBACK';

                      return (
                        <div
                          key={candidate.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isTopMatch
                              ? 'bg-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isDonor
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                                }`}
                              >
                                {candidate.bloodGroup}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-white">
                                    {candidate.sourceName}
                                  </h4>
                                  {isTopMatch && (
                                    <span className="text-[10px] font-bold px-2 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                                      ★ Rank #1 (Optimal)
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  {candidate.unitsAvailable} Units Available • {candidate.distanceKm} km • ETA ~{candidate.etaMinutes} mins
                                </span>
                              </div>
                            </div>

                            {/* Match Score Badge */}
                            <div className="text-right">
                              <div className="text-base font-black text-emerald-400 font-mono">
                                {candidate.score}%
                              </div>
                              <span className="text-[10px] text-slate-400">Match Score</span>
                            </div>
                          </div>

                          {/* Score Breakdown Bars (Slide 7) */}
                          <div className="grid grid-cols-5 gap-1.5 my-2.5 text-[10px] bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                            <div>
                              <div className="text-slate-400">Urgency (40%)</div>
                              <div className="font-bold text-rose-400">{candidate.breakdown.urgencyScore}pts</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Compat (25%)</div>
                              <div className="font-bold text-sky-400">{candidate.breakdown.compatibilityScore}pts</div>
                            </div>
                            <div>
                              <div className="text-slate-400">ETA (15%)</div>
                              <div className="font-bold text-teal-400">{candidate.breakdown.etaScore}pts</div>
                            </div>
                            <div>
                              <div className="text-slate-400">FEFO (10%)</div>
                              <div className="font-bold text-amber-400">{candidate.breakdown.expiryScore}pts</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Coverage (10%)</div>
                              <div className="font-bold text-emerald-400">{candidate.breakdown.quantityScore}pts</div>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 mb-3 bg-slate-900/50 p-2 rounded border border-slate-800/60">
                            {candidate.explanation}
                          </p>

                          {/* Actions: Request Reservation / Partial Reserve */}
                          {selectedDemand.status !== 'FULFILLED' && (
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                              <span className="text-[11px] text-slate-400">
                                {isDonor ? 'Donor Fallback Summoning' : 'Instant Digital Lock & Dispatch'}
                              </span>

                              <button
                                onClick={() => {
                                  const unitsToReserve = Math.min(
                                    candidate.unitsAvailable,
                                    selectedDemand.unitsRequested - selectedDemand.unitsFulfilled
                                  );
                                  onReserveMatch(selectedDemand.id, candidate, unitsToReserve);
                                  soundEffects.playSuccess();
                                }}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg text-white flex items-center gap-1.5 transition-all shadow-md ${
                                  isTopMatch
                                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                                    : 'bg-rose-600 hover:bg-rose-500'
                                }`}
                              >
                                <HeartHandshake className="w-3.5 h-3.5" />
                                {isDonor ? 'Send Targeted Push Alert' : `Reserve ${Math.min(candidate.unitsAvailable, selectedDemand.unitsRequested - selectedDemand.unitsFulfilled)} Unit(s)`}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
              Select a demand on the left to view smart matching recommendations.
            </div>
          )}
        </div>
      </div>

      {/* New Demand Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
                  ✚
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Post Emergency Blood Demand
                  </h3>
                  <p className="text-xs text-slate-400">Step 1: Clinical Verification & Structured Broadcast</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                Quick Clinical Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: 'Level 1 MVA Trauma — Hemorrhagic Shock',
                      bg: 'O-',
                      comp: 'Packed RBCs',
                      qty: 4,
                      urg: 'CRITICAL_TRAUMA',
                      notes: 'Massive transfusion protocol activated. Uncrossmatched O- urgently required.',
                    })
                  }
                  className="p-2 text-left bg-slate-950 border border-slate-800 hover:border-rose-500 rounded-lg text-xs transition-colors"
                >
                  <div className="font-bold text-rose-400">Trauma O- (4 Units)</div>
                  <div className="text-[10px] text-slate-400">Code Red Emergency</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: 'Acute Postpartum Hemorrhage & Coagulopathy',
                      bg: 'A-',
                      comp: 'Platelets',
                      qty: 3,
                      urg: 'CRITICAL_TRAUMA',
                      notes: 'Emergent cesarean section with rapid platelet consumption.',
                    })
                  }
                  className="p-2 text-left bg-slate-950 border border-slate-800 hover:border-rose-500 rounded-lg text-xs transition-colors"
                >
                  <div className="font-bold text-amber-400">PPH A- (3 Platelets)</div>
                  <div className="text-[10px] text-slate-400">Obstetric Crisis</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: 'Emergency Pediatric Cardiac Bypass',
                      bg: 'AB+',
                      comp: 'Fresh Frozen Plasma',
                      qty: 2,
                      urg: 'HIGH_SURGERY',
                      notes: 'Bypass priming factor replacement.',
                    })
                  }
                  className="p-2 text-left bg-slate-950 border border-slate-800 hover:border-rose-500 rounded-lg text-xs transition-colors"
                >
                  <div className="font-bold text-teal-400">Pediatric AB+ (2 FFP)</div>
                  <div className="text-[10px] text-slate-400">Cardiothoracic</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: 'Severe Anemia in Sickle Cell Crisis',
                      bg: 'B+',
                      comp: 'Packed RBCs',
                      qty: 2,
                      urg: 'HIGH_SURGERY',
                      notes: 'Hemoglobin drop to 4.5 g/dL with acute chest syndrome.',
                    })
                  }
                  className="p-2 text-left bg-slate-950 border border-slate-800 hover:border-rose-500 rounded-lg text-xs transition-colors"
                >
                  <div className="font-bold text-sky-400">Sickle Cell B+ (2 Units)</div>
                  <div className="text-[10px] text-slate-400">Hematology</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Patient Clinical Case / Emergency Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Penetrating thoracic trauma with active arterial bleed"
                  value={patientCase}
                  onChange={(e) => setPatientCase(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Blood Group Required
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 text-xs font-bold focus:outline-none focus:border-rose-500"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Component Type
                  </label>
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value as BloodComponent)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 text-xs font-bold focus:outline-none focus:border-rose-500"
                  >
                    {COMPONENTS.map((comp) => (
                      <option key={comp} value={comp}>
                        {comp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Units Requested
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={unitsRequested}
                    onChange={(e) => setUnitsRequested(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 text-xs font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Urgency Criticality
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 text-xs font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="CRITICAL_TRAUMA">Critical / Trauma (Immediate)</option>
                    <option value="HIGH_SURGERY">High / Surgical (Within 2-4h)</option>
                    <option value="STANDARD_ELECTIVE">Standard / Elective (Within 12h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Req. Within (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={requiredWithinHours}
                    onChange={(e) => setRequiredWithinHours(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 text-xs font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Physician Transfusion Notes & Justification
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Include patient vitals, active bleeding rate, or crossmatching details..."
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40"
                >
                  Post Demand & Trigger Smart Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
