/**
 * Content Generation Utilities
 *
 * Produces new blog sections and FAQ items to fill content gaps identified
 * from GSC keyword opportunities. Content is tailored for the GoPlay11
 * fantasy gaming platform and follows Indian English conventions.
 */

import type { BlogPost, BlogSection } from '@/lib/blog';
import type { FaqItem } from '@/lib/site';

// ---------------------------------------------------------------------------
// Section templates keyed by topic signal
// ---------------------------------------------------------------------------

interface SectionTemplate {
  heading: string;
  paragraphs: string[];
}

/**
 * Return a topic-aware section template for a given gap keyword.
 * Each template contains 3–5 paragraphs of 80–150 words each.
 * Falls back to a generic template when no specific match is found.
 * All content follows Indian English conventions (realise, analyse, colour).
 */
function buildSectionTemplate(gap: string, post: BlogPost): SectionTemplate {
  const g = gap.toLowerCase();

  if (g.includes('download') || g.includes('apk')) {
    return {
      heading: `How to Download GoPlay11 APK – Step-by-Step Guide`,
      paragraphs: [
        `Downloading the GoPlay11 APK is straightforward once you know the right steps. Open your Android device settings, navigate to Security, and enable "Install from Unknown Sources" so the device accepts the APK file. This one-time change lets you sideload apps that are not listed on the Play Store, which is the standard method for fantasy gaming platforms in India. You only need to do this once, and you can disable the setting again after installation for better security.`,
        `Visit the official GoPlay11 download page and tap the download button. The APK file is typically under 30 MB, so it transfers quickly even on a 4G connection. Once the download finishes, open your file manager, locate the APK, and tap to begin installation. The process takes under a minute and you will see the GoPlay11 icon on your home screen once it completes. Avoid downloading from third-party mirror sites to protect your device from modified files.`,
        `Before you begin the download, make sure your device has at least 100 MB of free storage. A stable internet connection reduces the chance of a corrupted download, which can cause a parse error during installation. If you are on a limited data plan, connect to Wi-Fi before starting. Checking your available storage beforehand saves you from having to delete files mid-process and restart the download from scratch.`,
        `After installation, open GoPlay11 and complete the registration process. You will need a valid Indian mobile number to receive the OTP for account verification. Keep your login credentials secure and avoid using the same password across multiple apps. Once your account is set up, explore the contest lobby to familiarise yourself with the available formats before joining your first paid contest.`,
      ],
    };
  }

  if (g.includes('login') || g.includes('register') || g.includes('sign')) {
    return {
      heading: `GoPlay11 Login and Registration – Getting Started`,
      paragraphs: [
        `Creating your GoPlay11 account takes only a few minutes. Open the app, tap "Register", and enter your mobile number. You will receive a one-time password (OTP) via SMS to verify your number. After verification, fill in your name and set a secure password. Keep your credentials private and avoid sharing them with anyone to protect your account balance and personal information.`,
        `Once registered, the login process is equally simple. Enter your mobile number and password on the login screen. If you forget your password, use the "Forgot Password" option to reset it via OTP. GoPlay11 also supports biometric login on compatible Android devices, which speeds up access before match lock deadlines when every second counts. Biometric login is optional but highly recommended for regular users.`,
        `After your first login, complete your profile by adding your full name and date of birth. This information is required for KYC verification, which you will need to complete before making your first withdrawal. KYC typically involves uploading a government-issued photo ID such as an Aadhaar card or PAN card. The verification process usually takes one to two business days and is a one-time requirement.`,
        `If you experience login issues, check that your mobile number is entered correctly and that your internet connection is stable. OTP delivery can sometimes be delayed by a few minutes during peak hours. Avoid requesting multiple OTPs in quick succession, as this can trigger a temporary lockout. If the problem persists, use the in-app support option to contact the GoPlay11 team for assistance.`,
      ],
    };
  }

  if (g.includes('referral') || g.includes('bonus') || g.includes('code')) {
    return {
      heading: `GoPlay11 Referral Code – How to Claim Your Welcome Bonus`,
      paragraphs: [
        `A referral code unlocks welcome bonuses during the GoPlay11 registration process. On the sign-up screen, look for the "Referral Code" field and enter a valid code before submitting your details. The bonus is credited to your account wallet once registration is complete and the code is validated by the system. Missing this step means you cannot apply the code retroactively after account creation.`,
        `Referral bonuses can be used to enter low-stakes contests, which is an ideal way to practise team selection without risking your own funds. Always read the current bonus terms inside the app because campaign conditions change periodically. Using a referral code costs nothing and gives you extra playing credit from day one, making it a simple way to extend your initial bankroll.`,
        `If you want to share your own referral code with friends, find it in the "Refer and Earn" section of the GoPlay11 app. Each successful referral earns you a bonus when your friend registers and joins their first contest. The more friends you refer, the more bonus credit you accumulate. This is a straightforward way to build your playing balance without additional deposits.`,
        `Keep in mind that referral bonuses typically come with usage conditions such as a minimum contest entry requirement before the bonus converts to withdrawable cash. Read the terms carefully so you understand how to unlock the full value of your bonus. If you have questions about a specific promotion, the in-app FAQ or support team can clarify the current conditions quickly.`,
      ],
    };
  }

  if (g.includes('safe') || g.includes('real') || g.includes('legit') || g.includes('trust')) {
    return {
      heading: `Is GoPlay11 Safe and Real? What You Need to Know`,
      paragraphs: [
        `GoPlay11 is a legitimate fantasy gaming platform that operates under Indian gaming regulations. Before adding funds to your wallet, verify that you are downloading the APK from the official source and not a third-party mirror site. Check the app permissions after installation — a genuine fantasy app requires access to your camera for KYC, storage, and notifications, but should not request unnecessary permissions like contacts or call logs.`,
        `To further protect yourself, use a strong unique password, enable two-factor authentication if available, and never share your OTP with anyone. GoPlay11 processes withdrawals to verified bank accounts, which adds a layer of financial accountability. Reading user reviews on trusted forums and checking the support contact details on the official website are good ways to confirm the platform's credibility before committing real money.`,
        `One of the clearest signs of a trustworthy fantasy platform is transparent withdrawal policies. GoPlay11 displays its withdrawal timelines and minimum amounts clearly within the app. If a platform hides this information or makes it difficult to find, that is a warning sign. Legitimate platforms also have a visible grievance redressal process, which GoPlay11 provides through its in-app support and contact page.`,
        `Responsible play is another indicator of a genuine platform. GoPlay11 includes features that allow you to set daily deposit limits and take breaks from the platform. These tools are designed to help users maintain healthy gaming habits. A platform that actively promotes responsible play is more likely to be operating with long-term user welfare in mind, which is a positive signal for new users evaluating the platform.`,
      ],
    };
  }

  if (g.includes('strateg') || g.includes('tips') || g.includes('win') || g.includes('team')) {
    return {
      heading: `Fantasy Team Strategy on GoPlay11 – Tips to Improve Your Picks`,
      paragraphs: [
        `Building a winning fantasy team on GoPlay11 starts with analysing recent player form rather than reputation alone. Check the last five match performances for each player you are considering. Prioritise all-rounders in cricket contests because they contribute points in both batting and bowling categories, giving your team more scoring opportunities per player slot. Form-based selection consistently outperforms name-based selection over a full season.`,
        `Captain and vice-captain selection is where most contests are won or lost. Choose a player who is in excellent form and is likely to bat or bowl in high-impact situations. Avoid picking the same captain as the majority of other players — a differential pick that performs well can push your rank significantly higher. Review post-match statistics after every contest to refine your selection process over time.`,
        `Contest selection matters as much as team selection. Head-to-head contests are more predictable and suit players who are confident in their team. Large multi-player leagues offer bigger prizes but require more differentiation in your lineup. As a beginner, start with small-entry contests to understand the scoring system before moving to higher-stakes formats. Tracking your results over ten or more contests gives you a clearer picture of your decision quality.`,
        `Bankroll management is the discipline that separates consistent players from those who burn out quickly. Set a fixed weekly budget for contest entries and stick to it regardless of recent results. Avoid chasing losses by entering more contests after a bad week. A disciplined approach to bankroll management keeps fantasy gaming enjoyable and sustainable over the long term, which is the real goal for most players.`,
      ],
    };
  }

  if (g.includes('install') || g.includes('setup') || g.includes('android')) {
    return {
      heading: `Installing GoPlay11 on Android – Complete Setup Guide`,
      paragraphs: [
        `After downloading the GoPlay11 APK, the installation process on Android is quick. Tap the downloaded file in your notifications bar or open it from your Downloads folder. Android will display a permissions summary — review it and tap "Install". The system installs the app within seconds and adds the GoPlay11 icon to your app drawer automatically. The entire process from download to launch typically takes under two minutes.`,
        `If you see an "Install Blocked" message, go to Settings → Apps → Special App Access → Install Unknown Apps, find your browser or file manager, and toggle on "Allow from this source". This setting is required for any APK installed outside the Play Store. Once enabled, retry the installation and it will proceed without issues. You only need to do this once per device, and you can disable the permission again after installation.`,
        `Some older Android devices may show a different path for the unknown sources setting. On Android 7 and below, the option is usually found under Settings → Security → Unknown Sources as a single toggle. Enable it, install the APK, and then disable it again for better security. If your device is running Android 8 or higher, the per-app permission system described above applies instead.`,
        `Once GoPlay11 is installed, open it and allow the necessary permissions when prompted. The app will ask for notification access so you can receive match alerts and contest reminders. Storage access is needed for certain features. Review each permission request and grant only what is necessary. If you accidentally deny a permission, you can re-enable it from your device's app settings at any time.`,
      ],
    };
  }

  if (g.includes('withdraw') || g.includes('payment') || g.includes('wallet') || g.includes('cash')) {
    return {
      heading: `GoPlay11 Wallet, Payments, and Withdrawals Explained`,
      paragraphs: [
        `GoPlay11 supports multiple deposit methods including UPI, net banking, and popular wallets. Adding funds is instant for most payment methods. Before your first withdrawal, complete the KYC verification process by uploading a government-issued ID and a bank account statement. KYC approval typically takes one to two business days and is a one-time requirement that unlocks full wallet functionality.`,
        `Withdrawals are processed to your verified bank account. The minimum withdrawal amount and processing time are displayed in the app's wallet section. Keep your bank details updated to avoid delays. If a withdrawal is pending for more than the stated processing window, contact GoPlay11 support with your transaction reference number for a quick resolution. Most withdrawal requests are processed within 24 to 48 hours.`,
        `Understanding the difference between bonus balance and withdrawable balance is important. Bonus credits earned through referral codes or promotions are typically subject to usage conditions before they can be withdrawn. Your deposited funds and contest winnings, on the other hand, are generally withdrawable after KYC is complete. Check the wallet section of the app to see a clear breakdown of your balance types.`,
        `For security, GoPlay11 only allows withdrawals to the bank account linked during KYC. This prevents unauthorised transfers and protects your winnings. If you need to update your bank details, contact support with the required documentation. Keeping your registered mobile number active is also important, as OTP verification is required for withdrawal requests above certain amounts.`,
      ],
    };
  }

  if (g.includes('contest') || g.includes('league') || g.includes('match')) {
    return {
      heading: `Understanding GoPlay11 Contests and Leagues`,
      paragraphs: [
        `GoPlay11 offers a variety of contest formats to suit different risk appetites. Head-to-head contests pit your team against a single opponent, making them ideal for beginners who want predictable competition. Multi-player leagues have larger prize pools but also more competition. Start with smaller entry-fee contests to build confidence before moving to high-stakes leagues where the field is more experienced.`,
        `Each contest on GoPlay11 shows the total prize pool, number of spots, and entry fee upfront. Use this information to calculate the implied return before joining. Contests with guaranteed prize pools pay out regardless of how many spots are filled, which protects you from low-participation events. Checking the contest fill rate before match lock helps you choose the most competitive and rewarding options available.`,
        `Practice contests are a useful feature for new users who want to understand the scoring system without financial risk. These free-entry contests use the same rules and scoring as paid leagues, so the experience translates directly. Spending a few weeks in practice contests before entering paid leagues gives you a realistic sense of how your team-building decisions translate into points and rankings.`,
        `Mega contests with large prize pools attract the most participants and require the most differentiation in your lineup. In these contests, picking a unique captain or including a less-popular player who performs well can make a significant difference to your final rank. Studying the ownership percentages of popular players before match lock helps you identify where to differentiate your team from the majority of entries.`,
      ],
    };
  }

  // Generic fallback — uses the gap keyword as the topic
  const topicTitle = gap
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    heading: `${topicTitle} – What GoPlay11 Users Should Know`,
    paragraphs: [
      `Understanding ${gap} is important for anyone using the GoPlay11 fantasy gaming platform. GoPlay11 is designed for Indian fantasy sports enthusiasts who want a reliable, feature-rich experience on Android. Whether you are a first-time user or a seasoned player, knowing the details around ${gap} helps you make better decisions and get more value from the platform every time you play.`,
      `GoPlay11 regularly updates its features to address user feedback and improve the overall experience. If you have questions about ${gap}, the in-app help section and the official support team are the best resources. Staying informed about platform updates ensures you are always using the latest features and following current best practices for safe, responsible fantasy gaming on your Android device.`,
      `The GoPlay11 community is active and growing, which means you can find practical advice from experienced players on forums and social media groups. When evaluating information about ${gap}, prioritise guidance from verified sources and the official GoPlay11 support channels. User-generated tips can be helpful, but always cross-check them against the official app documentation to ensure accuracy and relevance to the current version.`,
      `Responsible gaming is a core part of the GoPlay11 experience. Whatever aspect of the platform you are exploring, including ${gap}, always set clear limits on your time and budget before you start. The platform provides tools to help you manage your activity, and using them consistently leads to a more enjoyable and sustainable experience. Fantasy gaming is most rewarding when approached as a skill-based hobby rather than a source of guaranteed income.`,
    ],
  };
}

