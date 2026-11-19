# Changelog

## Unreleased

- Templates: all five workflows now create only a draft by default. A `mode` field (German: `modus`) in the settings node plus an IF node switches to scheduling with **Post → Schedule Draft** (`minutesFromNow`, default 15). The Google Sheets template writes `draft`, `scheduled` or `error`; the webhook template only honours `"schedule": false` in scheduling mode. No node code changes.

## 0.1.2

- Add ready-to-import n8n workflow templates in `templates/de` (German) and `templates/en` (English, for the n8n template gallery).
- Document how to import the templates in the package README. The template JSON files stay in the GitHub repository and are not included in the npm package.
- Publish to npm from GitHub Actions with an `NPM_TOKEN` secret and npm provenance.

## 0.1.1

- Use the official Social Poster logo as the node icon.

## 0.1.0

- Account dropdown shows readable names from Social Poster (e.g. "Facebook · Page name").
- First version: accounts, drafts, scheduling with confirmation, workspace AI context, help search. No immediate publishing.
