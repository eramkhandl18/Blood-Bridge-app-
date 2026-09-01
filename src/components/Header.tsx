import React from 'react';
import { UserRole, DemandRequest } from '../types';
import { soundEffects } from '../utils/audio';
import {
  Activity,
  Shield,
  Heart,
  Sliders,
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldCheck,
  Play,
  Flame,
  Radio,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  demands: DemandRequest[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetDemo: () => void;
  onOpenCompatibilityModal: () => void;
  onTriggerScenario: (num: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  demands,
  soundEnabled,
  onToggleSound,
  onResetDemo,
  onOpenCompatibilityModal,
  onTriggerScenario,
}) => {
  const activeEmergencies = demands.filter(
    (d) => d.status !== 'FULFILLED' && d.status !== 'CANCELLED'
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Live Beacon */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div
            onClick={() => onSelectRole('HOSPITAL')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 text-white shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-xl tracking-tighter">B</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg text-white tracking-wide">
                  BLOOD<span className="text-rose-500">BRIDGE</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                  PHASE 2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Real-Time Blood Bank Demand Matching
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onOpenCompatibilityModal}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              title="Transfusion Compatibility Rules"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Role Switcher Nav */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800/90 rounded-xl overflow-x-auto max-w-full text-xs">
          <button
            onClick={() => onSelectRole('HOSPITAL')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentRole === 'HOSPITAL'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hospital</span>
            {activeEmergencies.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-rose-950 text-rose-300 border border-rose-700">
                {activeEmergencies.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectRole('BLOOD_BANK')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentRole === 'BLOOD_BANK'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Blood Bank</span>
          </button>

          <button
            onClick={() => onSelectRole('DONOR')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentRole === 'DONOR'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Donor Portal</span>
          </button>

          <button
            onClick={() => onSelectRole('ADMIN')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentRole === 'ADMIN'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Admin & Radar</span>
          </button>

          <button
            onClick={() => onSelectRole('PRESENTATION_MODE')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentRole === 'PRESENTATION_MODE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>PDF Slide Deck (12 Slides)</span>
          </button>
        </nav>

        {/* Action Buttons & Scenario Simulator */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          {/* Quick Scenario Runner Menu */}
          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Play className="w-3 h-3 text-amber-400" /> Demo Story:
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onTriggerScenario(Number(e.target.value));
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="bg-slate-950 text-amber-300 font-bold rounded px-2 py-0.5 border border-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                Select Scenario (Slide 12)
              </option>
              <option value="1">Scenario 1: Code Red O- Trauma</option>
              <option value="2">Scenario 2: Platelet Shortage + Donor Fallback</option>
              <option value="3">Scenario 3: FEFO Wastage Prevention</option>
              <option value="4">Scenario 4: Multi-Unit Disaster Emergency</option>
            </select>
          </div>

          <button
            onClick={onOpenCompatibilityModal}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
            title="Transfusion Compatibility Rules"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">ABO Matrix</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title={soundEnabled ? 'Mute Clinical Sounds' : 'Enable Clinical Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onResetDemo}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset to Initial Demo State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
