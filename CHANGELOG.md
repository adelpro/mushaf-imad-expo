# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[UNRELEASED]

## [0.2.0-athar] - 2026-03-10

### Added

- Add Default Parameter Values to Prevent Undefined Behavior
- Add JSDoc Documentation
- Search Component UX Improvements & Debounce Loading States
- Standardize Component and hook Exports
- Haptic Feedback
- Add Reading Chart with Historical Tracking & Pages/Hizbs Toggle
- Add ErrorBoundary Component & Base Error Logger
- Add accessibility labels and hints to interactive elements for screen reader support
- Add reminder system for verses and chapters
- Add Rate on Store button to Settings
- Add multi-bookmark system
- Add custom reading themes (Sepia, High Contrast)
- Add empty state illustration for no results in search
- Enable arrow‑key navigation in MushafPage

### Fixed

- Tutorial & Safe Area Fixes
- Standardize Error Messages
- Ammarahmed1263 — Type Consolidation & UI Refinement
- iOS Edge-to-Edge Support, Safe Area Optimization, and RTL Alignment
- Standardize camelCase naming in tracker.tsx and MushafPage.tsx
- Update pan gesture constants, add sensitivity settings, and fix navigation glitch
- Fix changelog modal RTL alignment and semantic list structure
- Address PR review feedback for reminders feature
- Platform-specific changelogs, RTL and safe area for What's New modal
- Remove duplicated thumn entry in mushaf-elmadina-warsh-azrak
- Use iOS safe area inset instead of hardcoded top margin
- Replace raw route names in back button labels
- iOS physical device QA audit
- Add accessibility labels to icon-only buttons

### Changed

- IOS Edge-to-Edge Support, Safe Area Optimization, and RTL Alignment
- IOS physical device QA audit
- Add local development environment setup
- Remove hardcoded timeout from splash screen

## [0.1.0] - 2026-02-10

### Added

- **Interactive Popups**: Built-in verse and chapter information popups
- **Press Support**: Short press and long press callbacks for verses and chapters
- **SQLite Database**: Replaced Realm with SQLite for improved stability and performance

### Changed

- **Database Migration**: Complete migration from Realm to SQLite ([Migration Guide](docs/migration-realm-to-sqlite.md))
- **Image Map Generation**: Automatic image map generation for Expo asset handling

### Fixed

- **Error Handling**: Added error handling and fallback UI in QuranPage
- **Component Structure**: Improved verse positioning and component structure

## [0.0.1] - Initial Release

### Added

- Quran page rendering with 604 pages
- Interactive verse support
- Chapter navigation with sura name bars
- Verse markers (fasel) with press support
- Verse highlighting
- SQLite database with Quran data

---

## Version History

| Version     | Date       | Type    |
| ----------- | ---------- | ------- |
| 0.2.0-athar | 2026-03-10 | Minor   |
| 0.1.0       | 2026-02-10 | Minor   |
| 0.0.1       | 2026-01-01 | Initial |

## Upcoming (Unreleased)

### Planned Features

- Audio playback for verses
- Bookmarking system
- Search functionality
- Tafsir integration
