# Reddit Content Assistant

Personal Reddit cross-posting helper for the [melyx.dev](https://melyx.dev) blog. **Manual-trigger only.**

## Purpose

This tool helps convert blog content I author on melyx.dev into Reddit-friendly self-posts and submit them to a single subreddit per click.

## How it works

1. I write an original article on `melyx.dev/blog/`
2. The admin UI generates a Reddit-friendly draft using AI
3. I read the draft, edit it, choose the subreddit
4. I click **Distribute** — exactly one self-post is submitted

That's the entire workflow. There is no scheduler, no queue, no auto-retry, no batch.

## Safety policy

- ✅ Human-triggered posting only — every post requires a manual button click
- ✅ Used only in allowed subreddits (listed below)
- ❌ No automation or mass posting
- ❌ No scraping or vote manipulation
- ❌ No commenting, no DMs, no chat
- ❌ No loop, no cron, no webhook auto-fire

## Volume

- ~1–3 posts per week total
- Each post is a long-form, on-topic submission
- Each post is reviewed by me before submission

## Allowed subreddits

Only when an article is genuinely on-topic for that subreddit, and never more
than once per subreddit per week:

- r/SaaS, r/IndieHackers, r/Entrepreneur, r/SideProject
- r/programming, r/webdev
- r/Dublin, r/Ireland, r/IrishExpats

## Tech stack

| Layer        | Choice                                                                              |
|--------------|-------------------------------------------------------------------------------------|
| Trigger      | Manual click on `melyx.dev/blog/admin/`                                             |
| Backend      | Node.js + Fastify (`news.melyx.id`)                                                 |
| AI summary   | Groq Llama 3.3 70B via my own gateway (`api.aigatecloud.com/v1/chat/completions`)   |
| Reddit auth  | OAuth 2.0 **password grant** on a script-type app                                   |
| HTTP client  | Native `fetch` (Node 20)                                                            |
| Rate limit   | Manual — under 10 requests/day, well below Reddit's 60/min limit                    |

## Files

- `reddit-poster.js` — only Reddit-touching code: `getRedditToken()` + `postToReddit()`
- `usage-example.md` — drop-in usage with required env vars

## Compliance summary

- **Identity**: I'm the author of every blog post that gets cross-posted
- **Consent**: A button click precedes every API call
- **Account hygiene**: The script account is dedicated to this purpose, 2FA disabled (required for password grant), no moderation / voting / commenting
- **User-Agent**: All requests send `melyxdev-blog-sync/1.0 by <username>` per Reddit API guidelines

## Contact

linhmentor@gmail.com — Reddit username available on the API access ticket.
