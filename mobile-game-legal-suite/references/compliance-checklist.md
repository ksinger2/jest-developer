# Regional Compliance Checklist

Quick-reference checklist for legal requirements by region. Use this when ensuring documents meet jurisdiction-specific requirements.

---

## United States — Federal

### COPPA (Children Under 13)

**Applies if:** Game is directed at children under 13, OR you have actual knowledge a user is under 13.

- [ ] Privacy policy posted before data collection
- [ ] Age screening implemented (neutral, no default age)
- [ ] Verifiable parental consent obtained before collecting PI from children
- [ ] Accepted consent methods: email+confirmation, credit card verification, knowledge-based authentication, photo ID, text-plus (new 2025)
- [ ] Separate parental consent for sharing children's data with third parties
- [ ] Parents can review and delete child's data
- [ ] Data retention limited to stated purpose
- [ ] Written information security program for children's data
- [ ] No behavioral advertising to children
- [ ] No conditioning participation on unnecessary data collection
- [ ] Annual compliance certification (if using Safe Harbor)

**Key dates:** Amendments effective June 23, 2025. Full compliance required by April 22, 2026.

### FTC Enforcement Priorities (2025-2026)

- [ ] Loot box/gacha odds clearly disclosed at point of purchase
- [ ] Multi-tiered virtual currency exchange rates disclosed
- [ ] No deceptive marketing of in-app purchases to minors
- [ ] Dark patterns avoided (no manipulative design to encourage purchases)
- [ ] "Click to cancel" compliance for subscriptions (cancellation as easy as signup)

---

## United States — State Laws

### California (CCPA/CPRA)

**Applies if:** For-profit business with $26.625M+ revenue, OR 100K+ CA consumers' data, OR 50%+ revenue from selling/sharing CA data.

