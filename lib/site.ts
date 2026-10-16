/**
 * Business configuration. Prices are intentionally NOT set — fill them in
 * once you've decided them. Anything left as null renders as "Early access".
 */

export const SITE = {
  name: "GoHealTrail",
  tagline: "Forge Your Own Path",
  description:
    "Trail discovery for people who head outdoors to reset — honest route data, forecasts, and permit & guide (MGP) requirements for Peninsular Malaysia's forest reserves.",
  /** Public contact shown in the footer. Set before launch. */
  contactEmail: null as string | null,
};

export type Offer = {
  id: string;
  audience: "hikers" | "business";
  title: string;
  /** e.g. "RM 9.90 / month". null = not priced yet. */
  price: string | null;
  priceNote: string;
  blurb: string;
  points: string[];
  cta: string;
  leadType: LeadType;
  highlight?: boolean;
};

export type LeadType = "waitlist" | "guide" | "concierge" | "partner" | "retreat";

export const OFFERS: Offer[] = [
  {
    id: "explorer",
    audience: "hikers",
    title: "Explorer",
    price: "Free",
    priceNote: "forever",
    blurb: "Everything you need to pick a trail and check the rules.",
    points: ["Trail search & filters", "Permit & MGP checker for 258 forest-reserve hikes", "7-day trailhead forecasts"],
    cta: "Start exploring",
    leadType: "waitlist",
  },
  {
    id: "pro",
    audience: "hikers",
    title: "Trail Pro",
    price: null,
    priceNote: "monthly or yearly",
    blurb: "For regulars who go where the signal doesn't.",
    points: ["Offline maps & route cache", "Heat & storm alerts for saved trails", "Trip check-in with auto-SOS to your contacts", "Packing & budget checklists"],
    cta: "Join the Pro waitlist",
    leadType: "waitlist",
    highlight: true,
  },
  {
    id: "retreat",
    audience: "hikers",
    title: "Healing Retreats",
    price: null,
    priceNote: "per trip",
    blurb: "Small-group trail and camping weekends with a certified guide, built around rest.",
    points: ["Guide, permits and camp sorted", "Slow pace, small groups", "Monthly departures"],
    cta: "Get retreat dates",
    leadType: "retreat",
  },
];

export const BUSINESS_OFFERS = [
  {
    title: "Malim Gunung (MGP) guides",
    body: "Get booked by hikers on trails where a forestry-certified guide is required. Free profile; we take a booking fee only when a trip happens.",
    cta: "List as a guide",
    leadType: "guide" as LeadType,
  },
  {
    title: "Campsites, homestays & gear rental",
    body: "Featured placement next to the trails your guests are researching — trailhead-nearby listings, seasonal promos and gear checklists.",
    cta: "Become a partner",
    leadType: "partner" as LeadType,
  },
  {
    title: "Brands & sponsors",
    body: "Sponsor the heat-safety alerts or a state's trail guide. Clearly labelled, never in the safety data itself.",
    cta: "Talk sponsorship",
    leadType: "partner" as LeadType,
  },
];
