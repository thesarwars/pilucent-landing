/** ID cards API shapes (backend `weapi/django_rest/views/bd_idcards.py`). */

import type { Cond, Ctx, Finding, Report, Side } from './engine';

export type Screen =
  | 'gallery' | 'card' | 'print' | 'jobs'
  | 'templates' | 'designer'
  | 'fields' | 'photos' | 'profiles' | 'verify';

export interface Can {
  issue: boolean; revoke: boolean; edit: boolean; publish: boolean; print: boolean;
  override: boolean; photos: boolean; fields: boolean;
}

export interface CatalogueField { path: string; label: string; type: string; labelBn?: string | null; options?: string[]; pii?: boolean; printable?: boolean }
export interface CatalogueGroup { id: string; label: string; fields: CatalogueField[] }

export interface Profile {
  uid: string; name: string; note: string | null; sheet: 'CARD_DIRECT' | 'A4' | 'LETTER' | 'PNG'; cols: number; rows: number;
  gutterMm: number; marginMm: number; includeBleed: boolean; cropMarks: boolean; duplex: 'NONE' | 'LONG_EDGE' | 'SHORT_EDGE';
  colourProfile: string; dpi: number; mirror: boolean; isDefault: boolean; cardsPerSheet: number;
}

export interface Settings { nameBn: string | null; address: string | null; signatoryTitle: string | null; numberPrefix: string; validityYears: number; photoRetentionDays: number }

export interface Setup {
  catalogue: CatalogueGroup[]; company: Record<string, string | null>;
  presets: { id: string; widthMm: number; heightMm: number; label: string }[];
  profiles: Profile[]; settings: Settings; can: Can;
}

export interface Template {
  uid: string; code: string; name: string; nameBn: string | null; description: string | null; version: number;
  preset: string; widthMm: number; heightMm: number; cornerRadiusMm: number; bleedMm: number; safeAreaMm: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; locked: boolean; isDefault: boolean; hasBack: boolean;
  publishedAt: string | null; publishedBy: string | null; updatedAt: string;
  publishFindings: { errors: number; warnings: number; acknowledgedBy: string | null; findings: Finding[] } | null;
  front?: Side; back?: Side | null;
}

export interface TemplateRow extends Template {
  currentVersion: number | null; currentUid: string | null; draftUid: string | null; liveCards: number;
  versions: { uid: string; version: number; status: Template['status']; locked: boolean }[];
}

export interface AuditRow { action: string; label: string; by: string | null; at: string; reason: string | null; ip: string | null; after: Record<string, unknown> | null }

export interface TemplateDetail extends Template { versions: Template[]; liveCards: number; audit: AuditRow[]; can: Can }

export type CardStatus = 'DRAFT' | 'ISSUED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'LOST' | 'REPLACED';
export type EffectiveStatus = CardStatus | 'EXPIRING' | 'NOT_ISSUED';

export interface Card {
  uid: string; number: string; status: CardStatus; effectiveStatus: EffectiveStatus;
  employee: { code: string; nameEn: string };
  template: { uid: string; code: string; name: string; version: number };
  issuedOn: string | null; expiresOn: string | null; issuedBy: string | null; revokedOn: string | null;
  revokeReason: string | null; revokedBy: string | null; replacedBy: string | null; printCount: number;
  lastPrintedAt: string | null; lastPrintedBy: string | null; verifyUrl: string; snapshot: Record<string, unknown>;
}

export interface PhotoRef { assetId: string; width: number; height: number; url?: string }

export interface GalleryRow {
  code: string; nameEn: string; nameBn: string | null; designation: string | null; department: string | null;
  template: { uid: string; code: string; name: string; version: number } | null; rule: string | null;
  card: Card | null; status: EffectiveStatus; missing: string[]; hasPhoto: boolean; photo: PhotoRef | null; context: Ctx;
}

export type GalleryFilter = 'ALL' | 'NOT_ISSUED' | 'EXPIRING' | 'MISSING' | 'REVOKED';
export interface Gallery { rows: GalleryRow[]; counts: Record<GalleryFilter, number>; templates: Record<string, Template>; can: Can }

export interface Asset {
  uid: string; kind: string; width: number; height: number; placedWidth: number; placedHeight: number;
  crop: { x: number; y: number; w: number; h: number } | null; adjustments: { brightness?: number; contrast?: number; saturation?: number };
  bytes: number; mime: string; uploadedBy: string | null; uploadedAt: string; retainUntil: string | null; url: string; originalUrl: string;
}

export interface EmployeeRead {
  employee: { code: string; nameEn: string; nameBn: string | null; designation: string | null; department: string | null; hasProfilePhoto: boolean };
  template: Template | null; rule: string | null; context: Ctx; preflight: Report | null; photo: Asset | null;
  customValues: Record<string, unknown>; cards: Card[]; can: Can;
}

export interface Job {
  uid: string; reference: string; name: string | null; status: 'QUEUED' | 'RENDERING' | 'READY' | 'PRINTED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  profile: string; cards: number; skipped: { code: string; card: string; why: string }[]; submittedBy: string | null;
  submittedAt: string; completedAt: string | null; printedAt: string | null; sha256: string | null; pages: number;
  purgeAfter: string | null; failure: string | null; hasArtifact: boolean;
  preflight?: { checks: Check[]; at: string };
  cardList?: { uid: string; number: string; code: string; nameEn: string }[];
}

export interface CardRead { card: Card; template: Template; context: Ctx; preflight: Report; jobs: Job[]; audit: AuditRow[]; can: Can }

export interface Check { card: string; number: string; code: string; nameEn: string; errors: number; warnings: number; findings: Finding[] }
export interface CheckResult { checks: Check[]; ready: number; warnings: number; blocked: number }

export interface Rule { uid: string; priority: number; label: string; templateCode: string; condition: Cond; describe: string; enabled: boolean }

export interface Field {
  uid: string; key: string; path: string; label: string; labelBn: string | null; kind: 'TEXT' | 'DATE' | 'NUMBER' | 'ENUM' | 'MULTI' | 'BOOLEAN';
  options: string[]; group: string; help: string | null; required: boolean; isPii: boolean; printable: boolean; verifyVisible: boolean;
  position: number; population: number | null;
}
export interface FieldsRead { fields: Field[]; employees: { code: string; nameEn: string; values: Record<string, unknown> }[]; can: Can }

export interface Contexts { employees: { code: string; nameEn: string; context: Ctx }[]; fieldStats: Record<string, number> }

export interface TemplatePreflight extends Report { fieldStats: Record<string, number>; roster: number }

export interface Verification {
  status: 'ISSUED' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'REVOKED' | 'LOST' | 'REPLACED' | 'NOT_ISSUED' | 'UNKNOWN' | 'THROTTLED';
  message?: string; employer?: string; employeeName?: string; employeeNameBn?: string | null; employeeCode?: string;
  designation?: string | null; cardNumber?: string; photoUrl?: string | null; issuedOn?: string | null; expiresOn?: string | null;
  revokedOn?: string | null; replacedBy?: string | null; custom?: { label: string; value: unknown }[];
}
