export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponent =
  | 'Whole Blood'
  | 'Packed RBCs'
  | 'Platelets'
  | 'Fresh Frozen Plasma'
  | 'Cryoprecipitate';

export type UrgencyLevel = 'CRITICAL_TRAUMA' | 'HIGH_SURGERY' | 'STANDARD_ELECTIVE';

export type RequestStatus =
  | 'PENDING_MATCH'
  | 'MATCH_FOUND'
  | 'PARTIALLY_FULFILLED'
  | 'DONOR_FALLBACK_ACTIVE'
  | 'DISPATCHED'
  | 'FULFILLED'
  | 'CANCELLED';

export type UserRole = 'HOSPITAL' | 'BLOOD_BANK' | 'DONOR' | 'ADMIN' | 'PRESENTATION_MODE';

export interface LocationCoords {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actorRole: 'HOSPITAL' | 'BLOOD_BANK' | 'DONOR' | 'SYSTEM' | 'ADMIN';
  actorName: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO';
}

export interface Reservation {
  id: string;
  bloodBankId: string;
  bloodBankName: string;
  units: number;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  reservedAt: string;
  status: 'HOLDING' | 'DISPATCHED' | 'DELIVERED' | 'RELEASED';
  etaMinutes: number;
}

export interface DonorAlert {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  status: 'NOTIFIED' | 'ACCEPTED' | 'EN_ROUTE' | 'DECLINED';
  notifiedAt: string;
  responseEtaMinutes?: number;
}

export interface DemandRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientCase: string;
  patientAge?: number;
  patientGender?: 'M' | 'F' | 'Other';
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsRequested: number;
  unitsFulfilled: number;
  urgency: UrgencyLevel;
  requiredWithinHours: number;
  status: RequestStatus;
  createdAt: string;
  location: LocationCoords;
  clinicalNotes: string;
  auditLog: AuditEntry[];
  reservations: Reservation[];
  donorAlerts: DonorAlert[];
}

export interface InventoryBatch {
  id: string;
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsAvailable: number;
  unitsReserved: number;
  collectionDate: string;
  expiryDate: string;
  storageLocation: string;
  temperatureC: number;
  testedStatus: 'VERIFIED_SAFE' | 'QUARANTINE';
  lotNumber: string;
}

export interface BloodBank {
  id: string;
  name: string;
  city: string;
  location: LocationCoords;
  contactPhone: string;
  tier: 'REGIONAL_TRAUMA_HUB' | 'METRO_BLOOD_CENTER' | 'COMMUNITY_BANK';
  dispatchVehicles: number;
  availableDrivers: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  location: LocationCoords;
  contactPhone: string;
  traumaLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'COMMUNITY';
  icuBeds: number;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  distanceKm: number;
  location: {
    lat: number;
    lng: number;
    approximateArea: string;
  };
  lastDonationDate: string;
  eligible: boolean;
  optInEmergencyAlerts: boolean;
  preferredRadiusKm: number;
  totalDonations: number;
  badge: string;
  weightKg: number;
  hemoglobin: number;
}

export interface MatchCandidate {
  id: string;
  type: 'BLOOD_BANK_STOCK' | 'DONOR_FALLBACK';
  sourceId: string;
  sourceName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsAvailable: number;
  distanceKm: number;
  etaMinutes: number;
  daysToExpiry: number;
  score: number; // 0 - 100
  breakdown: {
    urgencyScore: number; // weight: 40%
    compatibilityScore: number; // weight: 25%
    etaScore: number; // weight: 15%
    expiryScore: number; // weight: 10% (FEFO)
    quantityScore: number; // weight: 10%
  };
  compatibilityVerdict: 'EXACT_MATCH' | 'COMPATIBLE_SUBSTITUTE' | 'UNIVERSAL_DONOR' | 'INCOMPATIBLE';
  explanation: string;
  batchId?: string;
  donorId?: string;
}

export interface MatchingWeights {
  urgency: number; // default 40
  compatibility: number; // default 25
  etaDistance: number; // default 15
  fefoExpiry: number; // default 10
  quantityCoverage: number; // default 10
}
