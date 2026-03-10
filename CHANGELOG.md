# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-athar] - 2026-03-10

### Added

- **Share Verse Feature**: Added ability to share verses as text and image ([#37](https://github.com/mushaf-imad/mushaf-imad-expo/pull/37))
- **Floating Page Jump Input**: Draggable floating input for quick page navigation ([#36](https://github.com/mushaf-imad/mushaf-imad-expo/pull/36))
- **Quranic Brackets**: Make Quranic brackets inline with verse text ([#58](https://github.com/mushaf-imad/mushaf-imad-expo/pull/58))
- **Loading States**: Added loading text to ActivityIndicator states
- **Clean Build Scripts**: Added `clean:all` and `fresh` scripts for project reset

### Changed

- **Improved Share UI**: Enhanced share verse UI design
- **State Management**: Migrated from local state to centralized Zustand store
- **Rendering Optimization**: Memoized QuranPage rendering with specialized layer components

### Fixed

- **Font Error**: Removed font error throw to prevent app crash
- **Atomic Updates**: Fixed atomic page state updates to prevent progressive rendering
- **Verse Trigger**: Fixed verse trigger misalignment

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

| Version | Date | Type |
|---------|------|------|
| 0.2.0-athar | 2026-03-10 | Minor |
| 0.1.0 | 2026-02-10 | Minor |
| 0.0.1 | 2026-01-01 | Initial |

## Upcoming (Unreleased)

### Planned Features

- Audio playback for verses
- Bookmarking system
- Search functionality
- Tafsir integration
