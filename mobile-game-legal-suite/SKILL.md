---
name: mobile-game-legal-suite
description: |
  Draft complete legal document suites for mobile game developers launching on publisher platforms — EULAs, privacy policies, revenue-share/publishing agreements, and license documentation. Tailored for games with in-app purchases, social/multiplayer features, and global distribution. Use this skill whenever someone mentions: EULA, privacy policy for a game or app, game publishing agreement, revenue share agreement, mobile game legal documents, app store compliance, in-app purchase terms, loot box disclosures, game licensing, or any legal documentation for mobile games or apps. Also use it when someone says they're "launching a game" or "publishing an app" and needs legal paperwork, even if they don't use legal terminology.
---

# Mobile Game Legal Document Suite

You are helping a **non-lawyer** game developer create professional legal documents for launching a mobile game on a publisher's platform. Your job is to produce documents that are thorough enough to protect the developer while being understandable to someone without legal training.


## How This Skill Works

This skill covers four document types. When the user asks for help, figure out which documents they need and generate them one at a time (they're substantial). The four document types are:

1. **EULA (End User License Agreement)** — What players agree to when they use the game
2. **Privacy Policy** — How player data is collected, used, and protected
3. **Publishing/Revenue Share Agreement** — The deal between developer and publisher
4. **License Agreement** — IP licensing terms for the game and its assets

For each document, you'll interview the user to gather the specifics of their game, then generate a customized document using the templates and clause libraries in the `references/` folder.

## Step 1: Interview the Developer

Before generating any document, gather this essential information. Ask conversationally — don't dump a form on them. You can spread questions across a few messages.

### About the Game
- Game name and brief description
- Genre and core gameplay loop
- Target platforms (iOS, Android, both, other)
- Does it have in-app purchases? What kind? (cosmetics, currency, loot boxes/gacha, battle pass, subscriptions)
- Does it have social/multiplayer features? (chat, friend lists, guilds, PvP, co-op)
- Does it have user-generated content? (custom levels, chat messages, profile pictures)
- Target age rating (is it directed at children under 13?)
- Target markets/regions (worldwide? specific countries?)

### About the Developer
- Company/developer name and location (jurisdiction matters for governing law)
- Developer entity type (LLC, Corp, sole proprietor, etc.)
- Contact email for legal notices

### About the Publisher (if applicable)
- Publisher name and location
- What the publisher provides (funding, marketing, UA, localization, server hosting)
- Rough revenue split being discussed
- Exclusivity arrangement (exclusive, non-exclusive, regional)
- Term length being considered

### About Data Practices
- What analytics SDKs are used? (Firebase, Unity Analytics, GameAnalytics, etc.)
- What ad networks? (AdMob, ironSource, AppLovin, etc.)
- Social login options? (Google, Facebook, Apple Sign-In)
- Anti-cheat solution?
- Cloud save provider?
- Customer support tool?

## Step 2: Generate the Documents

### Generating a EULA

Read `references/eula-guide.md` before drafting. The EULA must cover these areas (adapt based on what the game actually has):

**Always include:**
- License grant (what players can and can't do)
- Account terms and eligibility (age requirements)
- Intellectual property ownership
- Limitation of liability and warranty disclaimers
- Termination provisions
- Governing law and dispute resolution
- Changes to terms and notification
- Contact information
- Bridge to privacy policy

**Include if the game has in-app purchases:**
- Virtual currency and virtual goods terms (no real-world value, non-transferable)
- Refund policy (generally non-refundable, with legal exceptions)
- Subscription auto-renewal terms and cancellation process
- Loot box / gacha probability disclosure requirements (varies by region — see compliance checklist)

**Include if the game has social/multiplayer:**
- User conduct rules and prohibited behavior
- Chat monitoring disclosure
- Content moderation and reporting
- User-generated content license grant

**Include if targeting the US:**
- Arbitration clause with class action waiver (include 30-day opt-out right)
- COPPA compliance section (if mixed-audience or child-directed)

**Include for EU/global:**
- GDPR-compliant data processing references
- DSA compliance for content moderation
- Regional loot box disclosure requirements

**Platform requirements:**
- Apple App Store requires 10 specific provisions in custom EULAs — make sure all are present. See `references/eula-guide.md` for the full list.
- Google Play doesn't require a EULA but strongly benefits from one for IP protection.

### Generating a Privacy Policy

Read `references/privacy-policy-guide.md` before drafting. This is the most regulation-heavy document. The privacy policy must be:

- Written in plain language (8th grade reading level)
- Layered (summary + detailed sections)
- Specific about what data is collected and why
- Honest about third-party sharing

**Structure:**
1. Who We Are (company info, contact, DPO if needed)
2. What Data We Collect (organized by category with specific examples)
3. How We Collect It (directly, automatically via SDKs, from third parties)
4. Why We Collect It (service provision, improvement, ads, legal compliance)
5. Who We Share It With (list every category of third party)
6. How Long We Keep It (retention periods by data type)
7. Your Rights (organized by jurisdiction — GDPR, CCPA, COPPA)
8. Children's Privacy (age gates, parental consent, data minimization)
9. International Data Transfers (where data goes, legal mechanisms)
10. Data Security (what measures are in place)
11. Changes to This Policy
12. Contact Us (including DSAR submission process)

**Critical compliance areas** (read the compliance checklist in `references/compliance-checklist.md`):
- COPPA 2025 amendments (effective June 2025, full compliance April 2026)
- GDPR requirements for EU users
- CCPA/CPRA requirements for California users
- Apple App Tracking Transparency disclosure
- Google Play Data Safety section alignment
- State-level US privacy laws (Virginia, Colorado, Connecticut, etc.)

### Generating a Publishing/Revenue Share Agreement

Read `references/publishing-agreement-guide.md` before drafting. This is the business deal between developer and publisher.

**Key sections:**
1. Definitions (net revenue, gross revenue, platform fees, territory, etc.)
2. Grant of Rights (what publisher can do with the game)
3. Revenue Share (split, tiers, platform fee handling, ad revenue, subscriptions)
4. Advances and Minimum Guarantees (if any)
5. Publisher Obligations (marketing, UA, localization, support)
6. Developer Obligations (development, updates, live ops, bug fixes)
7. IP Ownership and Licensing
8. Financial Terms (payment schedule, reporting, audit rights, taxes)
9. Performance Milestones and KPIs
10. Term and Renewal
11. Termination and Wind-Down
12. Representations and Warranties
13. Indemnification
14. Confidentiality
15. Force Majeure
16. Miscellaneous (entire agreement, amendments, notices, severability)

**Important guidance for the developer (non-lawyer audience):**
- Explain what "net revenue" vs "gross revenue" means in plain terms and why it matters enormously
- Flag common traps: perpetual licenses, IP assignment vs licensing, broad exclusivity
- Note typical industry ranges so they know if a deal is fair
- Highlight the most important clauses to negotiate (rev share, IP ownership, term length, termination rights)

### Generating a License Agreement

For IP licensing between developer and publisher or developer and third parties (music, art assets, middleware). Read `references/publishing-agreement-guide.md` for IP-specific guidance.

**Key sections:**
1. Licensed IP (what's being licensed — game, characters, music, code, etc.)
2. License Grant (exclusive vs non-exclusive, territory, platform, duration)
3. Restrictions (what the licensee can't do)
4. Royalties and Payment (if applicable)
5. IP Ownership (who owns what, derivative works)
6. Quality Control (approval rights for licensed use)
7. Representations and Warranties
8. Indemnification
9. Term and Termination
10. Survival Clauses

## Step 3: Review and Refine

After generating each document:

1. **Highlight risk areas** — Point out sections that are especially important to get right or that have the most legal exposure.
2. **Explain in plain language** — For each major section, add a brief note explaining what it means and why it's there. The developer should understand what they're agreeing to.
3. **Flag jurisdiction-specific requirements** — If the game targets specific regions, note which sections need adjustment.
4. **Suggest next steps** — Always recommend attorney review before using any document.

## Writing Style for Legal Documents

These documents need to be legally sound while remaining readable by a non-lawyer:

- Use headers and numbered sections for navigation
- Define terms on first use (in a definitions section AND inline)
- Avoid unnecessary Latin or archaic legal language
- Use "you" for the user/player and "we" for the developer/company
- Keep sentences under 25 words where possible
- Use bullet points for lists of rights, obligations, or prohibited conduct
- Bold key terms when first defined

## Reference Files

The `references/` directory contains detailed guidance for each document type:

- **`eula-guide.md`** — Comprehensive EULA template with clause-by-clause guidance, platform requirements (Apple/Google), in-app purchase terms, loot box disclosures, social features, anti-cheat provisions, and regional compliance notes. Read this before drafting any EULA.

- **`privacy-policy-guide.md`** — Privacy policy template covering GDPR, CCPA/CPRA, COPPA (2025 amendments), mobile-specific data practices (device IDs, analytics SDKs, ad networks, social login), platform requirements (Apple nutrition labels, Google Data Safety), children's privacy, and third-party disclosure requirements. Read this before drafting any privacy policy.

- **`publishing-agreement-guide.md`** — Publishing and revenue share agreement template with industry-standard terms, typical rev-share ranges, platform fee handling (gross vs net), IP ownership models, termination and wind-down provisions, financial terms, audit rights, and protective clauses. Also covers license agreement structures. Read this before drafting any publishing or license agreement.

- **`compliance-checklist.md`** — Region-by-region compliance requirements covering US federal (COPPA, FTC), US state laws (CCPA, VCDPA, etc.), EU (GDPR, DSA), and international jurisdictions. Includes loot box regulation status by country, children's privacy requirements, and platform-specific obligations. Reference this when ensuring documents meet regional requirements.
