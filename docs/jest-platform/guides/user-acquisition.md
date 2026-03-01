# User Acquisition

## Overview

User acquisition on Jest is about getting players to register and play your game on the platform. Registered users are subscribed to their personal Jest messaging thread, which unlocks access to the messaging inbox - the stickiest retention surface available. This is what makes registration critical: without it, Jest's messaging-based re-engagement features are not available.

## Game entry points

### Explore

The Explore surface is designed for players already browsing or discovering games on Jest. These players are evaluating multiple games. Optimizing your game's presentation and first-time experience is important for converting these players into registered users.

From the Developer Console, you can configure how your game appears in Explore: game icon, hero image, and short description.

### Direct game entry

Players can enter your game directly on its game page, commonly from paid user acquisition, social sharing, or viral features. Clear onboarding and meaningful registration prompts play a key role.

## Registration and login paths

Before prompting a player to register or log in, check whether the player is already registered via JestSDK.getPlayer().

### User-initiated registration

Users can register through the Jest platform footer or in-game footer. Works well for players who already understand the value.

### Game-initiated registration prompts

Games can invoke the platform's registration flow at meaningful moments:
- After completing a level or session
- When unlocking a new feature
- Before accessing content that benefits from notifications or persistence

See JestSDK.login() for technical details.

### Dedicated onboardings

The most effective way to convert players. Short, interactive flows (similar to playable ads) that players engage with before entering the full game. They introduce the game, create emotional investment, and turn registration into a natural continuation of play.

Can be used for paid user acquisition campaigns and viral/social features. If accepted into the Jest Games Fund, the Jest team will help design onboarding flows.

## Marketing and attribution analytics

### Paid user acquisition attribution

Standard UTM parameters are preserved when users enter through Jest links:
- utm_source, utm_medium, utm_campaign, utm_term, utm_content

All entry points flow through web URLs, providing high attribution accuracy without custom SDK integrations.

### Viral and social attribution

Use entryPayload to pass structured attribution data into the game. Preserved when a player enters the game and accessible via JestSDK.getEntryPayload(). Allows you to:
- Identify the source of an invite or share
- Attribute conversions to specific features or referrers
- Trigger contextual in-game logic based on how the player arrived

Jest also provides referral APIs for invite flows (share dialog + conversion tracking). See the referrals SDK module.

## From CPI to CPS: comparing acquisition funnels

Messaging-based experiences follow a comparable funnel to mobile app CPI, but shift when value is delivered: users can engage immediately, while subscription/registration happens later.

**Messaging app funnel:** Discover → Instant play → Tap to register → Send text → Receive reply → Enter game via link → Subscribed (CPS = cost per subscriber)

**Mobile app funnel:** Discover → App Store page → Tap to install → Confirm install → Wait for download → Open app → Installed (CPI = cost per install)