/**
 * Enforce the 80–150 word target range for a paragraph.
 *
 * - If the paragraph exceeds 150 words it is truncated at 140 words with a
 *   closing sentence so it reads naturally.
 * - If the paragraph is under 80 words it is padded with a contextual
 *   sentence that maintains the GoPlay11 brand voice and Indian English
 *   conventions (e.g. "realise", "practise").
 */
function normaliseParagraph(text: string): string {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);

  // Too long — truncate
  if (words.length > 150) {
    return words.slice(0, 140).join(' ') + ' Read the full guide for more details.';
  }

  // Too short — pad with a brand-consistent closing sentence
  if (words.length < 80) {
    return (
      trimmed +
      ' GoPlay11 continues to improve its platform based on user feedback, making it one of the more reliable fantasy gaming options available for Android users across India.'
    );
  }

  return trimmed;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate new blog sections that address identified content gaps.
 *
 * Each section targets one gap keyword and contains 3–5 paragraphs of
 * 80–150 words each. Content maintains a conversational tone and follows
 * Indian English conventions (e.g. "realise", "analyse", "practise").
 *
 * The number of sections generated is capped so that the total new word
 * count does not overshoot the target by more than one section's worth of
 * content.
 *
 * @param post        - The existing blog post being expanded
 * @param gaps        - Content gap keywords identified from GSC analysis
 * @param targetWords - Minimum total word count to reach
 * @returns Array of new BlogSection objects (3–5 paragraphs each, 80–150 words per paragraph)
 */
