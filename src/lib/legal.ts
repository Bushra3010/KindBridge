// Operator details for the public legal and support pages (/privacy-policy,
// /terms, /safety, /support, /delete-account). Every `null` renders as a
// highlighted "to be confirmed" blank. The pages stay out of search results and
// show a draft banner until every field is filled AND `published` is true.
//
// Have these reviewed (ideally by counsel) before setting `published: true`.

export const LEGAL = {
  /** Flip to true only after the details below are complete and reviewed. */
  published: false,

  effectiveDate: null as string | null, // e.g. "1 December 2026"
  legalName: null as string | null, // registered operator, e.g. "KindBridge Technologies Private Limited"
  postalAddress: null as string | null,
  supportEmail: null as string | null, // e.g. "support@kindbridge.co.in"
  privacyEmail: null as string | null, // e.g. "privacy@kindbridge.co.in"
  childSafetyEmail: null as string | null, // e.g. "safety@kindbridge.co.in"
  grievanceName: null as string | null, // Grievance Officer's name (IT Rules 2021 / DPDP Act)
  grievanceContact: null as string | null, // their email and/or address
  supportHours: null as string | null, // e.g. "Monday to Friday, 10:00–18:00 IST, excluding public holidays"
  governingLaw: null as string | null, // e.g. "the laws of India"
  courts: null as string | null, // e.g. "the courts at Bengaluru, Karnataka"

  // Infrastructure — confirm in the Supabase and Vercel dashboards.
  databaseRegion: null as string | null, // Supabase project region, e.g. "Mumbai, India (ap-south-1)"
  processingCountries: null as string | null, // where Vercel/Supabase/Resend process data

  // Retention schedule.
  inactiveAccountPolicy: null as string | null, // e.g. "accounts inactive for 24 months are closed after 30 days' email notice"
  authRecordRetention: null as string | null, // e.g. "deleted within 30 days of expiry"
  contentRetention: null as string | null, // e.g. "while the listing or conversation is active, then 12 months"
  ledgerRetention: null as string | null, // e.g. "8 years, to keep the coin ledger accurate and auditable"
  safetyRetention: null as string | null, // e.g. "3 years after the case is closed, for safety and legal claims"
  logRetention: null as string | null, // e.g. "up to 30 days"
  backupExpiry: null as string | null, // e.g. "30 days"
  deletionCompletionPeriod: null as string | null, // e.g. "30 days"
};

export type LegalField = Exclude<keyof typeof LEGAL, "published">;

export const LEGAL_LABELS: Record<LegalField, string> = {
  effectiveDate: "effective date",
  legalName: "operator's legal name",
  postalAddress: "postal address",
  supportEmail: "support email",
  privacyEmail: "privacy email",
  childSafetyEmail: "child-safety email",
  grievanceName: "Grievance Officer's name",
  grievanceContact: "Grievance Officer's contact",
  supportHours: "support hours",
  governingLaw: "governing law",
  courts: "courts with jurisdiction",
  databaseRegion: "database region",
  processingCountries: "countries where providers process data",
  inactiveAccountPolicy: "inactive-account policy",
  authRecordRetention: "verification and session record retention",
  contentRetention: "user content retention",
  ledgerRetention: "coin ledger retention and reason",
  safetyRetention: "safety and audit record retention",
  logRetention: "hosting and email log retention",
  backupExpiry: "backup expiry",
  deletionCompletionPeriod: "deletion completion period",
};

export const MISSING_LEGAL_FIELDS = (Object.keys(LEGAL_LABELS) as LegalField[]).filter((k) => !LEGAL[k]);

/** True when the legal pages can be indexed and listed in the sitemap. */
export const LEGAL_LIVE = LEGAL.published && MISSING_LEGAL_FIELDS.length === 0;

export const LEGAL_PAGES = [
  { path: "/privacy-policy", short: "Privacy policy" },
  { path: "/terms", short: "Terms of use" },
  { path: "/safety", short: "Safety standards" },
  { path: "/support", short: "Support" },
  { path: "/delete-account", short: "Delete account" },
] as const;
