import { FAQ, HOW_IT_WORKS, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, SOCIAL_PROFILES } from "@/lib/site";

/** Renders schema.org structured data. `<` is escaped so content can't close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;

export const organizationLd = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/kindbridge-512.png`, width: 512, height: 512 },
  slogan: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  areaServed: { "@type": "Country", name: "India" },
  ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
};

export const websiteLd = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "en-IN",
  publisher: { "@id": ORG_ID },
};

export const appLd = {
  "@type": "WebApplication",
  "@id": APP_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "SocialNetworkingApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires a modern web browser with JavaScript",
  inLanguage: "en-IN",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  audience: { "@type": "PeopleAudience", suggestedMinAge: 18 },
  featureList: [
    "Offer and request everyday skills in your community",
    "Earn and spend help coins through confirmed exchanges",
    "Private usernames with selective, revocable sharing of contact details",
    "In-app chat, scheduling, rescheduling and completion confirmation",
    "Reviews, blocking, reporting and moderated dispute resolution",
  ],
  publisher: { "@id": ORG_ID },
};

export function homeGraph() {
  return { "@context": "https://schema.org", "@graph": [organizationLd, websiteLd, appLd] };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function howItWorksGraph() {
  const url = `${SITE_URL}/how-it-works`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: "How KindBridge works",
        isPartOf: { "@id": SITE_ID },
        about: { "@id": APP_ID },
        inLanguage: "en-IN",
      },
      {
        "@type": "HowTo",
        name: "How to exchange help with help coins on KindBridge",
        description: "Join your community, list your skills, help a neighbour to earn help coins and spend them on help from someone else.",
        totalTime: "PT10M",
        estimatedCost: { "@type": "MonetaryAmount", currency: "INR", value: "0" },
        step: HOW_IT_WORKS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text, url: `${url}#step-${i + 1}` })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      breadcrumbLd([{ name: "Home", path: "/" }, { name: "How it works", path: "/how-it-works" }]),
    ],
  };
}

export function pageGraph({ path, name, description, about }: { path: string; name: string; description: string; about?: object }) {
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": url, url, name, description, isPartOf: { "@id": SITE_ID }, about: about ?? { "@id": APP_ID }, inLanguage: "en-IN" },
      breadcrumbLd([{ name: "Home", path: "/" }, { name, path }]),
    ],
  };
}
