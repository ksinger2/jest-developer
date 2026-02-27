# Privacy Policy Guide for Mobile Games

This guide provides section-by-section instructions for drafting privacy policies for mobile games with in-app purchases, social features, and global distribution.

## Table of Contents

1. [Header and Overview](#1-header-and-overview)
2. [Who We Are](#2-who-we-are)
3. [Data We Collect](#3-data-we-collect)
4. [How We Collect Data](#4-how-we-collect-data)
5. [Why We Collect Data](#5-why-we-collect-data)
6. [Who We Share Data With](#6-who-we-share-data-with)
7. [Data Retention](#7-data-retention)
8. [Your Privacy Rights](#8-your-privacy-rights)
9. [Children's Privacy](#9-childrens-privacy)
10. [International Data Transfers](#10-international-data-transfers)
11. [Data Security](#11-data-security)
12. [Platform-Specific Disclosures](#12-platform-disclosures)
13. [Cookies and Tracking Technologies](#13-cookies-and-tracking)
14. [Changes to This Policy](#14-changes)
15. [Contact Us](#15-contact)

---

## 1. Header and Overview

Start with:
- Company/developer name
- Last updated date
- Brief plain-language summary (2-3 sentences) of what data is collected and why
- Statement that by using the game, the user agrees to this policy
- Table of contents for easy navigation

**Readability target:** 8th grade reading level. Use short sentences, plain words, and define technical terms.

**Example header:**

```
PRIVACY POLICY

Last Updated: [DATE]

[DEVELOPER NAME] ("we," "us," or "our") built [GAME NAME] (the "Game").
This Privacy Policy explains what information we collect when you play our
Game, how we use it, who we share it with, and what choices you have.

We believe in being straightforward about data. If you have questions after
reading this, email us at [PRIVACY EMAIL].
```

---

## 2. Who We Are

Provide:
- Full legal name of the company
- Registered address
- Country of incorporation
- Contact email for privacy inquiries
- Data Protection Officer (DPO) contact if required by GDPR (mandatory if: public authority, large-scale systematic monitoring, or processing special categories of data at scale)

---

## 3. Data We Collect

Organize by category. For each category, specify: what data, why it's collected, and whether it's optional.

### 3a. Information You Provide Directly

- **Account information:** Email, username, password, date of birth, profile picture
- **Purchase information:** Transaction records (note: full payment card numbers are processed by Apple/Google, not stored by the developer)
- **Support communications:** Messages to customer support, screenshots, bug reports
- **Social features:** Friend requests, chat messages, guild/team information

### 3b. Information Collected Automatically

**Device information:**
- Device model, operating system, version
- Device identifiers: IDFA (iOS), GAID (Android), device fingerprint
- Screen resolution, language settings, time zone
- IP address (used for approximate location and fraud prevention)

**Gameplay data:**
- Game progress, level, achievements, scores
- Session duration, frequency, time of play
- In-game actions and interactions
- Currency earned and spent, items owned
- Crash logs and performance data

**Analytics data (via third-party SDKs):**

List every SDK used. Common ones:

| SDK | Data Collected | Purpose |
|-----|---------------|---------|
| Firebase Analytics | Events, sessions, user properties, crashes | Game improvement, bug fixing |
| Unity Analytics | Events, sessions, device info, performance | Game improvement |
| GameAnalytics | Sessions, progression, monetization events | Game optimization |
| AppsFlyer / Adjust | Install attribution, campaign data, device IDs | Marketing measurement |

**Advertising data (via ad network SDKs):**

| SDK | Data Collected | Purpose |
|-----|---------------|---------|
| AdMob | Device ID, ad interactions, IP address | Serving and measuring ads |
| ironSource | Device ID, engagement data, IP | Ad mediation |
| AppLovin | Device ID, ad events, location (approx) | Ad serving and attribution |

**Social login data:**

| Provider | Data Received | Notes |
|----------|--------------|-------|
| Google Sign-In | Email, name, profile picture, user ID | Scope depends on permissions requested |
| Facebook Login | Email, name, profile picture, friend list (if requested) | Must comply with Facebook Platform Policy |
| Apple Sign-In | Email (or private relay), name, verified user ID | Most privacy-preserving option |

### 3c. Information From Third Parties

- Data from ad networks about campaign effectiveness
- Data from social platforms (if social login used)
- Fraud detection data from anti-cheat services

---

## 4. How We Collect Data

Explain the three methods:

1. **Directly from you:** When you create an account, make a purchase, contact support, or use chat features.
2. **Automatically:** Through SDKs and technologies embedded in the Game that collect device and usage data when you play.
3. **From third parties:** Ad networks, attribution partners, social login providers, and anti-cheat services may share data with us.

---

## 5. Why We Collect Data

Map each data type to a clear purpose. For GDPR compliance, also specify the legal basis.

| Purpose | Data Used | GDPR Legal Basis |
|---------|-----------|-----------------|
| Provide and operate the Game | Account info, gameplay data, cloud saves | Contract performance |
| Process purchases | Transaction records, account info | Contract performance |
| Improve the Game | Analytics, crash logs, performance data | Legitimate interest |
| Personalize experience | Gameplay data, preferences | Legitimate interest |
| Serve ads | Device ID, ad interaction data, IP | Consent (where required) |
| Measure ad effectiveness | Attribution data, install data | Legitimate interest / Consent |
| Prevent cheating and fraud | Device info, gameplay patterns, IP | Legitimate interest |
| Communicate with you | Email, push notification token | Consent (marketing) / Contract (transactional) |
| Comply with law | As required | Legal obligation |
| Ensure safety | Chat data, reports, moderation logs | Legitimate interest |

---

## 6. Who We Share Data With

List every category of third party. Be specific.

### Service Providers (process data on our behalf)
- **Cloud hosting:** [AWS / Google Cloud / Azure] — stores game data and accounts
- **Analytics:** [Firebase / Unity / GameAnalytics] — helps us understand how players use the Game
- **Customer support:** [Zendesk / Intercom / etc.] — manages support tickets
- **Payment processing:** Handled by Apple (App Store) and Google (Play Store) — we do not directly process payments
- **Anti-cheat:** [EasyAntiCheat / BattlEye / custom] — detects cheating

### Advertising Partners (may use data for their own purposes)
- **Ad networks:** [AdMob / ironSource / AppLovin / etc.] — serve and measure ads
- **Attribution:** [AppsFlyer / Adjust / Singular] — measure marketing campaigns

For each advertising partner, note:
- They may use data for ad targeting across other apps
- Users can opt out (see Your Rights section)
- Link to each partner's privacy policy

### Legal and Safety
- Law enforcement when required by law
- To protect our rights, property, or safety
- In connection with a business transfer (merger, acquisition)

### With Your Consent
- Any other sharing with your explicit consent

**CCPA/CPRA note:** Under California law, sharing data with ad networks for targeted advertising may constitute "selling" or "sharing" personal information. Include a "Do Not Sell or Share My Personal Information" mechanism. See the rights section.

---

## 7. Data Retention

Specify retention periods by data type:

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| Account information | Duration of account + [X] months after deletion | Account recovery, legal compliance |
| Gameplay data | Duration of account + [X] months | Game continuity |
| Purchase records | [5-7] years after transaction | Tax and legal requirements |
| Analytics data | [90-180] days in identifiable form | Game improvement |
| Chat logs | [30-90] days | Safety and moderation |
| Ad interaction data | [90] days | Campaign measurement |
| Support tickets | [1-3] years after resolution | Quality assurance |
| Crash logs | [90] days | Bug fixing |

**Deletion:**
- When you delete your account, we delete or anonymize your personal data within [30] days, except where we are required by law to retain it.
- Some data may persist in backups for up to [90] days after deletion.

---

## 8. Your Privacy Rights

Organize by jurisdiction so users can find their rights quickly.

### For All Users
- **Access:** Request a copy of the data we hold about you.
- **Correction:** Request correction of inaccurate data.
- **Deletion:** Request deletion of your data (subject to legal retention requirements).
- **Objection:** Object to processing based on legitimate interest.

### For EU/UK Users (GDPR)
All of the above, plus:
- **Portability:** Receive your data in a machine-readable format.
- **Restrict processing:** Ask us to limit how we use your data while a complaint is investigated.
- **Withdraw consent:** Withdraw consent at any time (does not affect prior processing).
- **Lodge a complaint:** With your local data protection authority.
- **Automated decisions:** Right not to be subject to solely automated decisions with legal effects.

**How to exercise:** Email [PRIVACY EMAIL] or use [in-app form/link].
**Response time:** Within 30 days (may extend by 60 days for complex requests).

### For California Users (CCPA/CPRA)
All of the above, plus:
- **Right to know:** What personal information we collect, use, and share.
- **Right to delete:** Request deletion of your personal information.
- **Right to opt-out of sale/sharing:** We will not sell your personal information. If we share data with ad partners for targeted advertising, you can opt out via [link/mechanism].
- **Right to correct:** Correct inaccurate information.
- **Right to limit use of sensitive data:** Limit use of sensitive personal information.
- **Non-discrimination:** We will not discriminate against you for exercising your rights.

**"Do Not Sell or Share" mechanism:**
- In-app toggle in Settings > Privacy
- Email request to [PRIVACY EMAIL]
- Browser signal: We honor Global Privacy Control (GPC) signals

**Categories of PI collected (CCPA requirement):**
List the categories of personal information collected in the past 12 months, the sources, purposes, and third parties with whom it was shared.

### For Users Under 13 (COPPA)
See Children's Privacy section below.

### For Users in Other Jurisdictions
- **Brazil (LGPD):** Similar rights to GDPR. Contact [EMAIL].
- **Canada (PIPEDA):** Right to access and correct data. Contact [EMAIL].
- **South Korea (PIPA):** Right to access, correct, and delete. Contact [EMAIL].

---

## 9. Children's Privacy

This is one of the most important and legally risky sections.

### If the Game Is NOT Directed at Children (13+)

```
OUR GAME IS NOT INTENDED FOR CHILDREN UNDER 13

We do not knowingly collect personal information from children under 13.
If we learn that we have collected personal information from a child under
13 without verifiable parental consent, we will delete that information
as quickly as possible.

If you believe we have collected information from a child under 13, please
contact us at [PRIVACY EMAIL].
```

### If the Game Is Mixed-Audience (some children may play)

Must implement age screening before collecting ANY data (COPPA 2025 amendments):

```
AGE SCREENING

When you first open the Game, we ask for your age before collecting any
personal information. If you indicate that you are under 13, we will:

- Not collect personal information beyond what is strictly necessary to
  provide the Game
- Not show personalized advertisements
- Not share your data with third parties for marketing purposes
- Obtain verifiable parental consent before collecting additional data

PARENTAL CONSENT

If your child wants to use features that require personal information
(such as creating an account, using chat, or making purchases), we will
request parental consent using one of the following methods:
- Email verification with follow-up confirmation
- Text message verification to a parent's phone number
- Credit card verification (no charge)

PARENTAL RIGHTS

Parents and guardians can:
- Review personal information collected from their child
- Request deletion of their child's data
- Refuse further collection of their child's data
- Contact us at [PRIVACY EMAIL] or [PHONE]
```

### COPPA 2025 Amendment Requirements (effective June 23, 2025; full compliance April 22, 2026)

Key changes to address:
- **New consent methods:** Knowledge-based authentication, photo ID verification, text-plus method now accepted
- **Third-party disclosure:** Separate parental consent required before sharing children's data with third parties for advertising or marketing
- **Data retention limits:** Cannot retain children's data indefinitely; must delete when no longer needed
- **Security program:** Must implement written information security program for children's data
- **Expanded data categories:** Now covers biometric data, government IDs, precise geolocation, health data

### For EU Markets (GDPR + Age-Appropriate Design)

- Most EU countries set digital consent age at 16 (some at 13-15)
- Default to privacy-protective settings for minors
- No personalized advertising to minors
- Conduct Data Protection Impact Assessment for features used by children
- UK Age-Appropriate Design Code: 15 standards for child-friendly design

### For US State Laws

- **Georgia (July 2025):** Age verification + parental consent for under-16 on social platforms
- **Florida (Jan 2025):** Age verification for social media; terminate under-14 accounts
- **California AADC:** "Best interests of children" approach; no dark patterns for minors
- **Virginia, Colorado, Connecticut:** Enhanced minor protections with varying effective dates

---

## 10. International Data Transfers

```
INTERNATIONAL DATA TRANSFERS

Your data may be transferred to and processed in countries other than your
own, including the United States, where our servers and service providers
are located.

If you are located in the European Economic Area (EEA), United Kingdom, or
Switzerland, we ensure appropriate safeguards for international transfers
through:
- Standard Contractual Clauses (SCCs) approved by the European Commission
- Adequacy decisions where applicable
- Your explicit consent where required

For transfers to the United States, we rely on Standard Contractual Clauses
and implement supplementary technical and organizational measures to protect
your data.
```

---

## 11. Data Security

```
DATA SECURITY

We implement technical and organizational measures to protect your personal
information, including:

- Encryption of data in transit (TLS/SSL) and at rest
- Access controls limiting who can view personal data
- Regular security audits and vulnerability assessments
- Employee training on data protection
- Secure server infrastructure with [CLOUD PROVIDER]

No method of transmission over the Internet or electronic storage is 100%
secure. While we strive to protect your information, we cannot guarantee
absolute security.

If we discover a data breach that affects your personal information, we
will notify you and the relevant authorities as required by applicable law.
```

---

## 12. Platform-Specific Disclosures

### Apple App Store (Privacy Nutrition Labels)

The privacy policy must align with what's reported in the App Store privacy label. Three categories:

1. **Data Used to Track You** — Data linked to your identity used for tracking across other apps/websites (e.g., IDFA when ATT consented, email for cross-app matching)
2. **Data Linked to You** — Data connected to your identity (e.g., email, name, purchase history, gameplay data)
3. **Data Not Linked to You** — Anonymized data (e.g., aggregate analytics, crash logs without identifiers)

**App Tracking Transparency (ATT):**
```
On iOS, we request your permission before tracking your activity across
other companies' apps and websites. If you choose "Ask App Not to Track,"
we will not access your device's advertising identifier (IDFA) and will
not share your data with advertising partners for cross-app tracking.

You can change this setting at any time in your device's Settings > Privacy
& Security > Tracking.
```

### Google Play (Data Safety Section)

The privacy policy must be consistent with the Google Play Data Safety form. Ensure:
- Privacy policy URL is publicly accessible (not a PDF, not geo-fenced)
- All data types disclosed in Data Safety match what's described in the privacy policy
- Security practices attestation matches actual implementation

---

## 13. Cookies and Tracking Technologies

Mobile games typically don't use browser cookies, but they use equivalent technologies:

```
TRACKING TECHNOLOGIES

We and our partners use the following technologies to collect data:

- **Software Development Kits (SDKs):** Code libraries embedded in the Game
  that collect analytics, ad, and attribution data. See "Who We Share Data
  With" for a list of SDKs used.

- **Device Identifiers:** We may collect your device's advertising identifier
  (IDFA on iOS, GAID on Android) for advertising and analytics purposes.
  You can reset or limit these identifiers in your device settings.

- **Log Data:** Our servers automatically record information when you use the
  Game, including IP address, device type, operating system, and timestamps.

- **Local Storage:** We store game data (saves, preferences, settings) locally
  on your device.
```

---

## 14. Changes to This Policy

```
CHANGES TO THIS PRIVACY POLICY

We may update this Privacy Policy from time to time. When we make material
changes, we will:

- Update the "Last Updated" date at the top of this page
- Notify you through the Game (via pop-up or in-game notification)
- [If collecting email: Send an email to the address associated with your
  account]

We encourage you to review this Privacy Policy periodically. Your continued
use of the Game after changes are posted constitutes acceptance of the
updated policy.
```

---

## 15. Contact Us

```
CONTACT US

If you have questions about this Privacy Policy or want to exercise your
privacy rights, contact us at:

[DEVELOPER LEGAL NAME]
[ADDRESS]
Email: [PRIVACY EMAIL]

For EU/UK residents, you may also contact our Data Protection Officer at:
[DPO EMAIL] (if applicable)

To submit a Data Subject Access Request (DSAR):
- Email: [PRIVACY EMAIL]
- Subject line: "Privacy Rights Request"
- Include: Your username, email associated with your account, and a
  description of your request
- We will respond within 30 days

If you are not satisfied with our response, you have the right to lodge a
complaint with your local data protection authority.
```

---

## Writing Tips for Privacy Policies

1. **Be specific, not vague.** Instead of "We may collect certain information," say "We collect your email address, username, and device model."

2. **Name your partners.** Instead of "third-party analytics providers," say "Firebase Analytics (Google) and AppsFlyer."

3. **Explain the "why" simply.** Instead of "for our legitimate business interests," say "to understand which game features are most popular so we can make the game better."

4. **Don't hide bad news.** If ad networks track users across apps, say so clearly. Trying to obscure it invites regulatory scrutiny.

5. **Use tables.** Tables are your friend for organizing data types, retention periods, and third-party disclosures. They're scannable and precise.

6. **Include the date prominently.** Regulators check whether policies are current.

7. **Keep it under 3,000 words if possible.** Longer policies are less likely to be read. Use layered disclosure (summary + full detail) if needed.
