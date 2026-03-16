# Mushaf Imad RN

[![Version](https://img.shields.io/badge/version-0.2.0-athar-blue)](https://github.com/mushaf-imad/mushaf-imad-expo)
[![Expo](https://img.shields.io/badge/Expo-54.0.33-blueviolet)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB)](https://reactnative.dev)
[![iOS](https://img.shields.io/badge/platform-iOS-000000)](https://apple.com/ios)
[![Android](https://img.shields.io/badge/platform-Android-3DDC84)](https://www.android.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Athar](https://img.shields.io/static/v1?label=Athar&message=%F0%9F%8C%99&color=blue)](https://community.itqan.dev/d/250/3)

A React Native Quran reading application built with Expo, featuring page-by-page Quran rendering with interactive verse support.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
  - [Installation](#installation)
  - [Running on Platforms](#running-on-platforms)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Dependencies](#dependencies)
- [Scripts](#scripts)
- [Database](#database)
- [Image Assets](#image-assets)
- [Version](#version)
- [Acknowledgments](#acknowledgments)
- [License](#license)
- [Changelog](CHANGELOG.md)

## Overview

Mushaf Imad RN is a reusable Quran page rendering component for Expo applications. It displays Quran pages with support for interactive verses, chapter information, and customizable layouts.

## Features

- **Page Rendering**: Displays all 604 pages of the Quran with high-quality images
- **Interactive Verses**: Tap on verses to get more information or perform actions
- **Chapter Navigation**: Sura name bars with press support for chapter details
- **Verse Markers**: Visual markers for verse numbers (fasel) with press support
- **Verse Highlights**: Visual highlighting of verse content areas
- **Info Popups**: Built-in popups for verse and chapter information
- **SQLite Database**: Efficient local storage using Expo SQLite

## Screenshots

![Quran View - Main Interface](screenshots/quran-view-1.png)

![Quran View - Detailed View](screenshots/quran-view-3.png)

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/mushaf-imad-expo.git
cd mushaf-imad-expo

# Install dependencies
yarn install

# Start the development server
yarn start
```

### Running on Platforms

```bash
# Run on Android
yarn android

# Run on iOS
yarn ios

# Run on Web
yarn web
```

## Project Structure

```
mushaf-imad-expo/
├── assets/
│   ├── images/quran/      # Quran page images (604 folders)
│   ├── fonts/             # Application fonts
│   └── quran.db           # SQLite database
├── docs/
│   ├── quran-component.md # Quran component documentation
│   └── migration-realm-to-sqlite.md # Migration documentation
├── screenshots/           # Application screenshots
├── src/
│   ├── components/
│   │   └── quran/        # Quran rendering components
│   ├── services/
│   │   └── SQLiteService.ts
│   ├── hooks/
│   └── screens/
├── scripts/
│   ├── generate-map.js    # Generate image map for Expo
│   └── migrate-realm-to-sqlite.js
└── package.json
```

## Documentation

- [Quran Component Documentation](docs/quran-component.md) - Detailed component API and usage
- [Realm to SQLite Migration](docs/migration-realm-to-sqlite.md) - Database migration guide

## Dependencies

### Core Dependencies

- `expo` - Expo framework
- `react-native` - React Native
- `expo-sqlite` - SQLite database
- `expo-asset` - Asset management
- `react-native-svg` - SVG rendering

### Development Dependencies

- `typescript` - TypeScript compiler
- `better-sqlite3` - SQLite native bindings
- `react-native-svg-transformer` - SVG transformation

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `yarn start`        | Start Expo development server      |
| `yarn generate-map` | Generate image map for Quran pages |
| `yarn prebuild`     | Generate native projects           |
| `yarn android`      | Run on Android device/emulator     |
| `yarn ios`          | Run on iOS simulator               |
| `yarn web`          | Run in web browser                 |

## Database

The application uses SQLite for storing Quran data including:

- **Chapters**: 114 Quran chapters
- **Pages**: 604 Quran pages
- **Verses**: 6,236 Quran verses
- **Verse Highlights**: 27,039 highlight positions
- **Chapter Headers**: 228 chapter title markers
- **Page Headers**: 1,208 page header markers

### Database Initialization

The database is pre-populated from `assets/quran.db` and copied to the device on first launch.

## Image Assets

Quran page images are organized in `assets/images/quran/` with 604 folders, one for each page.

**Note**: Run `yarn generate-map` after modifying image assets to update the image import map.

## Version

- **Current Version**: 1.0.0
- **Package**: com.adelpro.mushafimadrn

## Acknowledgments

Special thanks to the [ITQAN Community](https://community.itqan.dev) for their support and contribution to the Quran technology ecosystem.

<p align="center">
  <a href="https://itqan.dev">
    <img src="https://itqan.dev/logo.svg" alt="ITQAN Community Logo" width="150" />
  </a>
</p>

## License

Private project - All rights reserved.
