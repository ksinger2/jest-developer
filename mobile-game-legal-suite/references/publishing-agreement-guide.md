# Publishing & Revenue Share Agreement Guide

This guide covers drafting publishing agreements, revenue share agreements, and IP license agreements for mobile game developer-publisher deals.

## Table of Contents

1. [Document Structure](#1-document-structure)
2. [Definitions](#2-definitions)
3. [Grant of Rights](#3-grant-of-rights)
4. [Revenue Share and Financial Terms](#4-revenue-share)
5. [Advances and Minimum Guarantees](#5-advances-and-guarantees)
6. [Publisher Obligations](#6-publisher-obligations)
7. [Developer Obligations](#7-developer-obligations)
8. [IP Ownership and Licensing](#8-ip-ownership)
9. [Payment and Reporting](#9-payment-and-reporting)
10. [Performance Milestones](#10-performance-milestones)
11. [Term and Renewal](#11-term-and-renewal)
12. [Termination and Wind-Down](#12-termination)
13. [Representations and Warranties](#13-representations)
14. [Indemnification](#14-indemnification)
15. [Confidentiality](#15-confidentiality)
16. [Miscellaneous Provisions](#16-miscellaneous)
17. [License Agreement Specifics](#17-license-agreement)
18. [Industry Benchmarks](#18-industry-benchmarks)

---

## 1. Document Structure

A publishing agreement is a business contract between a game developer and a publisher. Unlike the EULA and privacy policy (which are consumer-facing), this is a negotiated agreement between two businesses.

**Tone guidance:** While still written in legal language, explain key concepts in plain language when generating for a non-lawyer developer. Use sidebars or notes like: "What this means: The publisher gets to distribute your game exclusively, but you keep ownership of the characters and story."

**Standard structure:**
1. Preamble (parties, recitals, date)
2. Definitions
3. Grant of Rights
4. Revenue Share
5. Advances/Guarantees
6. Obligations (publisher and developer)
7. IP and Licensing
8. Financial Terms
9. Performance Requirements
10. Term and Termination
11. Protective Provisions (reps, warranties, indemnification)
12. General Provisions

---

## 2. Definitions

Critical definitions that shape the entire deal. Get these right.

**"Gross Revenue"** — All revenue received from exploitation of the Game, before any deductions. This includes in-app purchases, ad revenue, subscription revenue, and any other monetization.

**"Net Revenue"** — Gross Revenue minus agreed-upon deductions. This is what gets split. Typical deductions:
- Platform fees (Apple 30%, Google 30%, or applicable rate)
- Payment processing fees (2-3%)
- Applicable taxes (VAT, GST, sales tax collected by platforms)
- Chargebacks and fraud losses
- [Sometimes: user acquisition costs, server costs — negotiate carefully]

**Why this matters:** The difference between splitting Gross vs Net revenue is enormous. A 50/50 split on Gross means the developer gets 50 cents of every dollar. A 50/50 split on Net (after 30% platform fee) means the developer gets 35 cents. Always clarify what "revenue" means.

**"Territory"** — Geographic regions where the publisher has rights. "Worldwide" is common but may have carve-outs (e.g., China, Japan).

**"Term"** — How long the agreement lasts.

**"Game"** — The specific game being published, including updates, DLC, and expansions (scope this carefully).

**"Intellectual Property" or "Game IP"** — All copyrights, trademarks, trade secrets, patents, and other IP rights in and to the Game.

**"Deliverables"** — What the developer must provide (game builds, assets, marketing materials, localization files).

---

## 3. Grant of Rights

This defines what the publisher is allowed to do with the game.

**Key variables to negotiate:**

| Variable | Developer-Friendly | Publisher-Friendly |
|----------|-------------------|-------------------|
| Exclusivity | Non-exclusive | Exclusive worldwide |
| Territory | Limited regions | Worldwide |
| Platform | Specified platforms only | All platforms |
| Duration | Time-limited (3-5 years) | Perpetual |
| Sublicensing | No sublicensing | Broad sublicensing |
| Derivative works | Developer retains | Publisher controls |

**Developer-friendly example:**

```
Developer grants Publisher a non-exclusive, limited license to distribute,
market, and sell the Game on iOS and Android platforms in [TERRITORIES]
for the Term of this Agreement. Publisher may not sublicense these rights
without Developer's prior written consent. All rights not expressly
granted are reserved by Developer.
```

**Publisher-friendly example:**

```
Developer grants Publisher an exclusive, worldwide license to distribute,
market, sell, sublicense, and exploit the Game on all platforms and in all
media now known or hereafter developed, for the Term of this Agreement.
Publisher may sublicense to third-party distribution platforms as necessary.
```

**Advice to developer:** Push for non-exclusive or limited exclusivity. If granting exclusive rights, ensure there are performance thresholds — if the publisher doesn't hit revenue targets, rights revert to you.

---

## 4. Revenue Share and Financial Terms

### Industry-Standard Splits (2024-2026)

| Scenario | Developer Share | Publisher Share |
|----------|----------------|-----------------|
| No advance, publisher does marketing/UA | 55-65% | 35-45% |
| Small advance ($50K-$200K) | 45-55% | 45-55% |
| Large advance ($500K+) | 30-45% | 55-70% |
| Publisher owns IP | 20-35% | 65-80% |

These are shares of **Net Revenue** (after platform fees and taxes).

### Platform Fee Handling

Spell out explicitly how platform fees are treated:

```
"Net Revenue" shall mean all Gross Revenue actually received by Publisher
from exploitation of the Game, less the following deductions:

(a) Platform fees charged by Apple, Google, or other distribution platforms
    (currently 30% of Gross Revenue, subject to applicable small business
    or subscription reductions);
(b) Payment processing fees charged by payment service providers;
(c) Applicable sales, use, value-added, goods and services, withholding,
    and similar taxes actually paid or required to be collected;
(d) Chargebacks, refunds, and returns actually credited to end users.

No other deductions shall be made without Developer's prior written consent.
```

**Red flag for developers:** Watch out for publishers who want to deduct marketing costs, server costs, or "overhead" from revenue before the split. These should ideally be the publisher's cost of doing business, not deducted from shared revenue. If the publisher insists on deducting UA costs, cap them.

### Tiered Revenue Sharing

Performance-based tiers reward success:

```
Revenue Share shall be calculated as follows:

(a) Until cumulative Net Revenue reaches $[X] ("Recoupment"):
    Developer: [40]% | Publisher: [60]%

(b) After Recoupment until cumulative Net Revenue reaches $[Y]:
    Developer: [55]% | Publisher: [45]%

(c) After cumulative Net Revenue exceeds $[Y]:
    Developer: [65]% | Publisher: [35]%
```

### Ad Revenue vs IAP Revenue

These may have different splits:

```
In-App Purchase Net Revenue: Developer [60]% | Publisher [40]%
Advertising Net Revenue: Developer [50]% | Publisher [50]%
Subscription Net Revenue: Developer [60]% | Publisher [40]%
```

---

## 5. Advances and Minimum Guarantees

### Advances

An advance is money paid upfront, recoupable against future royalties.

```
Publisher shall pay Developer a non-refundable advance of $[AMOUNT]
(the "Advance"), payable as follows:

(a) $[AMOUNT] upon execution of this Agreement;
(b) $[AMOUNT] upon delivery of the Alpha build;
(c) $[AMOUNT] upon delivery of the Gold Master build;
(d) $[AMOUNT] upon commercial launch on both iOS and Android.

The Advance shall be recoupable against Developer's share of Net Revenue.
For clarity, the Advance is non-refundable — if the Game does not generate
sufficient revenue to recoup the Advance, Developer shall not be required
to repay any portion.
```

**Advice to developer:** "Recoupable" means the publisher deducts the advance from your royalties until they've gotten their money back. "Non-refundable" means you don't have to pay it back if the game flops. Always ensure your advance is non-refundable.

### Minimum Guarantees

Minimum guarantees ensure the developer receives a minimum payment regardless of performance:

```
Publisher guarantees that Developer shall receive no less than $[AMOUNT]
per year in aggregate payments (including Advance recoupment) during each
year of the Term ("Annual Minimum Guarantee"). If Developer's royalty
share for any contract year falls below the Annual Minimum Guarantee,
Publisher shall pay the difference within [30] days of the end of such
contract year.
```

---

## 6. Publisher Obligations

What the publisher commits to doing:

**Marketing and User Acquisition:**
```
Publisher shall:
(a) Develop and execute a marketing plan for the Game, including but not
    limited to paid user acquisition, app store optimization, social media
    promotion, and influencer marketing;
(b) Spend no less than $[AMOUNT] on user acquisition during the first
    [12] months following launch ("Minimum Marketing Commitment");
(c) Provide Developer with monthly marketing reports detailing spend,
    channels, and performance metrics;
(d) Obtain Developer's prior approval for all marketing materials that
    use Game IP (not to be unreasonably withheld).
```

**Localization:**
```
Publisher shall be responsible for localizing the Game into the following
languages: [LIST]. Localization costs shall be borne by Publisher and
shall not be deducted from Net Revenue.
```

**Platform Relations:**
```
Publisher shall manage all relationships with platform holders (Apple,
Google) including app store submissions, feature requests, and compliance
maintenance.
```

**Customer Support:**
```
Publisher shall provide first-line customer support for the Game in
[LANGUAGES], including responding to user inquiries within [24-48] hours
of receipt.
```

---

## 7. Developer Obligations

What the developer commits to doing:

**Development and Delivery:**
```
Developer shall:
(a) Deliver the Game in accordance with the Development Schedule attached
    as Exhibit A;
(b) Ensure the Game meets the Technical Requirements attached as Exhibit B;
(c) Deliver all required assets including marketing materials, screenshots,
    trailers, and app store descriptions;
(d) Maintain the Game post-launch for a minimum of [12-24] months,
    including bug fixes, balance updates, and content updates as outlined
    in the Live Operations Plan (Exhibit C).
```

**Live Operations:**
```
Developer shall provide ongoing live operations support including:
(a) Regular content updates [monthly/quarterly] per the content roadmap;
(b) Bug fixes and stability patches within [48-72] hours for critical issues;
(c) Balance adjustments as needed based on player data;
(d) Seasonal events and promotions [X] times per year;
(e) Compatibility updates for new OS versions within [30] days of release.
```

**SDK Integration:**
```
Developer shall integrate the following SDKs as specified by Publisher:
[LIST OF REQUIRED SDKs — analytics, ad mediation, attribution, etc.]
```

---

## 8. IP Ownership and Licensing

This is one of the most important sections. There are three common models:

### Model A: Developer Retains Full Ownership (Recommended)

```
All Intellectual Property rights in and to the Game, including all code,
artwork, characters, storylines, music, and other creative elements
(collectively, "Game IP"), are and shall remain the sole and exclusive
property of Developer.

Nothing in this Agreement transfers any ownership interest in the Game IP
to Publisher. Publisher's rights are limited to the license expressly
granted in Section [X].

All marketing materials, trailers, and promotional content created by
Publisher using Game IP shall be owned by Developer, with Publisher
retaining a license to use such materials during the Term.
```

**Why this is best for developers:** You keep your characters, your world, your code. If the deal ends, you can take your game elsewhere. You can make sequels without needing the publisher's permission.

### Model B: Publisher Acquires IP (Avoid If Possible)

```
Developer hereby assigns to Publisher all right, title, and interest in
and to the Game IP, including all copyrights, trademarks, and other
intellectual property rights therein. Developer shall execute any documents
necessary to perfect such assignment.

Publisher grants Developer a non-exclusive, royalty-free license to use the
Game IP solely for Developer's portfolio and promotional purposes.
```

**Warning to developer:** This means the publisher owns your game. They can make sequels without you, license it to others, or shelve it. Only agree to this if the compensation is very substantial (typically 6-7 figure advances).

### Model C: Shared/Split Ownership

```
Developer owns all pre-existing IP contributed to the Game ("Developer IP").
Publisher owns all IP created specifically for the publishing arrangement,
including marketing materials, localized assets, and publisher-created
promotional content ("Publisher IP"). IP created jointly during development
("Joint IP") shall be jointly owned, with each party having the
non-exclusive right to exploit Joint IP independently.
```

### Derivative Works and Sequels

```
Developer retains the exclusive right to create derivative works based
on the Game IP, including sequels, prequels, spin-offs, and adaptations
to other media. Publisher shall have a right of first refusal to publish
any such derivative work, exercisable within [60] days of Developer's
written notice, on terms no less favorable than this Agreement.
```

### Third-Party IP

```
Developer represents and warrants that:
(a) All third-party software, middleware, and tools used in the Game are
    properly licensed;
(b) All music, sound effects, and audio are either original works or
    properly licensed for use in commercial games distributed worldwide;
(c) All artwork and visual assets are either original works or properly
    licensed;
(d) No open-source software subject to "copyleft" obligations (such as
    GPL) is incorporated into the Game in a manner that would require
    disclosure of the Game's source code.
```

---

## 9. Payment and Reporting

**Reporting:**
```
Publisher shall provide Developer with detailed revenue reports within
[30] days of the end of each calendar [month/quarter], including:

(a) Gross Revenue by platform (iOS, Android, other);
(b) Itemized deductions (platform fees, taxes, chargebacks);
(c) Net Revenue calculation;
(d) Developer's share;
(e) Cumulative revenue and advance recoupment status;
(f) Key performance metrics (DAU, MAU, ARPU, retention rates).

Publisher shall provide Developer with real-time access to a revenue
dashboard [or analytics platform] showing daily revenue and key metrics.
```

**Payment:**
```
Publisher shall pay Developer's share of Net Revenue within [45] days of
the end of each calendar [month/quarter]. Payments shall be made by
[wire transfer/ACH] to Developer's designated bank account.

All payments shall be in [USD]. If revenue is received in other currencies,
conversion shall be at the exchange rate published by [source] on the last
business day of the reporting period.
```

**Audit Rights:**
```
Developer shall have the right, at Developer's expense, to audit
Publisher's books and records relating to the Game, no more than once per
calendar year, upon [30] days' written notice. The audit shall be
conducted by an independent certified public accountant.

If the audit reveals an underpayment of [5]% or more for any reporting
period, Publisher shall (a) immediately pay the underpayment with interest
at [1.5]% per month, and (b) reimburse Developer for the reasonable cost
of the audit.
```

**Tax:**
```
Each party shall be responsible for its own income taxes. Publisher may
withhold taxes as required by applicable law and shall provide Developer
with documentation of any withholding. Publisher shall use commercially
reasonable efforts to minimize withholding where treaty benefits or
exemptions are available.
```

---

## 10. Performance Milestones

Define KPIs that trigger consequences:

```
Publisher shall achieve the following milestones:

(a) LAUNCH MILESTONE: Commercially launch the Game on both iOS and Android
    within [90] days of receiving the Gold Master build.

(b) MARKETING MILESTONE: Achieve [X] installs within the first [180] days
    of launch.

(c) REVENUE MILESTONE: Generate cumulative Net Revenue of at least
    $[AMOUNT] within the first [12] months of launch.

(d) RETENTION MILESTONE: Maintain Day-1 retention of at least [30]% and
    Day-7 retention of at least [10]% (measured monthly, averaged over
    rolling 90-day periods).

If Publisher fails to meet any milestone, Developer may, upon [30] days'
written notice:
(i) Convert the exclusive license to non-exclusive; or
(ii) Terminate this Agreement per Section [TERMINATION].
```

---

## 11. Term and Renewal

```
TERM

This Agreement shall commence on the Effective Date and continue for an
initial term of [3-5] years from the commercial launch date (the "Initial
Term").

RENEWAL

Following the Initial Term, this Agreement shall automatically renew for
successive [1-2] year periods (each a "Renewal Term"), unless either party
provides written notice of non-renewal at least [90-180] days before the
end of the then-current term.

The Initial Term and any Renewal Terms are collectively the "Term."
```

**Advice to developer:** Avoid perpetual terms. 3-5 years is standard for an initial term. Ensure you can exit if the publisher underperforms. Automatic renewal is fine as long as the notice period gives you time to find alternatives.

---

## 12. Termination and Wind-Down

**Termination for Cause:**
```
Either party may terminate this Agreement immediately upon written notice
if the other party:

(a) Materially breaches this Agreement and fails to cure such breach
    within [30] days of receiving written notice;
(b) Becomes insolvent, files for bankruptcy, or makes an assignment for
    the benefit of creditors;
(c) Is found to have committed fraud or willful misconduct in connection
    with this Agreement.

Developer may terminate immediately if Publisher fails to make any payment
when due and does not cure within [15] days of notice.
```

**Termination for Convenience:**
```
Either party may terminate this Agreement for any reason upon [90] days'
written notice to the other party, provided that:

(a) All accrued payment obligations are satisfied;
(b) The terminating party cooperates with the wind-down process.
```

**Wind-Down:**
```
Upon termination or expiration:

(a) All rights granted to Publisher shall revert to Developer within [30]
    days;
(b) Publisher shall remove the Game from all distribution platforms within
    [30] days (or transfer platform accounts to Developer);
(c) Existing players who downloaded the Game before termination may
    continue to use their installed copies;
(d) Publisher shall provide Developer with all user data, analytics data,
    and marketing materials within [30] days, in a standard, machine-
    readable format;
(e) Publisher shall continue to pay Developer's share of any revenue
    received after termination from prior-period sales;
(f) Publisher shall provide reasonable transition assistance for a period
    of [90] days following termination.

SURVIVAL: Sections [Confidentiality], [Indemnification], [Limitation of
Liability], [Audit Rights], and [Payment of Accrued Amounts] shall survive
termination.
```

---

## 13. Representations and Warranties

**Developer warrants:**
- It has authority to enter the agreement
- It owns or has properly licensed all Game IP
- The Game does not infringe third-party rights
- The Game complies with applicable laws (privacy, consumer protection, etc.)
- No undisclosed encumbrances or competing agreements
- Game is free of malware, viruses, or intentional vulnerabilities

**Publisher warrants:**
- It has authority to enter the agreement
- It will perform its obligations with professional skill and care
- It will comply with applicable laws in marketing and distributing the Game
- It will not make unauthorized modifications to the Game
- It maintains adequate insurance coverage

---

## 14. Indemnification

```
DEVELOPER INDEMNIFICATION

Developer shall indemnify, defend, and hold harmless Publisher from any
third-party claims arising from:
(a) Infringement of intellectual property rights by the Game;
(b) Developer's breach of representations and warranties;
(c) Developer's negligence or willful misconduct.

PUBLISHER INDEMNIFICATION

Publisher shall indemnify, defend, and hold harmless Developer from any
third-party claims arising from:
(a) Publisher's marketing or distribution activities;
(b) Publisher's breach of representations and warranties;
(c) Publisher's negligence or willful misconduct;
(d) Publisher's unauthorized modification of the Game.

INDEMNIFICATION PROCEDURES

The indemnified party shall:
(i) Promptly notify the indemnifying party of any claim;
(ii) Provide reasonable cooperation in the defense;
(iii) Not settle any claim without the indemnifying party's consent.

The indemnifying party shall control the defense and may settle claims,
provided settlement does not impose liability on the indemnified party
without consent.

LIMITATION: Neither party's aggregate indemnification liability shall
exceed [the greater of $[AMOUNT] or [X] times the total payments made
under this Agreement in the preceding 12 months].
```

---

## 15. Confidentiality

```
CONFIDENTIAL INFORMATION

"Confidential Information" means any non-public information disclosed by
either party, including business plans, financial data, player data,
technical specifications, source code, marketing strategies, and the terms
of this Agreement.

OBLIGATIONS

Each party shall:
(a) Protect Confidential Information with at least the same care it uses
    for its own confidential information (but no less than reasonable care);
(b) Use Confidential Information only for purposes of this Agreement;
(c) Not disclose Confidential Information to third parties without prior
    written consent, except to employees and contractors who need to know
    and are bound by equivalent obligations.

EXCEPTIONS

Confidential Information does not include information that:
(a) Is or becomes publicly available without breach of this Agreement;
(b) Was already known to the receiving party before disclosure;
(c) Is independently developed without reference to Confidential Information;
(d) Is required to be disclosed by law or court order (with prior notice
    to the disclosing party where permitted).

DURATION: Confidentiality obligations survive for [3-5] years after
termination. Trade secrets are protected indefinitely.
```

---

## 16. Miscellaneous Provisions

Standard boilerplate, but each is important:

- **Entire Agreement:** This Agreement constitutes the complete agreement; supersedes all prior discussions.
- **Amendments:** Changes only in writing signed by both parties.
- **Severability:** Invalid provisions are severed; remainder stays in effect.
- **Waiver:** Failure to enforce a provision is not a waiver.
- **Assignment:** Neither party may assign without consent; except publisher may assign in connection with merger/acquisition (developer should push back on this or require consent).
- **Force Majeure:** Neither party liable for delays caused by events beyond reasonable control (natural disaster, pandemic, government action). If force majeure exceeds [90] days, either party may terminate.
- **Notices:** How formal notices are delivered (email acceptable? registered mail?). Specify addresses.
- **Governing Law:** Law of [jurisdiction]. Courts of [jurisdiction] have exclusive jurisdiction.
- **Independent Contractors:** The parties are independent contractors, not partners or joint venturers.
- **Counterparts:** May be signed in counterparts, each of which is an original.

---

## 17. License Agreement Specifics

When the document needed is a standalone IP license (not a full publishing deal):

### Structure

1. **Licensed IP** — Precisely define what's being licensed (game code, characters, music, trademarks, etc.)
2. **License Grant** — Exclusive or non-exclusive; territory; platform; duration; sublicensing rights
3. **Restrictions** — What the licensee cannot do with the IP
4. **Royalties** — Payment structure for the license
5. **Quality Control** — Licensor's right to approve uses of licensed IP
6. **IP Ownership** — Confirm licensor retains ownership
7. **Derivative Works** — Who can create them; who owns them
8. **Term and Termination** — Duration and reversion
9. **Reps, Warranties, Indemnification** — Similar to publishing agreement
10. **General Provisions** — Standard boilerplate

### Music Licensing for Games

Two separate licenses needed:
- **Synchronization license** (from the music publisher/songwriter) — right to use the composition
- **Master use license** (from the record label) — right to use a specific recording

If using original music, ensure work-for-hire agreement with the composer/studio.

### Middleware and Engine Licensing

- Unity and Unreal have their own license terms
- Document all middleware used and their license types
- Ensure no copyleft (GPL) obligations that would require open-sourcing game code
- Include a "bill of materials" listing all third-party components

---

## 18. Industry Benchmarks

Reference data for the developer to assess whether a deal is fair:

### Typical Deal Structures (2024-2026)

| Developer Stage | Advance | Rev Share (Dev/Pub) | Term | IP Ownership |
|----------------|---------|--------------------|----|-------------|
| First-time indie | $0-$50K | 50/50 to 60/40 | 3-5 years | Developer |
| Proven indie | $50K-$250K | 55/45 to 65/35 | 3-5 years | Developer |
| Mid-tier studio | $250K-$2M | 60/40 to 70/30 | 5-7 years | Developer |
| Established studio | $1M-$10M+ | 65/35 to 80/20 | 5-7 years | Negotiable |

### Red Flags for Developers

- **Perpetual license with no reversion.** You should always be able to get your game back.
- **IP assignment instead of licensing.** Don't sell your IP unless the price is right.
- **Gross revenue split.** Always negotiate on Net Revenue (after platform fees).
- **Unlimited deductions.** Cap what the publisher can deduct before the split.
- **No audit rights.** You must be able to verify the publisher's numbers.
- **No performance thresholds.** If the publisher does nothing, you should be able to walk away.
- **Broad exclusivity with no exit.** Exclusive rights should come with performance obligations.
- **Assignment without consent.** If the publisher is acquired, you should have input.

### Key Negotiation Points

1. **Revenue definition** — Net vs Gross, what deductions are allowed
2. **IP ownership** — License vs assignment
3. **Exclusivity scope** — Territory, platform, duration
4. **Performance requirements** — What happens if the publisher underperforms
5. **Term and reversion** — When and how you get your rights back
6. **Advance terms** — Recoupable vs non-recoupable, payment schedule
7. **Marketing commitment** — Minimum spend, approval rights
8. **Audit rights** — How often, who pays, consequences of underpayment
9. **Termination triggers** — What lets you walk away
10. **Data ownership** — Who owns player data after termination
