# Referrals

Referral links let players invite friends into your game. You can attach an entryPayload to carry attribution or customization into the invited player's first session, and then track which invites converted (joined your game).

Conversions are grouped by reference, a stable campaign key you define (for example unlock_party_mode_v1 or tiktok_campaign_feb).

## Share a referral link (shareReferralLink)

Call shareReferralLink to open the platform share dialog for a referral link to your game.

> Note: shareReferralLink only opens the share dialog. It does not guarantee the player completes the share.

### JestSDK.referrals.shareReferralLink

Opens the platform share dialog with your provided title/text and a link to your game.

```ts
JestSDK.referrals.shareReferralLink({
  reference: string;                    // Stable campaign key (e.g. "unlock_party_mode_v1")
  entryPayload?: Record<string, unknown>; // Metadata passed to invited player
  shareTitle?: string;                  // Title for share dialog
  shareText?: string;                   // Text for share dialog
  onboardingSlug?: string;              // Optional onboarding game slug for invited players
}): Promise<{
  canceled: boolean;                    // True if player dismissed share dialog
}>;
```

The entryPayload is embedded into the shared link. When an invited player enters your game through that link, you can read the payload via JestSDK.getEntryPayload().

### Error handling

shareReferralLink can throw an INVALID_ARGUMENTS error if the provided options do not match the required schema.

## List referral conversions (listReferrals)

Call listReferrals to retrieve referral conversions for the current player, grouped by reference. Conversions include only invited players who complete registration.

### JestSDK.referrals.listReferrals

```ts
JestSDK.referrals.listReferrals(): Promise<{
  referrals: {
    [reference: string]: { playerId: string; joinedAt: string }[];
  };
  referralsSigned: string;
}>;
```

## Server-side verification (recommended)

If you grant rewards for referrals, verify referralsSigned on your backend instead of trusting client-reported conversions. This is the same pattern used for JestSDK.getPlayerSigned() and signed purchase payloads in the Payments module.

referralsSigned is an HS256 JWS signed with your game's shared secret. The payload has this shape:

```ts
type ReferralsSignedPayload = {
  referrals: Record<string, Array<{ playerId: string; joinedAt: string }>>;
  aud: string; // game id
  sub: string; // referrer player id
};
```

## Example: Unlock a feature after 3 invites

Two implementation approaches:
- **Client-only (not server verified):** simplest, good for low-stakes UX (cosmetics, UI hints). Can be spoofed.
- **Server verified (recommended):** for anything affecting entitlements, currency, or competitive balance. Server verifies referralsSigned before unlocking.

Server-side verification examples available in Node.js using jose library.
