export const COIN_REFERENCE = { coins: 10, minutes: 30 }; // PRD §7 reference rate
export const PROPOSAL_EXPIRY_DAYS = 7;
export const CONFIRM_REMINDER_HOURS = [24, 72];
export const CONFIRM_FLAG_DAYS = 7;

export const FORMATS = { ONLINE: "Online", SHARED_SPACE: "Shared space" } as const;
export type Format = keyof typeof FORMATS;

export const LISTING_KINDS = { OFFER: "Offer", REQUEST: "Request" } as const;
export type ListingKind = keyof typeof LISTING_KINDS;

export const DISCLOSURE_FIELDS = {
  FIRST_NAME: { label: "First name", key: "firstName" },
  PHOTO: { label: "Photo", key: "photoUrl" },
  PHONE: { label: "Phone number", key: "phone" },
  MEETING_LOCATION: { label: "Meeting location", key: "meetingLocation" },
} as const;
export type DisclosureField = keyof typeof DISCLOSURE_FIELDS;

export const AVAILABILITY_OPTIONS = ["Weekday mornings", "Weekday evenings", "Weekends", "Flexible"];
export const CUSTOM_SKILL_MAX = 5; // per kind (offer / need)
export const CUSTOM_SKILL_MAX_LEN = 30;
export const DURATIONS = [15, 30, 45, 60, 90, 120];

export const REPORT_CATEGORIES = [
  "Help not delivered",
  "No-show",
  "Inappropriate message",
  "Shared personal details",
  "Prohibited service",
  "Asked for passwords or credentials",
  "Harassment or safety concern",
  "Something else",
];

export const EXCHANGE_STATUS_LABEL: Record<string, string> = {
  PROPOSED: "Proposed",
  ACCEPTED: "Booked",
  IN_PROGRESS: "In progress",
  DELIVERED: "Awaiting confirmation",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  WITHDRAWN: "Withdrawn",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  DISPUTED: "Under review",
  RESOLVED: "Resolved",
};

export const ACTIVE_EXCHANGE_STATUSES = ["ACCEPTED", "IN_PROGRESS", "DELIVERED", "DISPUTED"];
