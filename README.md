# n8n-nodes-social-poster

n8n community node for [Social Poster](https://app.social-poster.io). It lists the social accounts of a team, creates drafts and schedules posts from n8n workflows and from the n8n AI Agent.

You need a Social Poster account. Register at [https://app.social-poster.io](https://app.social-poster.io). Without an account and an API key, the node cannot do anything.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform. This package is licensed under the MIT License.

- [Installation](#installation)
- [Credentials](#credentials)
- [Operations](#operations)
- [Rules and limits](#rules-and-limits)
- [Templates](#templates)
- [Compatibility](#compatibility)
- [Resources](#resources)

## Installation

This node is for **self-hosted n8n** (server, Docker or npm). It is not listed for n8n Cloud yet.

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. In n8n, open **Settings → Community Nodes**, choose **Install** and enter `n8n-nodes-social-poster`.

## Credentials

Create a **Social Poster API** credential in n8n.

1. In Social Poster, open the account menu and go to **AI access** (KI-Zugriffe).
2. Open the card **API key for n8n** (API-Schlüssel für n8n), choose **Create key** and copy the key. It starts with `spk_` and is shown only once.
3. Paste the key into the n8n credential. Set **Base URL** to the address of your Social Poster app **without** `/mcp` at the end, for example `https://app.social-poster.io`.

One key belongs to one team. Creating a new key replaces the old one. You can revoke the key in the same card. The key works only when Social Poster has enabled API keys for that team, the plan includes AI access, and the account switches in AI access allow the account.

## Operations

| Resource | Operation | What it does |
| --- | --- | --- |
| Account | Get Many | Lists the connected accounts you can post to |
| Draft | Create | Creates a draft without scheduling it |
| Draft | Get | Returns a draft and its status |
| Draft | Update | Changes text, link, media or other fields of a draft |
| Draft | Validate | Checks a draft against the rules of its network |
| Draft | Discard | Discards a draft |
| Draft | Schedule | Stores a time on a draft without confirming it for publishing |
| Draft | Cancel Schedule | Removes the time from a draft |
| Post | Create and Schedule | Creates a draft, schedules it and confirms it for publishing in one step |
| Post | Schedule Draft | Schedules an existing draft and confirms it for publishing |
| Workspace | Get Many | Lists the workspace (team) of the key |
| Workspace | Get AI Context | Returns brand profile and network rules, useful for writing posts with AI |
| Help | Search | Searches the Social Poster help center |

Media are passed as public http(s) URLs (up to 20 per post). Uploading files is not supported yet.

## Rules and limits

- **No immediate publishing.** With an API key, a post must be scheduled at least 5 minutes in the future. If you want a post to go out quickly, use **Schedule → In Minutes** with 5 minutes.
- **Same rules as the Social Poster assistant.** Account switches, approval by a person, responsibility notices for some networks and plan limits apply. If a team requires approval, a scheduled post waits in Social Poster under "Waiting for you" until someone approves it.
- **X (Twitter)** requires that a person reviewed the exact text and media. Turn on **X Content Reviewed** only if that is true.
- **Rate limits:** 30 requests per minute per key, 10 per minute for draft changes and 3 per minute for publishing steps.
- Errors from Social Poster come with a short English explanation and the original code.

The node can be attached to the n8n AI Agent as a tool. The rules above apply in the same way.


## Templates

Ready-to-import workflows live in this repository (not in the npm package):

- German (node names and notes in German): [`templates/de`](templates/de)
- English (for the n8n template gallery): [`templates/en`](templates/en)

Import in self-hosted n8n: download a JSON file, then use **Workflow → Import from File**, or copy the JSON and paste it onto the canvas (`Ctrl+V` / `Cmd+V`). Install `n8n-nodes-social-poster` first, add a **Social Poster API** credential, fill in the placeholders (especially the account reference), and test before you activate the workflow. Details: [`templates/README.md`](templates/README.md).

| Template | Raw (DE) | Raw (EN) |
| --- | --- | --- |
| RSS: schedule a post when a new blog article appears | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/rss-blog-to-scheduled-post.json) | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/rss-blog-to-scheduled-post.json) |
| Google Sheets: schedule posts from ready rows | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/google-sheets-row-to-post.json) | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/google-sheets-row-to-post.json) |
| AI: draft a post from a topic for review | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/ai-topic-to-draft-for-review.json) | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/ai-topic-to-draft-for-review.json) |
| Schedule: recurring post by weekday | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/daily-recurring-post.json) | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/daily-recurring-post.json) |
| Webhook: post from a shop or form request | [de](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/de/webhook-form-to-post.json) | [en](https://raw.githubusercontent.com/airbob2/n8n-nodes-social-poster/main/templates/en/webhook-form-to-post.json) |

## Compatibility

Built with the n8n node CLI and tested with n8n 2.x (self-hosted). Requires a Social Poster server with team API keys enabled.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Social Poster](https://app.social-poster.io)
- [Source and issues](https://github.com/airbob2/n8n-nodes-social-poster)
