# reddit-content-assistant

Personal Reddit cross-posting helper for the [melyx.dev](https://melyx.dev) blog.

Manual-trigger only. One click = one self-post to one subreddit.

## What this tool does

When I publish an original article on my blog at `melyx.dev/blog/`, this helper lets me:

1. Generate a Reddit-friendly summary using my own AI pipeline
2. Manually review and edit the summary
3. Submit a single self-post to one chosen subreddit, after I click "Distribute"

## What this tool does **NOT** do

- ❌ Comment on other users' posts
- ❌ Vote on any content
- ❌ Send DMs / chat messages
- ❌ Scrape user data or subreddit content
- ❌ Run on a schedule / cron / webhook
- ❌ Bulk-post to multiple subreddits at once
- ❌ Cross-post anyone else's content (I am the author of every blog post)

## Volume

- ~1–3 posts per week total across all my chosen subreddits
- Each post is a long-form, on-topic submission
- Each post is approved by me by clicking a button after reading the AI-generated draft

## Subreddits I post to

Only when an article is genuinely on-topic for that subreddit, and never more
than once per subreddit per week:

- r/SaaS, r/IndieHackers, r/Entrepreneur, r/SideProject
- r/programming, r/webdev
- r/Dublin, r/Ireland, r/IrishExpats

## Tech stack

| Layer        | Choice                                        |
|--------------|-----------------------------------------------|
| Trigger      | Manual click on `melyx.dev/blog/admin/`       |
| Backend      | Node.js + Fastify (`news.melyx.id`)           |
| AI summary   | Groq Llama 3.3 70B via my own gateway (`api.aigatecloud.com/v1/chat/completions`) |
| Reddit auth  | OAuth 2.0 **password grant** on a script-type app |
| HTTP client  | Native `fetch` (Node 20)                      |
| Rate limit   | Manual — I click once per intended post       |

## How a post happens (technical flow)

```
melyx.dev/blog/admin/
  └─ Author writes article + clicks 🪄 Generate summaries
       └─ POST /blog/admin/api/summarize → AI returns reddit summary draft
  └─ Author reviews + edits in textarea
  └─ Author clicks 🚀 Distribute
       └─ POST /blog/admin/api/distribute → news.melyx.id /api/share/manual-post
            └─ Calls postToReddit() (this repo's function)
                 └─ getRedditToken() — OAuth password grant, cached 60min
                 └─ POST https://oauth.reddit.com/api/submit
                      → returns post URL
```

## Compliance notes

- **Identity**: I am the author of every article. The bot only re-posts my own
  original blog content.
- **Consent**: Each post is preceded by a manual button click after I read the
  draft. There is no automated decision-making about what gets posted.
- **Rate limits**: Reddit's 60-req/min limit is never approached because manual
  triggering caps me at well under 10 requests/day.
- **Account hygiene**: The script account exists solely for this purpose,
  has 2FA disabled (required for password grant), and is not used for moderation,
  voting, or commenting.
- **User-Agent**: All requests send `melyxdev-blog-sync/1.0 by <username>` per
  Reddit API guidelines.

## Files

- `reddit-poster.js` — the only logic in this repo: `getRedditToken()` + `postToReddit()`.
  Drop into any Node 20+ project, set the 4 env vars, call `postToReddit({ subreddit, title, text })`.

## Why a separate Reddit module?

The full distribution pipeline (X / Facebook / dev.to / Dublin24h / Reddit) lives
in a private monorepo. This file is split out so reviewers can audit the exact
Reddit-touching code without seeing unrelated tokens.

## Contact

linhmentor@gmail.com — Reddit username available on the API access ticket.

---

Source available upon request for any unscoped functions called from this file.
None of the unscoped functions reach Reddit.
