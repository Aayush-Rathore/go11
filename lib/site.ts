export const SITE_NAME = "Goplay11 APK";
export const SITE_URL = "https://goplay11-apk.com";
export const LOGO_PATH = "/go11.png";

export const AFFILIATE_LINK =
  "https://web-in.goplaycom.com/en/affiliate-invited?c=6FHW28S2&s=3";
export const RECOMMENDED_PLATFORM_URL = "https://www.comegameapp.com";
export const AFFILIATE_REL = "nofollow sponsored noopener noreferrer";
export const EXTERNAL_REL = "nofollow noopener noreferrer";

export const DEFAULT_TITLE = "Goplay11 APK Download and Fantasy Gaming Guide";
export const DEFAULT_DESCRIPTION =
  "Download Goplay11 APK, compare fantasy contest formats, and use expert strategy tips to play smarter, safer, and more consistently in 2026.";

export const BUSINESS_NAME = "GO11 Fantasy Media";
export const SUPPORT_PHONE = "+91-80456-77881";
export const SUPPORT_EMAIL = "support@goplay11-apk.com";
export const BUSINESS_ADDRESS = {
  streetAddress: "44 Residency Road",
  addressLocality: "Bengaluru",
  addressRegion: "Karnataka",
  postalCode: "560025",
  addressCountry: "IN",
};

export const GOOGLE_BUSINESS_PROFILE_URL = "https://www.google.com/business/";

export const SOCIAL_PROFILES = {
  facebook: "https://www.facebook.com/goplay11apk",
  x: "https://x.com/goplay11apk",
  instagram: "https://www.instagram.com/goplay11apk",
  youtube: "https://www.youtube.com/@goplay11apk",
  linkedin: "https://www.linkedin.com/company/goplay11apk",
} as const;

export const SOCIAL_PROFILE_LINKS = Object.values(SOCIAL_PROFILES);

export const PRIMARY_KEYWORDS = [
  "goplay11 app download",
  "goplay11 apk",
  "goplay11 fantasy app",
];

export const SECONDARY_KEYWORDS = [
  "goplay11 login",
  "goplay11 register",
  "goplay11 referral code",
  "goplay11 app latest version",
  "goplay11 games",
];

export const LONG_TAIL_KEYWORDS = [
  "download goplay11 apk latest version 2026",
  "how to play goplay11 fantasy app",
  "is goplay11 safe or real",
  "download goplay11 apk for android",
  "goplay11 fantasy app play smart and win big",
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/download", label: "Download" },
  { href: "/goplay11-app-download", label: "App Download" },
  { href: "/goplay11-fantasy-app", label: "Fantasy App" },
  { href: "/apk", label: "APK" },
  { href: "/how-to-play", label: "How To Play" },
  { href: "/login-register", label: "Login/Register" },
  { href: "/referral-code", label: "Referral Code" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const HOME_FAQS: FaqItem[] = [
  {
    question: "How do I complete the Goplay11 APK download quickly?",
    answer:
      "Use the official download page, allow trusted installs on Android, and finish registration before match lock to avoid missing contest entry windows.",
  },
  {
    question: "Is Goplay11 safe or real for fantasy players in India?",
    answer:
      "Use verified links, review permissions, and check support/payout policies before adding wallet funds. Safe play starts with source verification and disciplined bankroll management.",
  },
  {
    question: "Can I use a Goplay11 referral code while signing up?",
    answer:
      "Yes. Add the referral code during registration to unlock welcome offers and referral incentives where available in current campaign terms.",
  },
  {
    question: "What is the best beginner strategy for fantasy contests?",
    answer:
      "Start with small-entry contests, choose role-balanced teams, and review every match outcome. Process quality improves long-term performance more than high-risk entries.",
  },
  {
    question: "How often should I update my fantasy lineup process?",
    answer:
      "Run a weekly review cycle. Track captain picks, role balance, and contest selection accuracy so you can improve decisions without changing strategy every day.",
  },
  {
    question: "Which pages should I read after downloading the app?",
    answer:
      "Follow this path for best onboarding: Download page, APK setup guide, Login/Register flow, Referral Code page, and then the How To Play strategy guide.",
  },
  {
    question: "How can I reduce risk while playing fantasy games online?",
    answer:
      "Set a fixed budget, cap entry size per contest, and avoid tilt entries after losses. Responsible bankroll limits protect your account and decision quality.",
  },
  {
    question: "Do I need to track scores and post-match performance?",
    answer:
      "Yes. Match reviews help you spot repeated lineup mistakes, improve captain/vice-captain logic, and build a stable strategy framework over time.",
  },
];

export const REFERRAL_FAQS: FaqItem[] = [
  {
    question: "Where should I enter the Goplay11 referral code?",
    answer:
      "Open the register screen, find the referral code field, and enter the code before final account submission.",
  },
  {
    question: "What is the referral code in the affiliate link?",
    answer:
      "The code segment in this campaign URL is 6FHW28S2. Check current bonus terms in-app before joining contests.",
  },
];
