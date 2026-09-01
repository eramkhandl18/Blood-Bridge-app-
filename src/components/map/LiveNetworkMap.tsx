import React, { useState } from 'react';
import { Hospital, BloodBank, Donor, DemandRequest } from '../../types';
import { Activity, Shield, MapPin, Navigation, Radio, CheckCircle2, Truck, Heart } from 'lucide-react';

interface LiveNetworkMapProps {
  hospitals: Hospital[];
  bloodBanks: BloodBank[];
  donors: Donor[];
  demands: DemandRequest[];
  onSelectDemand?: (demand: DemandRequest) => void;
}

export const LiveNetworkMap: React.FC<LiveNetworkMapProps> = ({
  hospitals,
  bloodBanks,
  donors,
  demands,
  onSelectDemand,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HOSPITALS' | 'BLOOD_BANKS' | 'DONORS' | 'ROUTES'>('ALL');
  const [selectedNode, setSelectedNode] = useState<{
    type: 'HOSPITAL' | 'BLOOD_BANK' | 'DONOR';
    data: Hospital | BloodBank | Donor;
  } | null>(null);

  // Active demands that have transit or donor fallback
  const activeDemands = demands.filter(
    (d) => d.status !== 'FULFILLED' && d.status !== 'CANCELLED'
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-full shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            Live Metropolitan Demand & Logistics Radar
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            SYNCED
          </span>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 text-xs">
          {(['ALL', 'HOSPITALS', 'BLOOD_BANKS', 'DONORS', 'ROUTES'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Canvas / SVG Map Area */}
      <div className="relative flex-1 min-h-[380px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Radar Concentric Rings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500">
          <circle cx="400" cy="250" r="100" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="400" cy="250" r="200" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="400" cy="250" r="320" fill="none" stroke="#1e293b" strokeWidth="1" />
          
          {/* Scanning Sweep */}
          <line x1="400" y1="250" x2="720" y2="250" stroke="rgba(225, 29, 72, 0.15)" strokeWidth="2">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 400 250"
              to="360 400 250"
              dur="12s"
              repeatCount="indefinite"
            />
          </line>

          {/* Active Demand Connecting Arcs */}
          {(activeFilter === 'ALL' || activeFilter === 'ROUTES') &&
            activeDemands.map((demand, idx) => {
              // Draw connection between Hospital and Bank/Donor
              const startX = 220 + (idx % 3) * 160;
              const startY = 160 + (idx % 2) * 150;
              const endX = 540 - (idx % 2) * 120;
              const endY = 240 + (idx % 3) * 80;

              const isDispatched = demand.status === 'DISPATCHED';
              const isDonorActive = demand.status === 'DONOR_FALLBACK_ACTIVE';

              return (
                <g key={`route-${demand.id}`}>
                  <path
                    d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${
                      Math.min(startY, endY) - 50
                    } ${endX} ${endY}`}
                    fill="none"
                    stroke={isDispatched ? '#06D6A0' : isDonorActive ? '#F59E0B' : '#E63946'}
                    strokeWidth={isDispatched ? '2.5' : '1.5'}
                    strokeDasharray={isDispatched ? 'none' : '5 5'}
                    opacity={0.85}
                  />
                  {isDispatched && (
                    <circle r="4" fill="#06D6A0">
                      <animateMotion
                        path={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${
                          Math.min(startY, endY) - 50
                        } ${endX} ${endY}`}
                        dur="3.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
        </svg>

        {/* Map Interactive Nodes */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 1. Hospitals */}
          {(activeFilter === 'ALL' || activeFilter === 'HOSPITALS') &&
            hospitals.map((hosp, idx) => {
              const positions = [
                { top: '25%', left: '22%' },
                { top: '65%', left: '28%' },
                { top: '40%', left: '42%' },
              ];
              const pos = positions[idx % positions.length];
              const hasActiveCritical = demands.some(
                (d) =>
                  d.hospitalId === hosp.id &&
                  d.urgency === 'CRITICAL_TRAUMA' &&
                  d.status !== 'FULFILLED'
              );

              return (
                <div
                  key={hosp.id}
                  style={pos}
                  onClick={() => setSelectedNode({ type: 'HOSPITAL', data: hosp })}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="relative flex flex-col items-center">
                    {hasActiveCritical && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                    )}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 border ${
                        hasActiveCritical
                          ? 'bg-rose-950 text-rose-400 border-rose-500 animate-pulse'
                          : 'bg-slate-900 text-rose-400 border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-sm">✚</span>
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-slate-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap">
                      {hosp.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}

          {/* 2. Blood Banks */}
          {(activeFilter === 'ALL' || activeFilter === 'BLOOD_BANKS') &&
            bloodBanks.map((bank, idx) => {
              const positions = [
                { top: '28%', left: '72%' },
                { top: '70%', left: '68%' },
                { top: '48%', left: '84%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={bank.id}
                  style={pos}
                  onClick={() => setSelectedNode({ type: 'BLOOD_BANK', data: bank })}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-sky-400 border border-sky-600/60 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <Shield className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-sky-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-sky-900 whitespace-nowrap">
                      {bank.name.split(' ')[0]} Bank
                    </span>
                  </div>
                </div>
              );
            })}

          {/* 3. Donors (Approximate privacy radius circle per Slide 10) */}
          {(activeFilter === 'ALL' || activeFilter === 'DONORS') &&
            donors.map((donor, idx) => {
              const positions = [
                { top: '20%', left: '46%' },
                { top: '78%', left: '48%' },
                { top: '55%', left: '16%' },
                { top: '15%', left: '86%' },
                { top: '82%', left: '80%' },
                { top: '52%', left: '60%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={donor.id}
                  style={pos}
                  onClick={() => setSelectedNode({ type: 'DONOR', data: donor })}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                >
                  {/* Privacy Radius Blur Halo */}
                  <div className="absolute -inset-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                  <div className="relative flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 border border-amber-500/50 flex items-center justify-center shadow-md text-xs font-bold transition-transform group-hover:scale-125">
                      {donor.bloodGroup}
                    </div>
                    <span className="mt-0.5 text-[9px] text-amber-200/80 font-medium whitespace-nowrap">
                      {donor.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-800 rounded-xl p-2.5 shadow-lg flex flex-wrap items-center gap-3 text-[11px] z-30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500 flex items-center justify-center text-[8px] text-rose-400">✚</div>
            <span className="text-slate-300">Hospital Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-sky-500/30 border border-sky-500 flex items-center justify-center text-[8px] text-sky-400">❖</div>
            <span className="text-slate-300">Blood Bank Inventory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500 flex items-center justify-center text-[8px] text-amber-400 font-bold">O-</div>
            <span className="text-slate-300">Targeted Donor (Privacy Geofence)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-400"></div>
            <span className="text-slate-300">Active Transit (ETA &lt;15m)</span>
          </div>
        </div>

        {/* Selected Node Details Popup */}
        {selectedNode && (
          <div className="absolute top-3 right-3 max-w-xs bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl z-30 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                {selectedNode.type.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              {selectedNode.data.name}
            </h4>
            {'city' in selectedNode.data && (
              <p className="text-xs text-slate-400 mb-1">{selectedNode.data.city}</p>
            )}
            {'bloodGroup' in selectedNode.data && (
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="font-bold text-amber-400">{selectedNode.data.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Eligible:</span>
                  <span className={selectedNode.data.eligible ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {selectedNode.data.eligible ? 'Eligible' : 'Cool-down period'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approx Area:</span>
                  <span className="text-slate-200">{selectedNode.data.location.approximateArea}</span>
                </div>
              </div>
            )}
            {'tier' in selectedNode.data && (
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Facility Tier:</span>
                  <span className="text-sky-300 font-semibold">{selectedNode.data.tier.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch Vehicles:</span>
                  <span className="text-slate-200">{selectedNode.data.dispatchVehicles} available</span>
                </div>
              </div>
            )}
            {'traumaLevel' in selectedNode.data && (
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Trauma Level:</span>
                  <span className="text-rose-300 font-semibold">{selectedNode.data.traumaLevel.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ICU Capacity:</span>
                  <span className="text-slate-200">{selectedNode.data.icuBeds} Beds</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