- [ ] Comprehensive privacy policy with required CCPA disclosures
- [ ] Categories of PI collected listed (past 12 months)
- [ ] Purpose of collection stated for each category
- [ ] "Do Not Sell or Share My Personal Information" link provided
- [ ] Honor Global Privacy Control (GPC) browser signals
- [ ] Consumer rights mechanisms: access, delete, correct, opt-out
- [ ] Non-discrimination clause (can't penalize users who exercise rights)
- [ ] Data retention periods specified
- [ ] Respond to requests within 45 days
- [ ] Service provider agreements with all data processors

**California AADC (Age-Appropriate Design Code):**
- [ ] Data Protection Impact Assessment for features accessible to minors
- [ ] High privacy settings as default for minors
- [ ] No dark patterns encouraging minors to weaken privacy
- [ ] No profiling minors unless necessary for core service

### Virginia (VCDPA)

- [ ] Privacy notice with required disclosures
- [ ] Consumer rights: access, delete, correct, opt-out of targeted ads/sale/profiling
- [ ] Consent for sensitive data processing
- [ ] Enhanced protections for known children (amended 2025)
- [ ] Respond to requests within 45 days

### Colorado (CPA)

- [ ] Privacy notice requirements
- [ ] Consent for sensitive data
- [ ] Opt-out for targeted advertising and sale
- [ ] "Heightened risk of harm" assessment for minors' data (Oct 2025 amendment)

### Connecticut (CTDPA)

- [ ] Similar to Virginia requirements
- [ ] Proposed 2026 amendments: lower thresholds, new data broker registry

### Other States with Privacy Laws

Texas, Oregon, Montana, Delaware, Indiana, Iowa, Tennessee, Utah — each with varying requirements. Check applicability thresholds and effective dates.

---

## European Union

### GDPR

- [ ] Lawful basis identified for each processing activity
- [ ] Privacy notice meeting Articles 13-14 requirements
- [ ] Data subject rights implemented (access, erasure, portability, objection, rectification, restrict)
- [ ] Consent obtained where required (freely given, specific, informed, unambiguous)
- [ ] Data Processing Agreements with all processors
- [ ] Records of Processing Activities maintained
- [ ] Data Protection Impact Assessment for high-risk processing
- [ ] Data Protection Officer appointed (if required)
- [ ] Cross-border transfer mechanisms (SCCs) for data leaving EU
- [ ] 72-hour breach notification to supervisory authority
- [ ] Privacy by design and by default implemented
- [ ] Cookie/tracking consent (ePrivacy Directive)

### Digital Services Act (DSA)

**Applies if:** Game has chat, social, or UGC features (qualifies as "intermediary service").

- [ ] Terms of service cannot override DSA rights
- [ ] Content moderation transparency
- [ ] Appeal mechanisms for content decisions
- [ ] User rights clearly explained
- [ ] No personalized advertising to minors

### Loot Box Regulations

| Country | Status | Action Required |
|---------|--------|-----------------|
| Netherlands | Loot boxes with tradeable items = gambling | Remove or ensure items non-tradeable |
| Belgium | All loot boxes = illegal gambling | Do not offer loot boxes |
| Italy | Mandatory transparency | Disclose probabilities, PEGI descriptors |
| France | Disclosure recommended | Disclose probabilities |
| Germany | Under review | Disclose probabilities (precautionary) |

### Children's Privacy (EU)

- [ ] Age of digital consent varies: 16 (most countries), 13 (some)
- [ ] Private-by-default settings for minors
- [ ] No personalized ads to minors
- [ ] UK Age-Appropriate Design Code: 15 standards
- [ ] Risk assessment for features accessible to children

---

## United Kingdom

### UK GDPR (post-Brexit)

- [ ] Same as EU GDPR with UK-specific supervisory authority (ICO)
- [ ] UK International Data Transfer Agreement for cross-border transfers
- [ ] UK Age-Appropriate Design Code compliance

---

## Asia-Pacific

### China

- [ ] PIPL compliance (similar to GDPR)
- [ ] Data localization: at least one copy stored in China
- [ ] Cross-border transfer: government approval required
- [ ] Loot box probability disclosure mandatory
- [ ] Game approval from National Press and Publication Administration (NPPA)
- [ ] Playing time restrictions for minors
- [ ] Real-name registration required

### Japan

- [ ] APPI (Act on Protection of Personal Information) compliance
- [ ] Kompu-gacha (required collection) mechanics banned
- [ ] Gacha probability disclosure (self-regulatory)
- [ ] CERO age rating

### South Korea

- [ ] PIPA compliance (strict data protection)
- [ ] Probability disclosure legally mandatory for random items
- [ ] Game Rating and Administration Committee approval
- [ ] Stronger protections for minors

### Australia

- [ ] Privacy Act compliance
- [ ] Australian Consumer Law (no misleading/deceptive conduct)
- [ ] Chance-based purchases rated minimum 15+
- [ ] ACCC guidelines for in-app purchases

---

## Latin America

### Brazil

- [ ] LGPD compliance (similar to GDPR)
- [ ] Children under 18: parental/guardian consent
- [ ] Loot boxes banned for minors starting 2026
- [ ] Data localization: at least one copy in Brazil

---

## Canada

- [ ] PIPEDA compliance (federal)
- [ ] Provincial equivalents (Alberta, BC, Quebec)
- [ ] Meaningful consent before collection
- [ ] CASL compliance for marketing communications

---

## Platform Requirements

### Apple App Store

- [ ] Custom EULA includes all 10 Apple requirements (see EULA guide)
- [ ] Privacy Nutrition Labels accurately completed
- [ ] App Tracking Transparency (ATT) prompt implemented
- [ ] Privacy Manifest filed (for third-party SDKs)
- [ ] No external payment links (unless permitted under regional exceptions)
- [ ] ESRB or equivalent age rating obtained

### Google Play

- [ ] Data Safety section accurately completed
- [ ] Privacy policy URL in Play Console (publicly accessible, not PDF)
- [ ] All permissions justified
- [ ] Security practices attestation
- [ ] Content rating questionnaire completed
- [ ] Families Policy compliance (if targeting children)

---

## Quick Decision Tree

### Does your game have loot boxes?

```
YES → Disclose probabilities everywhere
    → Check Belgium (ban), Netherlands (tradeable items banned)
    → Check China, Korea (mandatory disclosure)
    → Check Brazil (ban for minors, 2026)
    → Check Australia (15+ rating)
    → FTC: clear odds at point of purchase

NO → No additional loot box compliance needed
```

### Can children under 13 play your game?

```
YES, game is child-directed →
    Full COPPA compliance required
    GDPR: parental consent (age varies by country)
    No behavioral advertising
    Data minimization mandatory
    Consider UK AADC 15 standards

YES, mixed-audience (not directed but accessible) →
    Age screening before data collection
    COPPA applies if child identified
    Separate experience recommended for children
    GDPR: age-appropriate defaults

NO, 13+ or 18+ only →
    State minimum age clearly in EULA
    Age gate at registration
    Still comply with CCPA, GDPR for general audience
```

### Does your game have social/multiplayer features?

```
YES →
    Chat monitoring disclosure required
    Content moderation policy needed
    User reporting mechanisms required
    EU DSA compliance if UGC features
    ESRB "Users Interact" label considerations
    Community guidelines needed

NO → Standard EULA and privacy policy sufficient
```

### What markets are you launching in?

```
US only → COPPA, CCPA/CPRA, FTC guidance, state laws
US + EU → Add GDPR, DSA, ePrivacy, country-specific loot box rules
Global → Add PIPL (China), PIPA (Korea), APPI (Japan), LGPD (Brazil),
         Privacy Act (Australia), PIPEDA (Canada), plus regional game
         approval requirements
```

---

## Document Checklist Summary

For a mobile game with in-app purchases and social features launching worldwide:

### Must Have (Day 1)

- [ ] EULA covering license, IAP, conduct, liability, arbitration
- [ ] Privacy Policy covering all jurisdictions, all data practices
- [ ] Platform compliance (Apple nutrition labels, Google Data Safety)
- [ ] Age screening mechanism
- [ ] COPPA-compliant parental consent flow (if children can access)
- [ ] "Do Not Sell/Share" mechanism (CCPA)
- [ ] Loot box probability disclosures (if applicable)
- [ ] Publishing/Revenue Share Agreement (if working with publisher)
- [ ] Data Processing Agreements with all third-party providers

### Should Have (Within 30 Days of Launch)

- [ ] DSAR handling process documented and tested
- [ ] Breach notification plan
- [ ] Content moderation policy and reporting mechanisms
- [ ] Community guidelines
- [ ] Cookie/tracking consent mechanism (for any web components)
- [ ] Privacy dashboard or settings page for user controls
- [ ] Data Protection Impact Assessment (if high-risk processing)

### Nice to Have (Within 90 Days)

- [ ] Layered privacy notice (summary + detailed)
- [ ] Just-in-time disclosure popups for data collection moments
- [ ] Privacy icons/visual summary
- [ ] Regular compliance audit schedule
- [ ] Staff training on privacy and data handling