export function generateNewSections(
  post: BlogPost,
  gaps: string[],
  targetWords: number
): BlogSection[] {
  if (gaps.length === 0) return [];

  const sections: BlogSection[] = [];

  for (const gap of gaps) {
    const template = buildSectionTemplate(gap, post);
    const section: BlogSection = {
      heading: template.heading,
      paragraphs: template.paragraphs.map(normaliseParagraph),
    };
    sections.push(section);

    // Estimate running word count of new sections
    const newWords = sections.reduce(
      (sum, s) =>
        sum +
        s.paragraphs.reduce(
          (pSum, p) => pSum + p.trim().split(/\s+/).filter(w => w.length > 0).length,
          0
        ),
      0
    );

    // Stop adding sections once we have enough words to reach the target
    // (existing word count is factored in by the caller via targetWords)
    if (newWords >= targetWords) break;
  }

  return sections;
}

/**
 * Convert GSC-derived queries into structured FAQ items.
 *
 * Each FAQ answer is 50–100 words with the direct answer in the first sentence.
 * At least 5 items are generated; if fewer queries are provided, generic
 * GoPlay11 FAQs are appended to meet the minimum.
 *
 * @param post - The blog post context (used to avoid duplicate questions)
 * @param queries - Related search queries from GSC data
 * @returns Array of FaqItem objects
 */
