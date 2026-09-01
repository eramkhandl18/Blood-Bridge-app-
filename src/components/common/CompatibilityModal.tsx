import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types';
import { checkTransfusionCompatibility } from '../../utils/matchingEngine';
import { ShieldCheck, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface CompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS: BloodComponent[] = ['Packed RBCs', 'Platelets', 'Fresh Frozen Plasma', 'Whole Blood'];

export const CompatibilityModal: React.FC<CompatibilityModalProps> = ({ isOpen, onClose }) => {
  const [selectedRecipient, setSelectedRecipient] = useState<BloodGroup>('O-');
  const [selectedDonor, setSelectedDonor] = useState<BloodGroup>('O-');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('Packed RBCs');

  if (!isOpen) return null;

  const result = checkTransfusionCompatibility(selectedDonor, selectedRecipient, selectedComponent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              ABO
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">Clinical Transfusion Compatibility Matrix</h2>
              <p className="text-xs text-slate-400">Phase 2 Rule-based matching engine & immunohematology verification rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Component Selector */}
        <div className="my-5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            1. Select Component Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COMPONENTS.map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedComponent(comp)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  selectedComponent === comp
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/30'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* Donor & Recipient Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-4">
          {/* Recipient */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Patient (Recipient)</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40">Hospital Demand</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={`recip-${bg}`}
                  onClick={() => setSelectedRecipient(bg)}
                  className={`py-2 text-center font-bold text-sm rounded-lg transition-all ${
                    selectedRecipient === bg
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/50 scale-105'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Donor / Inventory */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Supply / Donor</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">Blood Bank / Donor</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={`don-${bg}`}
                  onClick={() => setSelectedDonor(bg)}
                  className={`py-2 text-center font-bold text-sm rounded-lg transition-all ${
                    selectedDonor === bg
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 scale-105'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Result Card */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
            result.isCompatible
              ? result.verdict === 'EXACT_MATCH'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                : 'bg-teal-950/40 border-teal-500/50 text-teal-100'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
          }`}
        >
          <div className="mt-1">
            {result.isCompatible ? (
              result.verdict === 'EXACT_MATCH' ? (
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              ) : (
                <Info className="w-7 h-7 text-teal-400" />
              )
            ) : (
              <XCircle className="w-7 h-7 text-rose-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base">
                {result.isCompatible ? 'CLINICALLY COMPATIBLE' : 'INCOMPATIBLE COMBINATION'}
              </span>
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                {result.verdict.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm opacity-90">{result.details}</p>
          </div>
        </div>

        {/* Quick Reference Summary Grid */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" /> Universal Principles Implemented in Engine:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-rose-400 font-bold">RBC / Whole Blood:</span> O- is the Universal Donor for RBCs (no A/B antigens or Rh factor). AB+ is the Universal Recipient.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-emerald-400 font-bold">Plasma (FFP):</span> Reverse rules! AB is Universal Plasma Donor (no anti-A or anti-B antibodies). O is Universal Plasma Recipient.
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
