# Social Poster n8n templates

Ready-to-import n8n workflows for the community node [`n8n-nodes-social-poster`](https://www.npmjs.com/package/n8n-nodes-social-poster) (tested with **0.1.1**; 0.1.2 is the same node API plus these templates).

Fertige n8n-Workflows für den Community-Node [`n8n-nodes-social-poster`](https://www.npmjs.com/package/n8n-nodes-social-poster) (getestet mit **0.1.1**; 0.1.2 ist dieselbe Node-API plus diese Vorlagen).

- **German / Deutsch:** [`de/`](de/) — node names and sticky notes in German (Du)
- **English:** [`en/`](en/) — prepared for the [n8n template gallery](https://docs.n8n.io/contribute/create-templates) (package name, tested version, installation link and setup steps in the notes)

The node is on npm, but it is **not yet verified by n8n**. The workflows run on **self-hosted n8n** after you install the package. They do **not** run on n8n Cloud until the node is verified.

Der Node ist auf npm, aber **noch nicht von n8n verifiziert**. Die Workflows laufen auf **selbst gehostetem n8n**. Auf n8n Cloud laufen sie erst nach der Verifizierung.

- Node type: `n8n-nodes-social-poster.socialPoster` (version 1)
- Credentials: `socialPosterApi` (placeholder name **Social Poster API**, no key in the files)
- Installation: [n8n community node installation](https://docs.n8n.io/integrations/community-nodes/installation/)
- Official gallery: [Create workflow templates](https://docs.n8n.io/contribute/create-templates) via the [Creator portal](https://creators.n8n.io/login)
- These files are **not** included in the npm package (`package.json` `files` only ships `dist/`). Use the GitHub raw links below.

Nothing in these files is activated, and they contain no API keys. **All templates create only a draft by default.** To schedule automatically, set `mode` to `schedule` (German templates: `modus` to `planen`) in the settings node; an IF node then runs **Post → Schedule Draft** `minutesFromNow` minutes later. Posts created with an API key must be scheduled at least 5 minutes in the future.

In den Dateien ist nichts aktiviert, und sie enthalten keine API-Schlüssel. **Alle Vorlagen legen standardmäßig nur einen Entwurf an.** Zum automatischen Planen setzt Du im Einstellungs-Node `modus` auf `planen`; ein IF-Node führt dann **Post → Schedule Draft** `minutesFromNow` Minuten später aus. Beiträge mit einem API-Schlüssel müssen mindestens 5 Minuten in die Zukunft geplant werden.

## Templates

| File | German / Deutsch | English |
| --- | --- | --- |
| `rss-blog-to-scheduled-post.json` | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/rss-blog-to-scheduled-post.json) — Beobachtet einen RSS-Feed und legt für jeden neuen Blogartikel einen Entwurf an, auf Wunsch gleich geplant. | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/rss-blog-to-scheduled-post.json) — Watches an RSS feed and creates a Social Poster draft for each new blog article, optionally scheduled. |
| `google-sheets-row-to-post.json` | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/google-sheets-row-to-post.json) — Liest Tabellenzeilen mit Status `ready`, legt Entwürfe an (auf Wunsch geplant) und schreibt `draft`, `scheduled` oder `error` zurück. | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/google-sheets-row-to-post.json) — Reads Google Sheet rows with status `ready`, creates drafts (optionally scheduled), then writes `draft`, `scheduled` or `error` back. |
| `ai-topic-to-draft-for-review.json` | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/ai-topic-to-draft-for-review.json) — Nimmt ein Thema aus einem Formular, schreibt mit Markenkontext und OpenAI einen Text und legt einen Entwurf an; gültige Entwürfe auf Wunsch gleich geplant. | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/ai-topic-to-draft-for-review.json) — Takes a topic from a form, uses brand context plus OpenAI, and creates a draft; valid drafts are optionally scheduled. |
| `daily-recurring-post.json` | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/daily-recurring-post.json) — Läuft täglich (Europe/Berlin) und legt den Text für den heutigen Wochentag als Entwurf an, auf Wunsch geplant. | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/daily-recurring-post.json) — Runs daily (Europe/Berlin) and creates a draft from the caption prepared for that weekday, optionally scheduled. |
| `webhook-form-to-post.json` | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/webhook-form-to-post.json) — Nimmt einen POST von Shop oder Formular entgegen und legt einen Entwurf an, auf Wunsch gleich geplant. | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/webhook-form-to-post.json) — Accepts a POST from a shop or form, creates a draft (optionally scheduled) and returns the draft id. |

## How to import / So importierst Du eine Vorlage

1. Install the node in self-hosted n8n: **Settings → Community Nodes → Install** → `n8n-nodes-social-poster`. Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).
2. Open a new workflow in n8n.
3. Import the JSON with **Workflow menu → Import from File**, or copy the file contents and paste them onto the canvas (`Ctrl+V` / `Cmd+V`). See [Export and import](https://docs.n8n.io/build/manage-workflows/export-and-import).
4. Create the **Social Poster API** credential (and Google Sheets or OpenAI where the template needs them). In Social Poster: account menu → AI access → API key for n8n. Base URL: `https://app.social-poster.io` (no `/mcp`).
5. Fill in the placeholders in the **Settings** / **Einstellungen** node, especially the account reference (`acc_…`).
6. Leave **X Content Reviewed** off unless a person has reviewed the exact text and media. Required for X (Twitter).
7. Test once. The output of the create node contains `draft.draft_ref` and `draft.app_draft_url` (read-only view after login). Activate the workflow only when the result looks right.
8. Optional: switch `mode` / `modus` to `schedule` / `planen` and set `minutesFromNow`. Scheduled posts appear in the Social Poster calendar.

## Google Sheet columns

For `google-sheets-row-to-post.json`, row 1 must contain these headers:

`Caption` · `Link` · `MediaURLs` · `Title` · `Status` · `DraftRef` · `ScheduledAt`

Set `Status` to `ready` for rows that should be processed. The workflow writes `draft`, `scheduled` or `error`.

## Webhook JSON example

```json
{
  "caption": "Heute im Hofladen: frische Äpfel.",
  "link": "https://example.com",
  "media_urls": "https://example.com/image.jpg",
  "title": "",
  "schedule": false
}
```

The workflow only schedules when the settings node has `mode` = `schedule` (`modus` = `planen`). In that mode, send `"schedule": false` to keep a single request as a draft. With the default mode, every request is a draft. The text may also be sent as `text` or `message`.
