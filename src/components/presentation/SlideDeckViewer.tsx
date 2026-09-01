import React, { useState } from 'react';
import { UserRole } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Layers,
  Shield,
  Activity,
  Heart,
  Users,
  Database,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Truck,
  ExternalLink,
} from 'lucide-react';

interface SlideDeckViewerProps {
  onSwitchRole: (role: UserRole) => void;
  onTriggerScenario: (scenarioNumber: number) => void;
}

export const SlideDeckViewer: React.FC<SlideDeckViewerProps> = ({
  onSwitchRole,
  onTriggerScenario,
}) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 12;

  const nextSlide = () => setCurrentSlide((prev) => Math.min(totalSlides, prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(1, prev - 1));

  return (
    <div className="space-y-6">
      {/* Slide Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center font-bold text-rose-400 font-display">
            {currentSlide}/{totalSlides}
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">
              BloodBridge Presentation & Architectural Blueprint
            </h2>
            <p className="text-xs text-slate-400">
              Interactive companion matching the Phase 2 Hackathon PDF Specification
            </p>
          </div>
        </div>

        {/* Slide Controls & Quick Jump */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-300 px-2">
            Slide {currentSlide} of {totalSlides}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Content Frame */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[540px] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Background Art */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* SLIDE 1: Title Slide */}
        {currentSlide === 1 && (
          <div className="space-y-8 my-auto text-center sm:text-left">
            <div className="inline-block px-3 py-1 bg-slate-800 text-sky-400 text-xs font-mono font-bold rounded-lg border border-slate-700">
              PHASE 2 • HACKATHON TRACK: SOFTWARE
            </div>
            
            <div>
              <h1 className="text-4xl sm:text-6xl font-black text-white font-display tracking-tight">
                BLOOD<span className="text-rose-500">BRIDGE</span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-slate-200 font-display mt-2">
                Real-Time Blood Bank Demand Matching
              </p>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
                Connecting verified demand with compatible supply — in real time.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 inline-block text-xs">
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
                TEAM MEMBERS
              </span>
              <span className="font-bold text-white text-sm">
                ERAM KHAN • ROSHAN ALI
              </span>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => onSwitchRole('HOSPITAL')}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all"
              >
                <Play className="w-4 h-4" />
                Launch Live App Demo
              </button>
              <button
                onClick={() => setCurrentSlide(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
              >
                Browse Presentation Walkthrough →
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 2: Problem Statement */}
        {currentSlide === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Problem Statement</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                The real challenge is fragmented coordination across hospitals, blood banks and donors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-2xl">
                  ✚
                </div>
                <div className="text-slate-300 font-bold text-sm">Fragmented Coordination</div>
                <p className="text-xs text-slate-400">
                  Hospitals operate in silos, blood banks maintain separate ledgers, and donors are only contacted after severe delays.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Why shortages happen:</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Hospitals and blood banks often maintain separate records and communication channels.</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Critical cases require rapid confirmation for trauma, surgery and obstetric emergencies.</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Matching must consider compatibility, blood component, quantity and clinical requirements.</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Distance and transport time affect whether available stock is operationally useful.</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Poor coordination increases expiry-related wastage and delays targeted donor response.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-semibold">
              🎯 <strong>Goal:</strong> Turn fragmented information into actionable, verified matches.
            </div>
          </div>
        )}

        {/* SLIDE 3: Proposed Solution */}
        {currentSlide === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Proposed Solution — BloodBridge</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                A live coordination platform built around verified demand, compatible inventory and targeted donor fallback.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              Instead of a static blood list, BloodBridge continuously matches verified demand with compatible, usable inventory and eligible donors using urgency, component type, and FEFO expiry routing.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mx-auto">✚</div>
                <div className="font-bold text-white text-xs">Verified Demand</div>
                <div className="text-[11px] text-slate-400">Create & verify request</div>
                <div className="text-[10px] font-bold text-rose-400 uppercase pt-2 border-t border-slate-800">MATCH: Compatibility + urgency</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold mx-auto">⚙</div>
                <div className="font-bold text-white text-xs">Smart Match</div>
                <div className="text-[11px] text-slate-400">Rank candidates</div>
                <div className="text-[10px] font-bold text-sky-400 uppercase pt-2 border-t border-slate-800">RESPOND: Instant alerts</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mx-auto">🏛</div>
                <div className="font-bold text-white text-xs">Compatible Inventory</div>
                <div className="text-[11px] text-slate-400">Reserve & confirm</div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase pt-2 border-t border-slate-800">PREVENT WASTE: Expiry-aware routing</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mx-auto">👤</div>
                <div className="font-bold text-white text-xs">Donor Fallback</div>
                <div className="text-[11px] text-slate-400">Notify eligible donors</div>
                <div className="text-[10px] font-bold text-amber-400 uppercase pt-2 border-t border-slate-800">CLOSE LOOP: Track to fulfillment</div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: End-to-End Workflow */}
        {currentSlide === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">End-to-End Workflow</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                A complete operational flow from request creation to fulfillment and automatic closure.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
              {[
                { step: '1', title: 'Hospital posts demand', sub: 'Group • component • units • urgency', color: 'text-rose-400 bg-rose-500/20' },
                { step: '2', title: 'Verification', sub: 'Institution & inventory validation', color: 'text-sky-400 bg-sky-500/20' },
                { step: '3', title: 'Compatibility filter', sub: 'Configured clinical rules', color: 'text-teal-400 bg-teal-500/20' },
                { step: '4', title: 'Real-time matching', sub: 'Urgency • ETA • expiry • quantity', color: 'text-amber-400 bg-amber-500/20' },
                { step: '5', title: 'Instant notification', sub: 'Accept / reject / update', color: 'text-rose-400 bg-rose-500/20' },
                { step: '6', title: 'Donor fallback', sub: 'Only if shortage remains', color: 'text-purple-400 bg-purple-500/20' },
                { step: '7', title: 'Fulfillment', sub: 'Close request & cancel alerts', color: 'text-emerald-400 bg-emerald-500/20' },
              ].map((s) => (
                <div key={s.step} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 flex flex-col justify-between">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${s.color}`}>
                    {s.step}
                  </div>
                  <div className="font-bold text-white text-[11px]">{s.title}</div>
                  <div className="text-[10px] text-slate-400">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
              🔄 <strong>Closed-Loop Tracking:</strong> Ensures reservations, fulfillment status and outstanding alerts remain synchronized across all devices.
            </div>
          </div>
        )}

        {/* SLIDE 5: Features Implemented / MVP Design */}
        {currentSlide === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Features Implemented / MVP Design</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Core product capabilities defined in the submitted Phase 1 solution.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { title: 'Real-time Dashboard', desc: 'Live requests by criticality', icon: '✚', role: 'HOSPITAL' },
                { title: 'Smart Matching', desc: 'Compatibility → urgency → ETA', icon: '⚙', role: 'HOSPITAL' },
                { title: 'Inventory & Expiry', desc: 'FEFO-style prioritization', icon: '💧', role: 'BLOOD_BANK' },
                { title: 'Emergency Alerting', desc: 'Auditable accept/reject trail', icon: '🔔', role: 'BLOOD_BANK' },
                { title: 'Donor Matching', desc: 'Opt-in targeted notifications', icon: '👤', role: 'DONOR' },
                { title: 'Partial Fulfillment', desc: 'Reserve available units first', icon: '🏛', role: 'BLOOD_BANK' },
                { title: 'Closed-loop Tracking', desc: 'Prevent duplicate actions', icon: '✓', role: 'ADMIN' },
                { title: 'Admin Analytics', desc: 'Metrics + audit visibility', icon: '📊', role: 'ADMIN' },
              ].map((f) => (
                <div
                  key={f.title}
                  onClick={() => onSwitchRole(f.role as UserRole)}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="text-base">{f.icon}</div>
                  <div className="font-bold text-white group-hover:text-rose-400 transition-colors">
                    {f.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{f.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase">
              <span className="px-2.5 py-1 rounded bg-sky-950 text-sky-400 border border-sky-800">ROLE-BASED ACCESS</span>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">LIVE UPDATES</span>
              <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800">AUDIT TRAIL</span>
              <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800">TARGETED ALERTS</span>
            </div>
          </div>
        )}

        {/* SLIDE 6: Technical Architecture */}
        {currentSlide === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Technical Architecture</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Event-driven architecture with live synchronization across services.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs text-sky-300 font-bold">
              USERS • Hospital • Blood Bank • Donor • Admin
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-400">Frontend</div>
                <div className="text-white font-semibold">React / Next.js</div>
                <div className="text-slate-400 text-[11px]">Responsive dashboard</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-teal-400">API Layer</div>
                <div className="text-white font-semibold">FastAPI / Node.js</div>
                <div className="text-slate-400 text-[11px]">Auth + validation</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">Matching Engine</div>
                <div className="text-white font-semibold">Compatibility • Urgency</div>
                <div className="text-slate-400 text-[11px]">ETA • Expiry • Qty</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-rose-400">Inventory Service</div>
                <div className="text-white font-semibold">Real-time Stock</div>
                <div className="text-slate-400 text-[11px]">Reservations lock</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs font-mono text-slate-300">
              Data flow: Demand → Validation → Compatibility → Inventory Search → Reservation → Notification → Fulfillment → Audit
            </div>
          </div>
        )}

        {/* SLIDE 7: Matching Logic / Intelligence */}
        {currentSlide === 7 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Matching Logic / Intelligence</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Transparent weighted scoring for operational prioritization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Example Match Score Chart */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-xs uppercase tracking-wider">Example Match Score Breakdown:</div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-rose-400 font-bold">Urgency (40%)</span>
                      <span className="font-mono">Critical requests prioritized</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[40%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sky-400 font-bold">Compatibility (25%)</span>
                      <span className="font-mono">Clinical rule matrix</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full w-[25%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-teal-400 font-bold">ETA / Distance (15%)</span>
                      <span className="font-mono">Faster verified supply</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full w-[15%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-400 font-bold">Expiry FEFO (10%)</span>
                      <span className="font-mono">Reduce wastage</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[10%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-emerald-400 font-bold">Quantity Coverage (10%)</span>
                      <span className="font-mono">Request coverage</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[10%]" />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  ⚡ Rule-based MVP = 100% Explainable & Safer
                </div>
              </div>

              {/* Ranking Rules */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-white">How candidates are ranked:</div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <strong className="text-rose-400">Urgency:</strong> Critical trauma cases receive highest operational priority.
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <strong className="text-sky-400">Compatibility:</strong> Only clinically permitted combinations enter scoring.
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <strong className="text-teal-400">ETA / distance:</strong> Faster verified supply is ranked higher.
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400">Expiry priority:</strong> Suitable near-expiry units help reduce wastage (FEFO).
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-400">Quantity coverage:</strong> Greater request coverage improves score.
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 italic text-center">
              "Final clinical/transfusion decisions remain with authorized healthcare professionals."
            </div>
          </div>
        )}

        {/* SLIDE 8: Technology Stack */}
        {currentSlide === 8 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Technology Stack</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                A clean full-stack blueprint for the BloodBridge MVP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-3">
                <div className="font-bold text-rose-400 uppercase tracking-wider text-xs">Experience</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-white font-bold">Frontend</div>
                    <div className="text-slate-400">React 19 + TypeScript + Tailwind</div>
                  </div>
                  <div>
                    <div className="text-white font-bold">Maps / ETA</div>
                    <div className="text-slate-400">Vector Radar + Transit Engine</div>
                  </div>
                  <div>
                    <div className="text-white font-bold">Notifications</div>
                    <div className="text-slate-400">Instant Alert Engine + Web Audio</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-3">
                <div className="font-bold text-sky-400 uppercase tracking-wider text-xs">Core Platform</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-white font-bold">Backend Logic</div>
                    <div className="text-slate-400">FastAPI / Node.js Engine</div>
                  </div>
                  <div>
                    <div className="text-white font-bold">Database</div>
                    <div className="text-slate-400">PostgreSQL / State Sync</div>
                  </div>
                  <div>
                    <div className="text-white font-bold">Authentication</div>
                    <div className="text-slate-400">JWT + Multi-Role RBAC</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="font-bold text-emerald-400 uppercase tracking-wider text-xs">Infrastructure</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-white font-bold">Real-time</div>
                    <div className="text-slate-400">Event-driven live queues</div>
                  </div>
                  <div>
                    <div className="text-white font-bold">Deployment</div>
                    <div className="text-slate-400">Docker + Cloud Container</div>
                  </div>
                  <div>
                    <div className="text-white font-bold">Monitoring</div>
                    <div className="text-slate-400">Immutable Audit Logs + Telemetry</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-slate-400">
              Designed for responsive dashboards, live coordination, scalable deployment and operational reliability.
            </div>
          </div>
        )}

        {/* SLIDE 9: Progress Made & Implementation Plan */}
        {currentSlide === 9 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Progress Made & Implementation Plan</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Separating established Phase 1 work from the roadmap keeps the presentation credible and transparent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 uppercase tracking-wider">Established in Phase 1:</div>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Problem and coordination gap defined</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Role-based BloodBridge concept</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> End-to-end workflow specified</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Event-driven architecture designed</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Transparent matching logic defined</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Technology stack selected</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Security & reliability principles documented</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2">
                <div className="font-bold text-rose-400 uppercase tracking-wider">Implementation Roadmap (Phase 2 MVP):</div>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">1</span> Role-based login & dashboards</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">2</span> Database models & audit logs</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">3</span> Compatibility + scoring engine</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">4</span> Live event synchronization</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">5</span> Push notification workflow</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">6</span> Map-based ETA + partial fulfillment</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">7</span> Admin analytics + demo dataset</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 10: Security, Privacy & Reliability */}
        {currentSlide === 10 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Security, Privacy & Reliability</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Healthcare coordination requires trust, controlled access and operational resilience.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400">✓ Role-based access</div>
                <div className="text-slate-400 text-[11px]">Users see only role-relevant information.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-400">Encrypted communication</div>
                <div className="text-slate-400 text-[11px]">HTTPS/TLS and protection of data at rest.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-teal-400">Audit trail</div>
                <div className="text-slate-400 text-[11px]">Inventory changes and responses remain traceable.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">Donor consent</div>
                <div className="text-slate-400 text-[11px]">Opt-in / opt-out with privacy-aware location handling.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-purple-400">Graceful reliability</div>
                <div className="text-slate-400 text-[11px]">Backups, monitoring and rate limiting.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-rose-400">Clinical governance</div>
                <div className="text-slate-400 text-[11px]">Compatibility rules remain configurable and reviewed.</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-semibold">
              🔒 <strong>Privacy Principle:</strong> Use approximate donor location until operational coordination is authorized.
            </div>
          </div>
        )}

        {/* SLIDE 11: Expected Impact & Comparison */}
        {currentSlide === 11 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Expected Impact & Why BloodBridge Is Different</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                A visual comparison of the current workflow versus the proposed model.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-400 uppercase">Typical Approach</div>
                <ul className="space-y-1.5 text-slate-400">
                  <li>• Static blood availability lists</li>
                  <li>• Manual calls / WhatsApp</li>
                  <li>• Only donor search</li>
                  <li>• Nearest unit only</li>
                  <li>• No closed-loop status</li>
                  <li>• Opaque AI</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-2">
                <div className="font-bold text-rose-400 uppercase">BloodBridge Platform</div>
                <ul className="space-y-1.5 text-slate-200">
                  <li className="flex items-center gap-1.5"><span className="text-rose-500 font-bold">•</span> Live event-driven availability</li>
                  <li className="flex items-center gap-1.5"><span className="text-rose-500 font-bold">•</span> Structured demand → match → notify</li>
                  <li className="flex items-center gap-1.5"><span className="text-rose-500 font-bold">•</span> Inventory-first + donor fallback</li>
                  <li className="flex items-center gap-1.5"><span className="text-rose-500 font-bold">•</span> Multi-factor operational ranking</li>
                  <li className="flex items-center gap-1.5"><span className="text-rose-500 font-bold">•</span> Reservation to closure tracking</li>
                  <li className="flex items-center gap-1.5"><span className="text-rose-500 font-bold">•</span> Transparent rule-based MVP</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-rose-400 font-bold">Seconds</div>
                <div className="text-[10px] text-slate-400">Match generation</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-emerald-400 font-bold">Live</div>
                <div className="text-[10px] text-slate-400">Status propagation</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-sky-400 font-bold">Zero</div>
                <div className="text-[10px] text-slate-400">Incompatible alerts</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-amber-400 font-bold">Audit</div>
                <div className="text-[10px] text-slate-400">Complete traceability</div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 12: Hackathon Demo Scenario & Future Roadmap */}
        {currentSlide === 12 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Hackathon Demo Scenario & Future Roadmap</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                End with a compelling demo story and a realistic expansion path.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Demo Storyboard */}
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-2">
                <div className="font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Demo Storyboard (Live in App):</span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded">Ready</span>
                </div>
                <ol className="space-y-1.5 text-slate-300 list-decimal list-inside text-[11px]">
                  <li>Critical request created by Hospital</li>
                  <li>Nearby verified inventory appears automatically</li>
                  <li>Engine filters & ranks matches using 5-factor scoring</li>
                  <li>Best blood bank accepts alert & locks stock</li>
                  <li>Partial stock reserved if needed</li>
                  <li>Eligible donors notified on remaining shortage</li>
                  <li>Request fulfilled & outstanding alerts cancelled</li>
                </ol>
                <button
                  onClick={() => onTriggerScenario(1)}
                  className="w-full mt-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run Scenario 1 (Massive Trauma O-)
                </button>
              </div>

              {/* Expansion Roadmap */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30 space-y-1">
                  <div className="font-bold text-sky-400">Phase 2 — Pilot</div>
                  <ul className="text-slate-300 text-[11px] space-y-0.5">
                    <li>• Verified inventory feeds</li>
                    <li>• Institutional authentication</li>
                    <li>• Consent & stronger audit controls</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1">
                  <div className="font-bold text-purple-400">Phase 3 — Intelligence</div>
                  <ul className="text-slate-300 text-[11px] space-y-0.5">
                    <li>• Demand forecasting</li>
                    <li>• Shortage-risk prediction</li>
                    <li>• Anomaly detection</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-center border border-amber-500/30">
              <span className="text-amber-400 font-bold font-display text-sm tracking-wide">
                “Right demand. Right supply. Right time.”
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>BLOODBRIDGE / PHASE 2 — Slide {currentSlide}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 1}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200"
            >
              Previous
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
