# Introduction

Jest is a marketplace for messaging apps. Messaging apps are web apps that use texting protocols (SMS and RCS) to engage and retain users. SMS and RCS are supported by the default messaging apps on every smartphone. These apps come pre-installed - no downloads, no app stores, instant reach. The messaging inbox is mobile's most retentive surface. It's where users return every day to read, respond, and engage. Messaging apps built on Jest tap directly into this behavior, delivering interactive, app-like experiences inside the most trusted and highest-attention channel on the phone.

## Who is Jest for?

Jest serves two primary audiences:
- **Players** - discover, launch, and return to messaging games
- **Developers** - build, publish, and operate messaging games using the Jest SDK

## How the platform works

Jest consists of three main components:

### Main Platform

The main platform lives at https://jest.com. It functions as a web-based super-app - an application that contains other applications. Players can:
- Sign up using their phone number
- Discover games
- Launch games instantly in their browser

Games run inside a sandboxed environment and communicate with the platform through the Jest SDK.

### Jest SDK

The Jest SDK enables games to access core platform capabilities, including:
- Player authentication, identity, and state management
- Messaging notifications (SMS, RCS, and on-platform)
- Secure in-game purchases using Jest Tokens

Games built with Phaser, PixiJS, Cocos, Three.js, Babylon.js, Construct 3, Godot, Unity (WebGL), and other game engines can integrate the SDK.

### Developer Console

The Developer Console lives at https://jest.com/developers. This is where developers:
- Create and configure games
- Upload new builds
- Configure products and pricing
- Manage media assets and notifications
- Submit games for review
- Monitor analytics and moderation events

## Typical player journey

A player visits Jest.com and browses available games. A game launches instantly in guest mode. The game prompts registration via SMS/RCS to save progress and subscribe to notifications. The game can re-engage the player later through notifications.

Unlike traditional app stores, Jest uses messaging as its primary engagement channel and web-based checkout instead of native in-app purchase systems.

In the following sections, you'll learn how to integrate the Jest SDK, configure your game in the Developer Console, and publish your game to the platform.
