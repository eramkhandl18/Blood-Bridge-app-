import React, { useState } from 'react';
import { Donor, DemandRequest, BloodGroup } from '../../types';
import { soundEffects } from '../../utils/audio';
import {
  Heart,
  ShieldCheck,
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  AlertCircle,
  Lock,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonorDashboardProps {
  donors: Donor[];
  currentDonorId: string;
  onDonorChange: (id: string) => void;
  demands: DemandRequest[];
  onDonorRespond: (demandId: string, donorId: string, status: 'ACCEPTED' | 'DECLINED', etaMins: number) => void;
  onToggleAlerts: (donorId: string, optIn: boolean) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  donors,
  currentDonorId,
  onDonorChange,
  demands,
  onDonorRespond,
  onToggleAlerts,
}) => {
  const currentDonor =
    donors.find((d) => d.id === currentDonorId) || donors[0];

  const [responseEta, setResponseEta] = useState<number>(25);

  // Demands that triggered targeted fallback for this donor's blood type
  const targetedAlerts = demands.filter((demand) => {
    return (
      demand.status === 'DONOR_FALLBACK_ACTIVE' &&
      (demand.bloodGroup === currentDonor.bloodGroup || currentDonor.bloodGroup === 'O-')
    );
  });

  const handleRespondWithConfetti = (demandId: string, status: 'ACCEPTED' | 'DECLINED') => {
    onDonorRespond(demandId, currentDonor.id, status, responseEta);
    if (status === 'ACCEPTED') {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#E63946', '#F59E0B', '#10B981'],
        });
      } catch {}
    } else {
      soundEffects.playAlert();
    }
  };

  return (
    <div className="space-y-6">
      {/* Donor Profile & Switcher Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
            <Heart className="w-6 h-6 fill-amber-500/30 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Verified Opt-in Donor Profile
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentDonor?.badge}
              </span>
            </div>
            <select
              value={currentDonorId}
              onChange={(e) => onDonorChange(e.target.value)}
              className="bg-slate-950 text-white font-display font-bold text-base sm:text-lg rounded-lg px-3 py-1 border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer mt-0.5"
            >
              {donors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.bloodGroup} • {d.eligible ? 'Eligible' : 'Cool-down'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Emergency Alert Opt-In Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <Bell className={`w-4 h-4 ${currentDonor.optInEmergencyAlerts ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
            <span className="text-slate-300 font-semibold">Emergency SMS & Push:</span>
            <button
              onClick={() => onToggleAlerts(currentDonor.id, !currentDonor.optInEmergencyAlerts)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                currentDonor.optInEmergencyAlerts
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {currentDonor.optInEmergencyAlerts ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>
      </div>

      {/* Slide 10: Privacy Principle Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>
            <strong className="text-slate-200 font-semibold">Donor Privacy Shield Active:</strong> Your exact GPS coordinates remain confidential. Hospitals only see your approximate metropolitan radius ({currentDonor.location.approximateArea}) until mutual dispatch confirmation.
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
          HIPAA & GDPR COMPLIANT
        </span>
      </div>

      {/* Main Grid: Active Urgent Fallback Alerts & Donor Passport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Targeted Emergency Shortage Alerts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Targeted Fallback Emergency Summoning ({targetedAlerts.length})
            </h3>
            <span className="text-xs text-amber-400">Triggered only on Blood Bank inventory shortage</span>
          </div>

          {targetedAlerts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
              <div className="text-sm font-bold text-white">No Active Shortage Alerts in Your Area</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Blood bank inventory is currently covering demand. BloodBridge will instantly alert you via push/SMS if an urgent hospital shortfall arises matching your blood group ({currentDonor.bloodGroup}).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {targetedAlerts.map((demand) => {
                const alreadyResponded = demand.donorAlerts.find(
                  (a) => a.donorId === currentDonor.id
                );

                return (
                  <div
                    key={`alert-${demand.id}`}
                    className="p-5 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-xl space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-bold text-xs rounded border border-rose-500/30">
                            CODE RED SHORTFALL
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {demand.id}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white font-display">
                          {demand.hospitalName}
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {demand.patientCase}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-base shadow-lg shadow-rose-900/50 ml-auto">
                          {demand.bloodGroup}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {demand.unitsRequested - demand.unitsFulfilled} Units Short
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Hospital Location:</span>
                        <span className="font-semibold text-white">{demand.location.address}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Distance from you:</span>
                        <span className="text-amber-400 font-bold">~{currentDonor.distanceKm} km (~18 mins travel)</span>
                      </div>
                    </div>

                    {/* Response Controls */}
                    {alreadyResponded ? (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>
                            Response Logged: <strong>{alreadyResponded.status}</strong> (ETA ~{alreadyResponded.responseEtaMinutes} mins)
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">DISPATCH NOTIFIED</span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>My ETA:</span>
                          <select
                            value={responseEta}
                            onChange={(e) => setResponseEta(Number(e.target.value))}
                            className="bg-slate-950 text-white rounded px-2 py-1 border border-slate-700 font-bold"
                          >
                            <option value={15}>15 Minutes</option>
                            <option value={25}>25 Minutes</option>
                            <option value={40}>40 Minutes</option>
                            <option value={60}>60 Minutes</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespondWithConfetti(demand.id, 'DECLINED')}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 text-xs font-semibold"
                          >
                            Cannot Make It
                          </button>
                          <button
                            onClick={() => handleRespondWithConfetti(demand.id, 'ACCEPTED')}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            I Can Donate (En Route)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Donor Passport & Health Criteria (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Digital Donor Passport & Health Log
            </h3>

            {/* Donor Badge Card */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/80 rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Donor ID: {currentDonor.id}
                  </span>
                  <h4 className="text-base font-bold text-white">{currentDonor.name}</h4>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-xl text-amber-300 font-display">
                  {currentDonor.bloodGroup}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-400 text-[11px]">Lifetime Donations:</span>
                  <div className="font-bold text-white text-sm">{currentDonor.totalDonations} Units</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Estimated Lives Saved:</span>
                  <div className="font-bold text-emerald-400 text-sm">{currentDonor.totalDonations * 3} Lives</div>
                </div>
              </div>
            </div>

            {/* Health & Transfusion Eligibility Status */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-300 block">
                Clinical Eligibility Parameters:
              </span>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300">Last Donation Date</span>
                </div>
                <span className="font-mono text-slate-200">{currentDonor.lastDonationDate}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Cool-down Status</span>
                </div>
                <span
                  className={`font-bold px-2 py-0.2 rounded text-[11px] ${
                    currentDonor.eligible
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {currentDonor.eligible ? 'Ready & Cleared' : 'In 56-day Recovery'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-slate-300">Hemoglobin Level</span>
                </div>
                <span className="font-bold text-slate-200">{currentDonor.hemoglobin} g/dL (Normal &ge;13.0)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span className="text-slate-300">Alert Dispatch Radius</span>
                </div>
                <span className="font-bold text-slate-200">{currentDonor.preferredRadiusKm} km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
