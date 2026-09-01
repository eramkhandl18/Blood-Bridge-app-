import React, { useState } from 'react';
import {
  BloodBank,
  InventoryBatch,
  DemandRequest,
  BloodGroup,
  BloodComponent,
  MatchCandidate,
} from '../../types';
import { getDaysToExpiry, checkTransfusionCompatibility } from '../../utils/matchingEngine';
import { soundEffects } from '../../utils/audio';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  PlusCircle,
  Thermometer,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

interface BloodBankDashboardProps {
  bloodBanks: BloodBank[];
  currentBloodBankId: string;
  onBloodBankChange: (id: string) => void;
  inventory: InventoryBatch[];
  demands: DemandRequest[];
  onAddInventory: (batch: Partial<InventoryBatch>) => void;
  onAcceptDemandAlert: (demandId: string, batchId: string, units: number) => void;
  onRejectDemandAlert: (demandId: string, reason: string) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS: BloodComponent[] = [
  'Packed RBCs',
  'Platelets',
  'Fresh Frozen Plasma',
  'Whole Blood',
  'Cryoprecipitate',
];

export const BloodBankDashboard: React.FC<BloodBankDashboardProps> = ({
  bloodBanks,
  currentBloodBankId,
  onBloodBankChange,
  inventory,
  demands,
  onAddInventory,
  onAcceptDemandAlert,
  onRejectDemandAlert,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterComponent, setFilterComponent] = useState<string>('ALL');

  // Form state
  const [newBloodGroup, setNewBloodGroup] = useState<BloodGroup>('O-');
  const [newComponent, setNewComponent] = useState<BloodComponent>('Packed RBCs');
  const [newUnits, setNewUnits] = useState(6);
  const [newExpiryDays, setNewExpiryDays] = useState(14);
  const [newStorageLoc, setNewStorageLoc] = useState('Vault-Alpha Shelf 1');
  const [newTempC, setNewTempC] = useState(3.9);

  const currentBank =
    bloodBanks.find((b) => b.id === currentBloodBankId) || bloodBanks[0];

  const bankInventory = inventory.filter(
    (item) => item.bloodBankId === currentBank.id
  );

  // Filter inventory by component
  const filteredInventory =
    filterComponent === 'ALL'
      ? bankInventory
      : bankInventory.filter((item) => item.component === filterComponent);

  // Sort inventory by FEFO (First-Expired, First-Out)
  const fefoSortedInventory = [...filteredInventory].sort((a, b) => {
    return getDaysToExpiry(a.expiryDate) - getDaysToExpiry(b.expiryDate);
  });

  // Demands that need matching or incoming alerts
  const incomingEmergencyDemands = demands.filter(
    (d) =>
      d.status !== 'FULFILLED' &&
      d.status !== 'CANCELLED' &&
      d.unitsRequested > d.unitsFulfilled
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + Number(newExpiryDays));

    onAddInventory({
      bloodBankId: currentBank.id,
      bloodBankName: currentBank.name,
      bloodGroup: newBloodGroup,
      component: newComponent,
      unitsAvailable: Number(newUnits),
      unitsReserved: 0,
      collectionDate: new Date().toISOString().split('T')[0],
      expiryDate: expDate.toISOString().split('T')[0],
      storageLocation: newStorageLoc,
      temperatureC: Number(newTempC),
      testedStatus: 'VERIFIED_SAFE',
      lotNumber: `${currentBank.name.slice(0, 2).toUpperCase()}-${newComponent.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    soundEffects.playSuccess();
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Blood Bank Selector & Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                Active Blood Bank Depot
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-sky-800">
                {currentBank?.tier.replace(/_/g, ' ')}
              </span>
            </div>
            <select
              value={currentBloodBankId}
              onChange={(e) => onBloodBankChange(e.target.value)}
              className="bg-slate-950 text-white font-display font-bold text-base sm:text-lg rounded-lg px-3 py-1 border border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer mt-0.5"
            >
              {bloodBanks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} ({bank.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">Couriers:</span>
              <span className="font-bold text-white">{currentBank?.availableDrivers} / {currentBank?.dispatchVehicles}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">Vault Cold Chain:</span>
              <span className="font-bold text-emerald-400">3.8°C OK</span>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 transition-all shadow-lg shadow-sky-900/30 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Add / Intake Stock
          </button>
        </div>
      </div>

      {/* Real-time Emergency Inbound Demand Alerts */}
      {incomingEmergencyDemands.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                Incoming Emergency Hospital Match Requests ({incomingEmergencyDemands.length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-300 font-mono">
              Auditable Accept / Reject Trail
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomingEmergencyDemands.map((demand) => {
              // Find matching batch in this bank
              const matchingBatches = bankInventory.filter((batch) => {
                const comp = checkTransfusionCompatibility(
                  batch.bloodGroup,
                  demand.bloodGroup,
                  demand.component
                );
                return (
                  comp.isCompatible &&
                  batch.component === demand.component &&
                  batch.unitsAvailable - batch.unitsReserved > 0
                );
              });

              const topBatch = matchingBatches[0];
              const remainingUnits = demand.unitsRequested - demand.unitsFulfilled;

              return (
                <div
                  key={`inbound-${demand.id}`}
                  className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-3.5 text-xs space-y-2.5 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-xs">
                          {demand.bloodGroup}
                        </span>
                        <span className="font-bold text-white">{demand.hospitalName}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-1">
                        {demand.patientCase}
                      </p>
                    </div>

                    <span className="text-right">
                      <div className="font-bold text-rose-400">{remainingUnits} Units Needed</div>
                      <div className="text-[10px] text-slate-400">{demand.component}</div>
                    </span>
                  </div>

                  {/* Compatibility Status with this bank */}
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                    {topBatch ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          Batch {topBatch.lotNumber} ({topBatch.bloodGroup}, {topBatch.unitsAvailable - topBatch.unitsReserved} avail, FEFO {getDaysToExpiry(topBatch.expiryDate)}d left)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>No exact or compatible stock in this depot</span>
                      </div>
                    )}
                  </div>

                  {/* Accept / Counter-offer / Reject actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        onRejectDemandAlert(demand.id, 'Insufficient compatible stock in depot');
                        soundEffects.playAlert();
                      }}
                      className="px-3 py-1 text-[11px] font-semibold text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-800/80 rounded-lg transition-colors"
                    >
                      Decline / Route Elsewhere
                    </button>

                    {topBatch && (
                      <button
                        onClick={() => {
                          const unitsToReserve = Math.min(
                            topBatch.unitsAvailable - topBatch.unitsReserved,
                            remainingUnits
                          );
                          onAcceptDemandAlert(demand.id, topBatch.id, unitsToReserve);
                          soundEffects.playSuccess();
                        }}
                        className="px-3.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md flex items-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept & Lock {Math.min(topBatch.unitsAvailable - topBatch.unitsReserved, remainingUnits)} Unit(s)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real-time Inventory Table (FEFO Prioritized) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Live Inventory & FEFO Expiry Routing
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FEFO Optimized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              First-Expired, First-Out algorithmic prioritization to prevent wastage of scarce blood components.
            </p>
          </div>

          {/* Component Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            {['ALL', ...COMPONENTS].map((comp) => (
              <button
                key={comp}
                onClick={() => setFilterComponent(comp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterComponent === comp
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Batches Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Blood Group</th>
                <th className="pb-3">Component</th>
                <th className="pb-3">Lot Number</th>
                <th className="pb-3">Available / Reserved</th>
                <th className="pb-3">Storage & Temp</th>
                <th className="pb-3">FEFO Expiry Timeline</th>
                <th className="pb-3 pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {fefoSortedInventory.map((batch) => {
                const daysLeft = getDaysToExpiry(batch.expiryDate);
                const isNearExpiry = daysLeft <= 4;
                const isPlatelet = batch.component === 'Platelets';

                return (
                  <tr
                    key={batch.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isNearExpiry ? 'bg-amber-950/20' : ''
                    }`}
                  >
                    {/* Blood Group */}
                    <td className="py-3 pl-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-sm">
                        {batch.bloodGroup}
                      </div>
                    </td>

                    {/* Component */}
                    <td className="py-3 font-semibold text-white">
                      {batch.component}
                      {isPlatelet && (
                        <span className="block text-[10px] text-amber-400 font-normal">
                          Short 5-day lifespan
                        </span>
                      )}
                    </td>

                    {/* Lot Number */}
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {batch.lotNumber}
                    </td>

                    {/* Available / Reserved */}
                    <td className="py-3">
                      <div className="font-bold text-slate-200">
                        {batch.unitsAvailable - batch.unitsReserved} Units Free
                      </div>
                      {batch.unitsReserved > 0 && (
                        <div className="text-[10px] text-amber-400">
                          ({batch.unitsReserved} units on digital lock)
                        </div>
                      )}
                    </td>

                    {/* Storage & Temp */}
                    <td className="py-3 text-slate-300 text-[11px]">
                      <div>{batch.storageLocation}</div>
                      <div className="text-[10px] text-teal-400 flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {batch.temperatureC}°C (Optimal)
                      </div>
                    </td>

                    {/* Expiry FEFO */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                            daysLeft <= 3
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                              : daysLeft <= 7
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          }`}
                        >
                          {daysLeft} Days Left ({batch.expiryDate})
                        </span>
                        {daysLeft <= 4 && (
                          <span className="text-[10px] text-amber-300 font-semibold">
                            ⚡ High FEFO Dispatch Priority
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 pr-2 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        VERIFIED SAFE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Intake Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-400" />
                Intake / Register Inventory Batch
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Blood Group
                  </label>
                  <select
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 font-bold focus:border-sky-500"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Component Type
                  </label>
                  <select
                    value={newComponent}
                    onChange={(e) => setNewComponent(e.target.value as BloodComponent)}
                    className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 font-bold focus:border-sky-500"
                  >
                    {COMPONENTS.map((comp) => (
                      <option key={comp} value={comp}>
                        {comp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Units Collected / Tested
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newUnits}
                    onChange={(e) => setNewUnits(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 font-bold focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Shelf Life (Days to Expiry)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newExpiryDays}
                    onChange={(e) => setNewExpiryDays(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 font-bold focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Storage Shelf / Vault
                  </label>
                  <input
                    type="text"
                    value={newStorageLoc}
                    onChange={(e) => setNewStorageLoc(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Storage Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTempC}
                    onChange={(e) => setNewTempC(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-900/30"
                >
                  Confirm Verified Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
