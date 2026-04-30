# Usage example

## 1. Set environment variables

```bash
export REDDIT_CLIENT_ID=xxxxxxxxxxxxxx
export REDDIT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export REDDIT_USERNAME=melyxdev_bot
export REDDIT_PASSWORD=•••••
```

## 2. Submit a self-post (one call = one post)

```js
const { postToReddit } = require('./reddit-poster.js');

const result = await postToReddit({
  subreddit: 'SaaS',
  title: 'Lessons from shipping a 4-mode AI gateway in 2 weeks',
  text:
    "I'm a solo dev who spent 14 evenings building an AI content + API platform.\n\n" +
    "Here's what I learned about routing, fallback, and pricing.\n\n" +
    "..."
  ,
});

console.log(result);
// { ok: true, url: 'https://www.reddit.com/r/SaaS/comments/abc123/...', id: 't3_abc123' }
```

## 3. Error shapes

```js
// Missing creds
{ ok: false, error: 'reddit_creds_missing — set REDDIT_CLIENT_ID/SECRET/USERNAME/PASSWORD' }

// Bad credentials
{ ok: false, error: 'reddit_auth_failed: {"error":"invalid_grant"}' }

// Rate-limited or sub rules violation
{ ok: false, error: 'RATELIMIT:you are doing that too much. try again in 7 minutes.' }

// Subreddit doesn't exist or is private
{ ok: false, error: 'SUBREDDIT_NOEXIST:that subreddit doesn\'t exist' }
```

## What this tool does NOT do

See `README.md` — explicit list of every Reddit action this code does not
perform. The Reddit API access request ticket explains why.