export function generateFAQItems(post: BlogPost, queries: string[]): FaqItem[] {
  const items: FaqItem[] = [];
  const existingQuestions = new Set(
    (post.faq ?? []).map(f => f.question.toLowerCase())
  );

  for (const query of queries) {
    if (items.length >= 10) break; // cap at 10 to avoid bloat

    const faq = buildFaqFromQuery(query);
    if (!existingQuestions.has(faq.question.toLowerCase())) {
      items.push(faq);
      existingQuestions.add(faq.question.toLowerCase());
    }
  }

  // Pad with generic GoPlay11 FAQs if we have fewer than 5
  const fallbacks = getGenericFaqs();
  for (const fallback of fallbacks) {
    if (items.length >= 5) break;
    if (!existingQuestions.has(fallback.question.toLowerCase())) {
      items.push(fallback);
      existingQuestions.add(fallback.question.toLowerCase());
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildFaqFromQuery(query: string): FaqItem {
  const q = query.toLowerCase();

  if (q.includes('download') && q.includes('apk')) {
    return {
      question: `How do I download the GoPlay11 APK on Android?`,
      answer: `Download the GoPlay11 APK from the official website and enable "Install from Unknown Sources" in your Android settings before tapping the file. The installation takes under a minute. Once complete, register your account and complete KYC to start joining fantasy contests immediately.`,
    };
  }

  if (q.includes('safe') || q.includes('real') || q.includes('legit')) {
    return {
      question: `Is GoPlay11 safe and real for Indian users?`,
      answer: `Yes, GoPlay11 is a legitimate fantasy gaming platform for Indian users. Download only from the official source, review app permissions after installation, and complete KYC before adding wallet funds. Using a strong password and keeping your OTP private are the most important steps to keep your account secure.`,
    };
  }

  if (q.includes('referral') || q.includes('code') || q.includes('bonus')) {
    return {
      question: `How do I use a GoPlay11 referral code?`,
      answer: `Enter the referral code in the designated field on the GoPlay11 registration screen before submitting your details. The bonus is credited to your wallet automatically after successful registration. Check the current bonus terms inside the app because campaign conditions are updated periodically and vary by promotion.`,
    };
  }

  if (q.includes('login') || q.includes('register') || q.includes('sign up')) {
    return {
      question: `How do I register and log in to GoPlay11?`,
      answer: `Open the GoPlay11 app, tap "Register", and enter your mobile number to receive an OTP. Verify the OTP, set a password, and your account is ready. For subsequent logins, use your mobile number and password. If you forget your password, the "Forgot Password" option resets it via OTP in under two minutes.`,
    };
  }

  if (q.includes('withdraw') || q.includes('payment') || q.includes('cash out')) {
    return {
      question: `How do I withdraw winnings from GoPlay11?`,
      answer: `Complete KYC verification first by uploading a valid government ID and bank details inside the app. Once approved, go to the Wallet section, tap "Withdraw", enter the amount, and confirm. Withdrawals are processed to your verified bank account within the timeframe shown in the app, typically one to three business days.`,
    };
  }

  if (q.includes('strateg') || q.includes('tips') || q.includes('win')) {
    return {
      question: `What is the best strategy to win on GoPlay11?`,
      answer: `Focus on recent player form rather than reputation, and choose all-rounders who contribute across multiple scoring categories. Select a differential captain — someone in great form but not picked by most other players. Start with small-entry contests to build your decision-making process before moving to high-stakes leagues.`,
    };
  }

  if (q.includes('install') || q.includes('setup')) {
    return {
      question: `How do I install GoPlay11 APK on my Android phone?`,
      answer: `After downloading the APK, open it from your Downloads folder or notification bar. If Android blocks the install, go to Settings → Apps → Special App Access → Install Unknown Apps and allow your browser or file manager. Tap Install on the permissions screen and GoPlay11 will be ready in seconds.`,
    };
  }

  if (q.includes('contest') || q.includes('league')) {
    return {
      question: `What types of contests are available on GoPlay11?`,
      answer: `GoPlay11 offers head-to-head contests, small leagues, and large multi-player tournaments across cricket, football, and other sports. Each contest displays the entry fee, prize pool, and number of spots before you join. Beginners should start with head-to-head or small-league formats to build confidence before entering high-stakes tournaments.`,
    };
  }

  if (q.includes('update') || q.includes('version') || q.includes('latest')) {
    return {
      question: `How do I update GoPlay11 to the latest version?`,
      answer: `Since GoPlay11 is an APK app, updates are not automatic. Visit the official GoPlay11 website periodically to check for the latest APK version. Download the new APK and install it over the existing app — your account data and wallet balance are preserved during the update process.`,
    };
  }

  // Generic fallback using the query text
  const questionText = query.endsWith('?') ? query : `${query}?`;
  const capitalised = questionText.charAt(0).toUpperCase() + questionText.slice(1);
  return {
    question: capitalised,
    answer: `GoPlay11 provides clear guidance on ${query} within the app's help section and on the official website. For the most accurate and up-to-date information, check the in-app FAQ or contact GoPlay11 support directly. The support team responds quickly and can resolve most queries within one business day.`,
  };
}

function getGenericFaqs(): FaqItem[] {
  return [
    {
      question: `What is GoPlay11 and how does it work?`,
      answer: `GoPlay11 is an Indian fantasy sports platform where you create virtual teams of real players and earn points based on their actual match performances. Download the APK, register your account, join a contest before match lock, and track your team's score live. Winnings are credited to your wallet and can be withdrawn to your bank account.`,
    },
    {
      question: `Is GoPlay11 available for iOS devices?`,
      answer: `GoPlay11 is currently available as an Android APK. iOS users can check the official GoPlay11 website for updates on an App Store release. The Android APK works on most smartphones running Android 5.0 or higher and is regularly updated to support newer Android versions.`,
    },
    {
      question: `How do I contact GoPlay11 customer support?`,
      answer: `Reach GoPlay11 support through the in-app help section, which offers a chat option and a support ticket form. You can also email the support team using the contact details on the official website. For urgent issues like payment delays, the in-app chat typically provides the fastest response during business hours.`,
    },
    {
      question: `Can I play GoPlay11 for free?`,
      answer: `GoPlay11 offers practice contests and some free-entry leagues that let you play without spending real money. These are ideal for new users who want to understand the platform before committing funds. Check the contest lobby for free-entry options, which are usually labelled clearly and available for most major matches.`,
    },
    {
      question: `What sports are available on GoPlay11?`,
      answer: `GoPlay11 primarily focuses on cricket fantasy contests, covering IPL, international matches, and domestic tournaments. The platform also offers fantasy contests for football and other popular sports during their respective seasons. The contest lobby is updated before each match day so you can see all available options in one place.`,
    },
  ];
}
