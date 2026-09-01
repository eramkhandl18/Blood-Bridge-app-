import React, { useState } from 'react';
import {
  UserRole,
  Hospital,
  BloodBank,
  InventoryBatch,
  Donor,
  DemandRequest,
  AuditEntry,
  MatchCandidate,
  MatchingWeights,
} from './types';
import {
  INITIAL_HOSPITALS,
  INITIAL_BLOOD_BANKS,
  INITIAL_INVENTORY,
  INITIAL_DONORS,
  INITIAL_DEMANDS,
  INITIAL_AUDIT_TRAIL,
} from './data/initialData';
import { DEFAULT_WEIGHTS } from './utils/matchingEngine';
import { soundEffects } from './utils/audio';
import { Header } from './components/Header';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { BloodBankDashboard } from './components/bloodbank/BloodBankDashboard';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SlideDeckViewer } from './components/presentation/SlideDeckViewer';
import { CompatibilityModal } from './components/common/CompatibilityModal';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, X } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('HOSPITAL');
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(INITIAL_BLOOD_BANKS);
  const [inventory, setInventory] = useState<InventoryBatch[]>(INITIAL_INVENTORY);
  const [donors, setDonors] = useState<Donor[]>(INITIAL_DONORS);
  const [demands, setDemands] = useState<DemandRequest[]>(INITIAL_DEMANDS);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>(INITIAL_AUDIT_TRAIL);
  const [matchingWeights, setMatchingWeights] = useState<MatchingWeights>(DEFAULT_WEIGHTS);

  // Active selections
  const [currentHospitalId, setCurrentHospitalId] = useState<string>(INITIAL_HOSPITALS[0].id);
  const [currentBloodBankId, setCurrentBloodBankId] = useState<string>(INITIAL_BLOOD_BANKS[0].id);
  const [currentDonorId, setCurrentDonorId] = useState<string>(INITIAL_DONORS[0].id);

  // UI Modals & Settings
  const [isCompatModalOpen, setIsCompatModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveBanner, setLiveBanner] = useState<{
    id: string;
    text: string;
    type: 'ALERT' | 'SUCCESS' | 'INFO';
  } | null>(null);

  const showBanner = (text: string, type: 'ALERT' | 'SUCCESS' | 'INFO' = 'INFO') => {
    const id = Date.now().toString();
    setLiveBanner({ id, text, type });
    setTimeout(() => {
      setLiveBanner((curr) => (curr?.id === id ? null : curr));
    }, 6000);
  };

  const addAuditLog = (
    action: string,
    actorRole: 'HOSPITAL' | 'BLOOD_BANK' | 'DONOR' | 'SYSTEM' | 'ADMIN',
    actorName: string,
    details: string,
    status: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO'
  ) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newEntry: AuditEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      action,
      actorRole,
      actorName,
      details,
      status,
    };
    setAuditTrail((prev) => [newEntry, ...prev]);
  };

  // 1. Hospital creates new demand
  const handleCreateDemand = (newDemandData: Partial<DemandRequest>) => {
    const demandId = `DEMAND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toTimeString().split(' ')[0];

    const initialAudit: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      action: 'DEMAND_PUBLISHED',
      actorRole: 'HOSPITAL',
      actorName: newDemandData.hospitalName || 'Hospital Staff',
      details: `Emergency demand for ${newDemandData.unitsRequested} units of ${newDemandData.bloodGroup} ${newDemandData.component} published.`,
      status: 'ALERT',
    };

    const newDemand: DemandRequest = {
      id: demandId,
      hospitalId: newDemandData.hospitalId || currentHospitalId,
      hospitalName: newDemandData.hospitalName || 'Metro City Trauma & Medical Center',
      patientCase: newDemandData.patientCase || 'Emergency Transfusion Request',
      patientAge: newDemandData.patientAge || 30,
      patientGender: newDemandData.patientGender || 'M',
      bloodGroup: newDemandData.bloodGroup || 'O-',
      component: newDemandData.component || 'Packed RBCs',
      unitsRequested: newDemandData.unitsRequested || 2,
      unitsFulfilled: 0,
      urgency: newDemandData.urgency || 'CRITICAL_TRAUMA',
      requiredWithinHours: newDemandData.requiredWithinHours || 2,
      status: 'PENDING_MATCH',
      createdAt: new Date().toISOString(),
      location: newDemandData.location || {
        lat: 40.7128,
        lng: -74.006,
        address: '450 Lexington Ave',
        city: 'Central Metro',
      },
      clinicalNotes: newDemandData.clinicalNotes || 'Clinical validation confirmed.',
      auditLog: [initialAudit],
      reservations: [],
      donorAlerts: [],
    };

    setDemands((prev) => [newDemand, ...prev]);
    addAuditLog(
      'DEMAND_PUBLISHED',
      'HOSPITAL',
      newDemand.hospitalName,
      `Broadcasted ${newDemand.unitsRequested} units ${newDemand.bloodGroup} ${newDemand.component} under Code Red priority.`,
      'ALERT'
    );
    showBanner(`New Demand Broadcasted: ${newDemand.unitsRequested} Units ${newDemand.bloodGroup} (${newDemand.patientCase})`, 'ALERT');
  };

  // 2. Reserve / Smart Match Accept
  const handleReserveMatch = (
    demandId: string,
    candidate: MatchCandidate,
    unitsToReserve: number
  ) => {
    setDemands((prev) =>
      prev.map((d) => {
        if (d.id !== demandId) return d;

        const newFulfilled = Math.min(d.unitsRequested, d.unitsFulfilled + unitsToReserve);
        const isComplete = newFulfilled >= d.unitsRequested;
        const newStatus = isComplete ? 'DISPATCHED' : 'PARTIALLY_FULFILLED';

        const reservation = {
          id: `res-${Date.now()}`,
          bloodBankId: candidate.sourceId,
          bloodBankName: candidate.sourceName,
          units: unitsToReserve,
          bloodGroup: candidate.bloodGroup,
          component: candidate.component,
          reservedAt: new Date().toISOString(),
          status: 'DISPATCHED' as const,
          etaMinutes: candidate.etaMinutes,
        };

        return {
          ...d,
          unitsFulfilled: newFulfilled,
          status: newStatus,
          reservations: [...d.reservations, reservation],
        };
      })
    );

    // Update Inventory Batch
    if (candidate.batchId) {
      setInventory((prev) =>
        prev.map((b) => {
          if (b.id !== candidate.batchId) return b;
          return {
            ...b,
            unitsReserved: b.unitsReserved + unitsToReserve,
          };
        })
      );
    }

    addAuditLog(
      'STOCK_RESERVED_AND_DISPATCHED',
      'BLOOD_BANK',
      candidate.sourceName,
      `Locked & dispatched ${unitsToReserve} units (${candidate.bloodGroup}) to hospital with ETA ~${candidate.etaMinutes} mins.`,
      'SUCCESS'
    );
    showBanner(`Reserved ${unitsToReserve} Units from ${candidate.sourceName} (ETA ~${candidate.etaMinutes} mins)`, 'SUCCESS');
  };

  // 3. Trigger Donor Fallback
  const handleTriggerDonorFallback = (demandId: string) => {
    const demand = demands.find((d) => d.id === demandId);
    if (!demand) return;

    // Find eligible matching donors
    const matchingDonors = donors.filter(
      (donor) =>
        donor.eligible &&
        donor.optInEmergencyAlerts &&
        (donor.bloodGroup === demand.bloodGroup || donor.bloodGroup === 'O-')
    );

    const newDonorAlerts = matchingDonors.slice(0, 3).map((donor) => ({
      id: `da-${donor.id}-${Date.now()}`,
      donorId: donor.id,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      distanceKm: donor.distanceKm,
      status: 'NOTIFIED' as const,
      notifiedAt: new Date().toISOString(),
      responseEtaMinutes: 25,
    }));

    setDemands((prev) =>
      prev.map((d) => {
        if (d.id !== demandId) return d;
        return {
          ...d,
          status: 'DONOR_FALLBACK_ACTIVE',
          donorAlerts: [...d.donorAlerts, ...newDonorAlerts],
        };
      })
    );

    soundEffects.playEmergencySirens();
    addAuditLog(
      'DONOR_FALLBACK_ACTIVATED',
      'SYSTEM',
      'BloodBridge Fallback Engine',
      `Summoned ${newDonorAlerts.length} verified opt-in donors within metropolitan radius for Demand #${demand.id}.`,
      'ALERT'
    );
    showBanner(`Targeted Donor Fallback Summoned: ${newDonorAlerts.length} Verified Donors Alerted via Push/SMS`, 'ALERT');
  };

  // 4. Mark Fulfilled (Closed-loop closure)
  const handleFulfillDemand = (demandId: string) => {
    setDemands((prev) =>
      prev.map((d) => {
        if (d.id !== demandId) return d;
        return {
          ...d,
          status: 'FULFILLED',
          unitsFulfilled: d.unitsRequested,
          donorAlerts: d.donorAlerts.map((a) => ({ ...a, status: 'ACCEPTED' as const })),
        };
      })
    );

    addAuditLog(
      'DEMAND_CLOSED_LOOP_FULFILLED',
      'HOSPITAL',
      'Transfusion Unit',
      `Demand #${demandId} fully fulfilled and verified. Outstanding donor alerts automatically cancelled.`,
      'SUCCESS'
    );
    showBanner(`Demand #${demandId} Successfully Fulfilled & Closed-Loop Synchronized!`, 'SUCCESS');
  };

  // 5. Blood Bank add inventory
  const handleAddInventory = (batchData: Partial<InventoryBatch>) => {
    const newBatch: InventoryBatch = {
      id: `inv-${Date.now()}`,
      bloodBankId: batchData.bloodBankId || currentBloodBankId,
      bloodBankName: batchData.bloodBankName || 'Red Cross Central',
      bloodGroup: batchData.bloodGroup || 'O-',
      component: batchData.component || 'Packed RBCs',
      unitsAvailable: batchData.unitsAvailable || 5,
      unitsReserved: 0,
      collectionDate: batchData.collectionDate || new Date().toISOString().split('T')[0],
      expiryDate: batchData.expiryDate || new Date().toISOString().split('T')[0],
      storageLocation: batchData.storageLocation || 'Vault-A',
      temperatureC: batchData.temperatureC || 3.9,
      testedStatus: 'VERIFIED_SAFE',
      lotNumber: batchData.lotNumber || `LOT-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setInventory((prev) => [newBatch, ...prev]);
    addAuditLog(
      'STOCK_INTAKE_VERIFIED',
      'BLOOD_BANK',
      newBatch.bloodBankName,
      `Intake verified for ${newBatch.unitsAvailable} units ${newBatch.bloodGroup} ${newBatch.component} (Lot: ${newBatch.lotNumber}).`,
      'SUCCESS'
    );
    showBanner(`Verified Batch Added: ${newBatch.unitsAvailable} Units ${newBatch.bloodGroup} ${newBatch.component}`, 'SUCCESS');
  };

  // 6. Blood Bank Accept Alert
  const handleAcceptDemandAlert = (demandId: string, batchId: string, units: number) => {
    const targetBatch = inventory.find((b) => b.id === batchId);
    if (!targetBatch) return;

    setDemands((prev) =>
      prev.map((d) => {
        if (d.id !== demandId) return d;
        const newFulfilled = Math.min(d.unitsRequested, d.unitsFulfilled + units);
        return {
          ...d,
          unitsFulfilled: newFulfilled,
          status: newFulfilled >= d.unitsRequested ? 'DISPATCHED' : 'PARTIALLY_FULFILLED',
          reservations: [
            ...d.reservations,
            {
              id: `res-${Date.now()}`,
              bloodBankId: targetBatch.bloodBankId,
              bloodBankName: targetBatch.bloodBankName,
              units,
              bloodGroup: targetBatch.bloodGroup,
              component: targetBatch.component,
              reservedAt: new Date().toISOString(),
              status: 'DISPATCHED',
              etaMinutes: 14,
            },
          ],
        };
      })
    );

    setInventory((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        return { ...b, unitsReserved: b.unitsReserved + units };
      })
    );

    addAuditLog(
      'ALERT_ACCEPTED_AND_LOCKED',
      'BLOOD_BANK',
      targetBatch.bloodBankName,
      `Accepted emergency alert for Demand #${demandId}. Reserved ${units} units (Lot ${targetBatch.lotNumber}).`,
      'SUCCESS'
    );
    showBanner(`Alert Accepted: ${units} Units Reserved and Dispatched (ETA ~14m)`, 'SUCCESS');
  };

  // 7. Blood Bank Reject Alert
  const handleRejectDemandAlert = (demandId: string, reason: string) => {
    addAuditLog(
      'ALERT_DECLINED_RE_ROUTED',
      'BLOOD_BANK',
      bloodBanks.find((b) => b.id === currentBloodBankId)?.name || 'Blood Bank',
      `Declined Demand #${demandId}: "${reason}". Matching engine re-routing to alternate depots.`,
      'WARNING'
    );
    showBanner(`Alert Declined: System re-routing demand to backup regional facilities.`, 'INFO');
  };

  // 8. Donor Responds
  const handleDonorRespond = (
    demandId: string,
    donorId: string,
    status: 'ACCEPTED' | 'DECLINED',
    etaMins: number
  ) => {
    const donor = donors.find((d) => d.id === donorId);
    if (!donor) return;

    setDemands((prev) =>
      prev.map((d) => {
        if (d.id !== demandId) return d;
        const exists = d.donorAlerts.some((a) => a.donorId === donorId);
        const updatedAlerts = exists
          ? d.donorAlerts.map((a) =>
              a.donorId === donorId ? { ...a, status, responseEtaMinutes: etaMins } : a
            )
          : [
              ...d.donorAlerts,
              {
                id: `da-${donorId}-${Date.now()}`,
                donorId,
                donorName: donor.name,
                bloodGroup: donor.bloodGroup,
                distanceKm: donor.distanceKm,
                status,
                notifiedAt: new Date().toISOString(),
                responseEtaMinutes: etaMins,
              },
            ];

        return {
          ...d,
          donorAlerts: updatedAlerts,
        };
      })
    );

    addAuditLog(
      status === 'ACCEPTED' ? 'DONOR_SUMMONS_CONFIRMED' : 'DONOR_DECLINED',
      'DONOR',
      donor.name,
      status === 'ACCEPTED'
        ? `Donor confirmed emergency arrival (ETA ~${etaMins} mins, Distance ${donor.distanceKm} km).`
        : `Donor unavailable for current alert.`,
      status === 'ACCEPTED' ? 'SUCCESS' : 'INFO'
    );
    showBanner(
      status === 'ACCEPTED'
        ? `Donor ${donor.name} Confirmed En Route! (ETA ~${etaMins} mins)`
        : `Donor response recorded.`,
      status === 'ACCEPTED' ? 'SUCCESS' : 'INFO'
    );
  };

  // 9. Donor Toggle Alerts
  const handleToggleDonorAlerts = (donorId: string, optIn: boolean) => {
    setDonors((prev) =>
      prev.map((d) => (d.id === donorId ? { ...d, optInEmergencyAlerts: optIn } : d))
    );
    const donor = donors.find((d) => d.id === donorId);
    addAuditLog(
      'DONOR_CONSENT_UPDATED',
      'DONOR',
      donor?.name || 'Donor',
      `Emergency broadcast alerts set to ${optIn ? 'OPTED-IN' : 'MUTED'}.`,
      'INFO'
    );
    showBanner(`Emergency Push Alerts ${optIn ? 'Enabled' : 'Muted'} for ${donor?.name}`, 'INFO');
  };

  // 10. Run Demo Scenarios (Slide 12 Storyboard)
  const handleTriggerScenario = (scenarioNumber: number) => {
    if (scenarioNumber === 1) {
      // Scenario 1: Critical O- Trauma Emergency
      setCurrentRole('HOSPITAL');
      handleCreateDemand({
        hospitalId: 'hosp-1',
        hospitalName: 'Metro City Trauma & Medical Center',
        patientCase: 'Massive Trauma / Hemorrhagic Shock — Level 1 ER',
        patientAge: 28,
        patientGender: 'F',
        bloodGroup: 'O-',
        component: 'Packed RBCs',
        unitsRequested: 4,
        urgency: 'CRITICAL_TRAUMA',
        requiredWithinHours: 1,
        clinicalNotes: 'Emergent uncrossmatched O- transfusion order under Code Red Protocol.',
      });
      soundEffects.playAlert();
    } else if (scenarioNumber === 2) {
      // Scenario 2: Platelet Shortfall + Donor Fallback
      setCurrentRole('HOSPITAL');
      handleCreateDemand({
        hospitalId: 'hosp-2',
        hospitalName: 'St. Jude General & Maternity Hospital',
        patientCase: 'Severe Obstetric Postpartum Hemorrhage (PPH)',
        patientAge: 31,
        patientGender: 'F',
        bloodGroup: 'A-',
        component: 'Platelets',
        unitsRequested: 3,
        urgency: 'CRITICAL_TRAUMA',
        requiredWithinHours: 2,
        clinicalNotes: 'Platelet consumptive coagulopathy in active delivery.',
      });
      setTimeout(() => {
        const latest = demands[0]?.id;
        if (latest) handleTriggerDonorFallback(latest);
      }, 500);
    } else if (scenarioNumber === 3) {
      // Scenario 3: FEFO Wastage Prevention
      setCurrentRole('BLOOD_BANK');
      showBanner('Highlighting FEFO-sorted batches nearing safe expiration window (Slide 7)', 'INFO');
    } else if (scenarioNumber === 4) {
      // Scenario 4: Multi-Unit Disaster Emergency
      setCurrentRole('ADMIN');
      handleCreateDemand({
        hospitalId: 'hosp-3',
        hospitalName: 'Apex Children’s & Surgical Institute',
        patientCase: 'Metro Rapid Transit Multi-Casualty Incident',
        patientAge: 45,
        patientGender: 'M',
        bloodGroup: 'O+',
        component: 'Packed RBCs',
        unitsRequested: 8,
        urgency: 'CRITICAL_TRAUMA',
        requiredWithinHours: 1,
        clinicalNotes: 'Disaster response protocol activated across regional trauma network.',
      });
      soundEffects.playEmergencySirens();
    }
  };

  // Reset Demo State
  const handleResetDemo = () => {
    setHospitals(INITIAL_HOSPITALS);
    setBloodBanks(INITIAL_BLOOD_BANKS);
    setInventory(INITIAL_INVENTORY);
    setDonors(INITIAL_DONORS);
    setDemands(INITIAL_DEMANDS);
    setAuditTrail(INITIAL_AUDIT_TRAIL);
    setMatchingWeights(DEFAULT_WEIGHTS);
    soundEffects.playSuccess();
    showBanner('System reset to baseline Phase 2 demonstration state.', 'SUCCESS');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
    if (next) soundEffects.playSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        demands={demands}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetDemo={handleResetDemo}
        onOpenCompatibilityModal={() => setIsCompatModalOpen(true)}
        onTriggerScenario={handleTriggerScenario}
      />

      {/* Floating System Notification Toast */}
      {liveBanner && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
              liveBanner.type === 'ALERT'
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-100 shadow-rose-950/50'
                : liveBanner.type === 'SUCCESS'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100 shadow-emerald-950/50'
                : 'bg-slate-900/90 border-sky-500/60 text-slate-100 shadow-sky-950/50'
            }`}
          >
            <div className="mt-0.5">
              {liveBanner.type === 'ALERT' && <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />}
              {liveBanner.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {liveBanner.type === 'INFO' && <Bell className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {liveBanner.text}
            </div>
            <button
              onClick={() => setLiveBanner(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Role 1: Hospital Dashboard */}
        {currentRole === 'HOSPITAL' && (
          <HospitalDashboard
            hospitals={hospitals}
            demands={demands}
            inventory={inventory}
            donors={donors}
            currentHospitalId={currentHospitalId}
            onHospitalChange={setCurrentHospitalId}
            onCreateDemand={handleCreateDemand}
            onReserveMatch={handleReserveMatch}
            onTriggerDonorFallback={handleTriggerDonorFallback}
            onFulfillDemand={handleFulfillDemand}
            onOpenCompatibilityModal={() => setIsCompatModalOpen(true)}
          />
        )}

        {/* Role 2: Blood Bank Dashboard */}
        {currentRole === 'BLOOD_BANK' && (
          <BloodBankDashboard
            bloodBanks={bloodBanks}
            currentBloodBankId={currentBloodBankId}
            onBloodBankChange={setCurrentBloodBankId}
            inventory={inventory}
            demands={demands}
            onAddInventory={handleAddInventory}
            onAcceptDemandAlert={handleAcceptDemandAlert}
            onRejectDemandAlert={handleRejectDemandAlert}
          />
        )}

        {/* Role 3: Donor Portal */}
        {currentRole === 'DONOR' && (
          <DonorDashboard
            donors={donors}
            currentDonorId={currentDonorId}
            onDonorChange={setCurrentDonorId}
            demands={demands}
            onDonorRespond={handleDonorRespond}
            onToggleAlerts={handleToggleDonorAlerts}
          />
        )}

        {/* Role 4: Admin Hub & Analytics */}
        {currentRole === 'ADMIN' && (
          <AdminDashboard
            auditTrail={auditTrail}
            demands={demands}
            inventory={inventory}
            donors={donors}
            hospitals={hospitals}
            bloodBanks={bloodBanks}
            weights={matchingWeights}
            onUpdateWeights={setMatchingWeights}
            onResetWeights={() => setMatchingWeights(DEFAULT_WEIGHTS)}
          />
        )}

        {/* Role 5: PDF Slide Deck Companion (12 Slides) */}
        {currentRole === 'PRESENTATION_MODE' && (
          <SlideDeckViewer
            onSwitchRole={setCurrentRole}
            onTriggerScenario={handleTriggerScenario}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">BLOODBRIDGE</span>
            <span>•</span>
            <span>Real-Time Blood Bank Demand Matching (Phase 2 MVP)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Team: Eram Khan • Roshan Ali</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">FEFO & Closed-Loop Engine Active</span>
          </div>
        </div>
      </footer>

      {/* Clinical Compatibility Rules Matrix Modal */}
      <CompatibilityModal
        isOpen={isCompatModalOpen}
        onClose={() => setIsCompatModalOpen(false)}
      />
    </div>
  );
}
