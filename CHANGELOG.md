># Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [develop]
### Added

## [0.4.2] - 2022-01-03
### Added
- Minor reorganization:
  - backend/, frontend/, config/ and index.php moved to src/
  - Configuration with JSON file
  - Auto-generated JSON file for name/version
  - index.php redirects to frontend/index.php
- No feature changes

## [0.4.1] - 2022-01-02
### Added
- Minor changes in interface:
  - More consistent colors (bootstrap5 dark theme)
  - refresh-button and loading-spinner at the same position
- Minor fix: uncaught exception when PDF is disabled - fixed

## [0.4.0] - 2022-01-02
### Added
- Refactoring:
  - Backend in PHP: cloud API, cache and PDF conversion
  - Frontend in JavaScript: AJAX Web application
- New features:
  - Choice between ZIP and PDF

## [0.3.0] - 2021-12-27
### Added
- Better error handling
- Cache for downloaded/converted files

## [0.2.0] - 2021-12-25
### Added
- Rewrite without inline HTML, which I find ugly.
- Better HTML (compliance to standard)
- Minor fix in layout
- Clear token when connecting to the cloud failed

## [0.1.0] - 2021-12-25
### Added
- First version

[develop]: https://github.com/polletfa/rmWebUI/compare/0.4.2...develop
[0.4.2]: https://github.com/polletfa/rmWebUI/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/polletfa/rmWebUI/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/polletfa/rmWebUI/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/polletfa/rmWebUI/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/polletfa/rmWebUI/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/polletfa/rmWebUI/releases/tag/0.1.0
