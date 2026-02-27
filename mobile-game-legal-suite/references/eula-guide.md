# EULA Guide for Mobile Games

This guide provides clause-by-clause instructions for drafting End User License Agreements for mobile games with in-app purchases and social features.

## Table of Contents

1. [Document Header and Effective Date](#1-document-header)
2. [Definitions](#2-definitions)
3. [License Grant](#3-license-grant)
4. [Account and Eligibility](#4-account-and-eligibility)
5. [In-App Purchases and Virtual Currency](#5-in-app-purchases)
6. [Subscription Terms](#6-subscription-terms)
7. [Loot Box and Gacha Disclosures](#7-loot-box-disclosures)
8. [User Conduct](#8-user-conduct)
9. [User-Generated Content](#9-user-generated-content)
10. [Chat and Social Features](#10-chat-and-social-features)
11. [Intellectual Property](#11-intellectual-property)
12. [Account Termination](#12-account-termination)
13. [Privacy and Data](#13-privacy-and-data)
14. [Disclaimers and Limitation of Liability](#14-disclaimers)
15. [Dispute Resolution and Arbitration](#15-dispute-resolution)
16. [Governing Law](#16-governing-law)
17. [Changes to This Agreement](#17-changes)
18. [Apple App Store Requirements](#18-apple-requirements)
19. [Google Play Considerations](#19-google-play)
20. [Anti-Cheat and Fair Play](#20-anti-cheat)
21. [DMCA and IP Protection](#21-dmca)
22. [General Provisions](#22-general)

---

## 1. Document Header

Start every EULA with:
- Full legal name of the developer/company
- Game name
- Effective date / last updated date
- Brief statement: "By downloading, installing, or using [Game Name], you agree to these terms."
- Mention that if the user does not agree, they should not use the game.

**Example:**

```
END USER LICENSE AGREEMENT

Last Updated: [DATE]

This End User License Agreement ("Agreement") is a legal agreement between
you ("you" or "Player") and [DEVELOPER LEGAL NAME] ("[SHORT NAME]" or "we")
for [GAME NAME] (the "Game").

By downloading, installing, accessing, or using the Game, you agree to be
bound by this Agreement. If you do not agree to these terms, do not download,
install, or use the Game.
```

---

## 2. Definitions

Define key terms upfront. At minimum include:

- **"Game"** — the mobile application, including updates, patches, and expansions
- **"Account"** — the player's registered account
- **"Virtual Currency"** — in-game currency purchased with real money or earned through gameplay
- **"Virtual Goods"** — in-game items, skins, characters, or other digital content
- **"Content"** — all text, graphics, audio, video, data, and other materials in the Game
- **"User Content"** — any content created, uploaded, or shared by players
- **"Service"** — the Game and any related online services, websites, or features
- **"Platform"** — Apple App Store, Google Play Store, or other distribution platform

---

## 3. License Grant

The license grant defines what the player is allowed to do. Keep it narrow.

**Grant the player:**
- A limited, non-exclusive, non-transferable, revocable license
- To download and install on devices they own or control
- For personal, non-commercial entertainment use only

**Explicitly prohibit:**
- Copying, modifying, or creating derivative works
- Reverse engineering, decompiling, or disassembling
- Renting, leasing, lending, selling, or sublicensing
- Using for commercial purposes without written permission
- Removing copyright notices or proprietary markings
- Circumventing security features or DRM
- Using bots, automation software, or scripts
- Exploiting bugs or glitches
- Accessing from unauthorized geographic locations (if geo-restricted)

**Plain language note for developer:** This section says the player gets to play the game, but they don't own it. They can't copy it, sell access to it, hack it, or bot it.

---

## 4. Account and Eligibility

**Age requirements:**
- If the game is rated for all ages: require parent/guardian consent for users under 13 (COPPA) or under 16 (GDPR in some EU countries)
- If child-directed: implement verifiable parental consent before collecting any personal information
- If 13+: state minimum age clearly
- If 18+: state this and require age verification

**Account responsibilities:**
- Player is responsible for maintaining account security
- Player must not share login credentials
- One account per person (unless specified otherwise)
- Player must provide accurate information
- Company not liable for losses due to compromised accounts (unless company's fault)

**Example clause:**

```
ELIGIBILITY

You must be at least [13/16/18] years old to create an Account and use the
Game. If you are under [13/16/18], you may only use the Game with the consent
and supervision of a parent or legal guardian who agrees to be bound by this
Agreement. We reserve the right to request proof of age or parental consent
at any time.
```

---

## 5. In-App Purchases and Virtual Currency

This section is critical for games with microtransactions.

**Key principles to establish:**

1. **No ownership.** Virtual Currency and Virtual Goods are licensed, not sold. Players have no property interest in them.

2. **No real-world value.** Virtual Currency cannot be exchanged for real money, and has no monetary value outside the Game.

3. **Non-transferable.** Players cannot trade, sell, or transfer Virtual Currency or Goods outside the Game's own systems (unless the game explicitly allows trading).

4. **Non-refundable.** All purchases are final, except where required by applicable law (EU, Australia, etc.) or platform refund policies.

5. **Developer discretion.** The developer reserves the right to manage, modify, or remove Virtual Currency and Goods at any time.

6. **Platform billing.** Clarify that purchases are processed through the platform (Apple/Google) and payment disputes go through the platform.

**Exchange rate transparency (FTC requirement post-Genshin Impact settlement):**
- If using multi-tiered virtual currency (real money → premium currency → items), clearly disclose the exchange rates
- Show real-money cost at the point of purchase, not just virtual currency cost

**Refund policy example:**

```
REFUND POLICY

All purchases of Virtual Currency and Virtual Goods are final and
non-refundable, except where required by applicable law. If you experience
a technical issue that prevents delivery of a purchased item, contact us at
[SUPPORT EMAIL] and we will investigate. If the issue is confirmed, we will
either deliver the item or provide a refund at our discretion.

Refund requests related to billing or payment processing should be directed
to the platform where the purchase was made (Apple App Store or Google Play
Store).
```

**Consumer protection note:** In the EU and Australia, consumers have statutory refund rights that cannot be waived by a EULA. Include language like: "Nothing in this section limits your statutory consumer rights under applicable law."

---

## 6. Subscription Terms

If the game offers subscriptions (battle passes, VIP memberships, etc.):

**Required disclosures:**
- Subscription period and price
- What's included in the subscription
- Auto-renewal terms (how it renews, at what price)
- How to cancel (specific steps, not vague instructions)
- What happens to unused time after cancellation
- Free trial terms (if applicable) — when the charge begins

**Cancellation must be genuinely easy.** Regulatory trend (FTC "click to cancel" rules) requires cancellation to be as easy as signup.

**Example:**

```
SUBSCRIPTION TERMS

[SUBSCRIPTION NAME] is available for $[PRICE] per [PERIOD]. Your
subscription will automatically renew at the end of each [PERIOD] unless
you cancel at least 24 hours before the renewal date.

To cancel your subscription:
- iOS: Open Settings > [Your Name] > Subscriptions > [Game Name] > Cancel
- Android: Open Google Play > Menu > Subscriptions > [Game Name] > Cancel

After cancellation, you will continue to have access to subscription
benefits until the end of your current billing period. No refunds will be
issued for partial periods.
```

---

## 7. Loot Box and Gacha Disclosures

This is a rapidly evolving area with different rules in different countries.

**Minimum disclosure (recommended for all markets):**
- State that certain items are obtained through randomized mechanics
- Disclose the odds/probability of receiving each rarity tier
- Make probability information accessible from the purchase screen
- Clearly distinguish between guaranteed and chance-based items

**Regional requirements (see compliance-checklist.md for full details):**

| Region | Requirement |
|--------|------------|
| China | Mandatory probability disclosure; restrictions on purchase frequency |
| Japan | Kompu-gacha (required collection) mechanics banned; probability disclosure expected |
| South Korea | Probability disclosure legally mandated |
| Netherlands | Loot boxes with tradeable items banned (gambling classification) |
| Belgium | All loot boxes classified as illegal gambling |
| Italy | Mandatory transparency on probability, PEGI descriptors |
| Brazil | Loot boxes banned for minors starting 2026 |
| Australia | Chance-based purchases rated minimum 15+ |
| US (FTC) | Transparency required; misleading odds = enforcement action (see Genshin Impact settlement) |

**Example disclosure:**

```
RANDOMIZED ITEMS

Certain in-game items ("Loot Boxes" or "Gacha") are obtained through
chance-based mechanics. The probability of receiving items of each rarity
tier is as follows:

- Common: [X]%
- Rare: [X]%
- Epic: [X]%
- Legendary: [X]%

[If applicable: Pity system — you are guaranteed at least one [Rare/Epic]
item within every [X] attempts.]

These probabilities are independently audited and published in-game. You
can view detailed drop rates by tapping [LOCATION IN UI].

Important: Loot Boxes contain virtual items with no real-world monetary
value. Items cannot be sold, traded, or exchanged for real money.
```

**For games targeting Belgium or Netherlands:** Do not offer loot boxes in those markets, or ensure items have no market value and cannot be traded.

---

## 8. User Conduct

Define what players can and cannot do.

**Prohibited conduct (standard list):**
- Harassment, bullying, or threatening other players
- Hate speech, discrimination, or slurs based on race, gender, religion, sexual orientation, disability, or national origin
- Sexual content or solicitation (especially critical for games accessible to minors)
- Impersonating other players or company staff
- Spamming, phishing, or social engineering
- Sharing personal information of others without consent
- Real-money trading of accounts or items (unless permitted)
- Advertising or soliciting
- Any illegal activity

**Enforcement:**
- Company may take action at its discretion (warning, suspension, permanent ban)
- Actions may be taken without prior notice for severe violations
- Account termination results in loss of all Virtual Currency and Goods (no refund)

---

## 9. User-Generated Content

If the game allows players to create content (chat, custom levels, profile images, etc.):

**License grant from player to developer:**
- Worldwide, royalty-free, perpetual, irrevocable, non-exclusive license
- Right to use, reproduce, modify, distribute, display, and create derivative works
- Right to sublicense (needed for platform distribution)
- Right to use for marketing and promotional purposes

**Player warranties:**
- Player owns or has rights to all content they submit
- Content doesn't infringe third-party rights
- Content complies with conduct rules

**Developer rights:**
- Remove User Content at any time without notice
- No obligation to store or maintain User Content
- Not responsible for User Content created by others

**Plain language note:** This section says that when a player creates something in the game (like a message, a level, or a profile picture), the developer can use it freely. The player still "owns" it in a sense, but they've given the developer a very broad license.

---

## 10. Chat and Social Features

If the game has chat, friend lists, guilds, or other social features:

**Monitoring disclosure (required):**
```
We may monitor, record, and review in-game communications (including text
chat, voice chat, and other messages) for the purposes of:
- Enforcing our community standards and this Agreement
- Preventing illegal activity and protecting player safety
- Improving our moderation systems

By using chat or communication features, you acknowledge and consent to
this monitoring.
```

**Reporting:**
- Describe how players can report abuse (in-game button, email, etc.)
- State expected response timeline (e.g., "We review reports within 48 hours")
- Explain what happens after a report (investigation, possible action)

**ESRB labeling note:** As of August 2025, ESRB conducts random audits for games with "Users Interact" labels. If the game has unfiltered voice chat, this must be disclosed and labeled.

---

## 11. Intellectual Property

**Establish ownership clearly:**
- All Game content (code, art, music, characters, UI) is owned by the developer or its licensors
- Nothing in the EULA transfers any IP rights to the player
- All trademarks, trade names, and logos are property of the developer

**Player acknowledgment:**
- Player acknowledges developer's ownership
- Player will not contest developer's IP rights
- Player will not register any confusingly similar marks

---

## 12. Account Termination

**Developer's right to terminate:**
- For violation of the EULA
- For violation of applicable law
- For conduct detrimental to other players or the Service
- At developer's discretion (with or without cause, with reasonable notice)

**Consequences of termination:**
- Loss of access to the Game and Account
- Loss of all Virtual Currency and Virtual Goods (non-refundable)
- No obligation to provide a refund for unused items
- Dispute resolution provisions survive termination

**Player's right to terminate:**
- Player may delete their account at any time
- Explain how to request account deletion
- Explain data deletion timeline (link to privacy policy)

---

## 13. Privacy and Data

Brief section bridging to the full Privacy Policy:

```
Your privacy is important to us. Our collection and use of personal
information in connection with the Game is described in our Privacy Policy,
available at [PRIVACY POLICY URL]. By using the Game, you acknowledge that
you have read and understood our Privacy Policy.
```

**Also mention:**
- What types of data are collected at a high level
- That third-party services (analytics, ads) may collect additional data
- How to exercise privacy rights (link to privacy policy)

---

## 14. Disclaimers and Limitation of Liability

**Warranty disclaimer:**
```
THE GAME IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

WE DO NOT WARRANT THAT THE GAME WILL BE UNINTERRUPTED, ERROR-FREE, OR
SECURE, OR THAT DEFECTS WILL BE CORRECTED.
```

**Limitation of liability:**
```
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
[DEVELOPER] BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
INTANGIBLE LOSSES, RESULTING FROM:

(a) YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE GAME;
(b) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY IN THE GAME;
(c) ANY CONTENT OBTAINED FROM THE GAME; OR
(d) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR CONTENT OR DATA.

OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE GAME SHALL NOT EXCEED
THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
```

**Consumer protection carve-out (required for EU, Australia, and other jurisdictions):**
```
NOTHING IN THIS AGREEMENT EXCLUDES OR LIMITS OUR LIABILITY FOR (A) DEATH
OR PERSONAL INJURY CAUSED BY OUR NEGLIGENCE; (B) FRAUD OR FRAUDULENT
MISREPRESENTATION; OR (C) ANY LIABILITY THAT CANNOT BE EXCLUDED OR LIMITED
UNDER APPLICABLE LAW.

IF YOU ARE A CONSUMER IN THE EUROPEAN UNION, UNITED KINGDOM, OR AUSTRALIA,
YOU MAY HAVE STATUTORY RIGHTS THAT CANNOT BE WAIVED. NOTHING IN THIS
AGREEMENT AFFECTS THOSE RIGHTS.
```

---

## 15. Dispute Resolution and Arbitration

**For US-targeted games, include a binding arbitration clause with class action waiver:**

```
DISPUTE RESOLUTION

PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.

You and [DEVELOPER] agree that any dispute, claim, or controversy arising
from or relating to this Agreement or the Game shall be resolved through
binding individual arbitration, rather than in court.

YOU AND [DEVELOPER] EACH WAIVE THE RIGHT TO A JURY TRIAL AND THE RIGHT
TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, OR OTHER REPRESENTATIVE
PROCEEDING.

Arbitration shall be conducted by [JAMS/AAA] under its [Consumer/Commercial]
Arbitration Rules. The arbitration shall take place in [CITY, STATE] or,
at your election, may be conducted by phone, video, or based on written
submissions.

OPT-OUT RIGHT: You may opt out of this arbitration agreement by sending
written notice to [EMAIL/ADDRESS] within 30 days of first accepting this
Agreement. Your notice must include your name, Account username, email
address, and a clear statement that you wish to opt out.

EXCEPTIONS: Either party may bring claims in small claims court if eligible.
Either party may seek injunctive relief in any court of competent
jurisdiction for IP infringement or unauthorized use.
```

**Why include an opt-out?** Courts look more favorably on arbitration clauses that give consumers a genuine choice. The 30-day opt-out window is industry standard (used by Blizzard, Epic, Niantic).

**EU note:** Arbitration clauses are generally unenforceable against consumers in the EU. Include a carve-out stating the arbitration section does not apply where prohibited by law.

---

## 16. Governing Law

Choose governing law based on developer's location:

```
This Agreement shall be governed by and construed in accordance with the
laws of [STATE/COUNTRY], without regard to its conflict of law provisions.
```

Common choices:
- US developers: California, Delaware, Washington, or New York
- EU developers: Country of incorporation
- Include forum selection clause (exclusive jurisdiction in specific courts)

---

## 17. Changes to This Agreement

```
We may update this Agreement from time to time. We will notify you of
material changes by [posting a notice in the Game / sending an email /
displaying a pop-up on next login]. Your continued use of the Game after
changes take effect constitutes acceptance of the updated terms.

If you do not agree with any changes, you may stop using the Game and
delete your Account.
```

---

## 18. Apple App Store Requirements

Apple requires custom EULAs to include ALL of the following (if a custom EULA is not provided, Apple's standard EULA applies):

1. **Single-party acknowledgment** — The EULA is between the user and the developer only, not Apple.
2. **Apple has no responsibility** for the app or its content.
3. **License scope** — Limited, non-transferable, revocable; usable only on Apple devices the user owns.
4. **Maintenance and support** — Developer is solely responsible.
5. **Warranty** — Developer is solely responsible for any product warranties.
6. **Product claims** — Developer handles all claims, including product liability and IP infringement.
7. **Legal compliance** — User represents they are not in a US-embargoed country and not on a restricted list.
8. **Third-party terms** — User must comply with applicable third-party terms.
9. **Third-party beneficiary** — Apple and its subsidiaries are third-party beneficiaries of the EULA.
10. **Contact information** — Developer's contact for questions and complaints.

**Include this block verbatim (customized with developer info):**

```
APPLE APP STORE ADDITIONAL TERMS

If you downloaded the Game from the Apple App Store, the following
additional terms apply:

(a) This Agreement is between you and [DEVELOPER], not Apple Inc.
("Apple"). Apple is not responsible for the Game or its content.

(b) Apple has no obligation to provide maintenance or support for the Game.

(c) If the Game fails to conform to any applicable warranty, you may notify
Apple and Apple will refund the purchase price (if any). Apple has no other
warranty obligation with respect to the Game.

(d) Apple is not responsible for addressing any claims by you or any third
party relating to the Game, including product liability claims, claims that
the Game fails to conform to applicable law, or claims under consumer
protection or similar legislation.

(e) In the event of any third-party claim that the Game infringes a third
party's intellectual property rights, [DEVELOPER], not Apple, is solely
responsible for the investigation, defense, settlement, and discharge of
any such claim.

(f) You represent and warrant that (i) you are not located in a country
subject to a U.S. Government embargo or designated as a "terrorist
supporting" country, and (ii) you are not listed on any U.S. Government
list of prohibited or restricted parties.

(g) Apple and Apple's subsidiaries are third-party beneficiaries of this
Agreement. Upon your acceptance, Apple will have the right to enforce this
Agreement against you as a third-party beneficiary.

(h) For questions or complaints about the Game, contact [DEVELOPER] at
[CONTACT EMAIL].
```

---

## 19. Google Play Considerations

Google Play does not require a EULA, but having one protects the developer's IP. If targeting Android:

- Reference Google Play's terms of service
- Clarify Google handles billing for in-app purchases
- Direct billing disputes to Google Play
- Include Google Play's refund policies
- Ensure privacy policy is linked in the Play Console

---

## 20. Anti-Cheat and Fair Play

```
FAIR PLAY

You agree not to:

(a) Use any unauthorized third-party software that intercepts, "mines,"
or otherwise collects information from or through the Game;

(b) Use any software that modifies the Game client or its operation;

(c) Use cheats, exploits, automation software, bots, hacks, mods, or any
unauthorized third-party software designed to gain an unfair advantage;

(d) Exploit bugs, glitches, or game mechanics in unintended ways;

(e) Engage in boosting, account sharing, or any activity that
circumvents the Game's intended progression systems;

(f) Interfere with or disrupt servers, networks, or other players'
enjoyment of the Game.

We employ anti-cheat measures to detect and prevent unfair play. Violation
of this section may result in immediate and permanent account suspension
without prior warning. All Virtual Currency and Goods on suspended accounts
are forfeited without refund.
```

---

## 21. DMCA and IP Protection

```
INTELLECTUAL PROPERTY CLAIMS

We respect the intellectual property rights of others. If you believe that
any content in the Game infringes your copyright, you may submit a notice
pursuant to the Digital Millennium Copyright Act (DMCA) or equivalent
local law to:

[DEVELOPER LEGAL NAME]
Attn: Legal Department
[ADDRESS]
[EMAIL]

Your notice must include:
- A description of the copyrighted work you claim is infringed
- A description of where the allegedly infringing material is located
- Your contact information
- A statement that you have a good faith belief the use is not authorized
- A statement that the information is accurate, under penalty of perjury
- Your physical or electronic signature
```

---

## 22. General Provisions

Include standard boilerplate:

- **Entire Agreement** — This Agreement constitutes the entire agreement between the parties.
- **Severability** — If any provision is found unenforceable, the remaining provisions remain in effect.
- **Waiver** — Failure to enforce any provision is not a waiver of that provision.
- **Assignment** — Developer may assign this Agreement; player may not.
- **Force Majeure** — Neither party liable for failures due to events beyond reasonable control.
- **Contact** — Full contact information for legal notices.
