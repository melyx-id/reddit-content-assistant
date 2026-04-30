/**
 * Reddit cross-posting helper for the melyx.dev blog.
 *
 * Workflow (single direction, manual-triggered):
 *   1. Author writes a blog post on melyx.dev/blog/
 *   2. AI generates a Reddit-friendly self-post summary
 *   3. Author manually reviews + edits the summary in the admin UI
 *   4. ONE button click submits ONE self-post to ONE chosen subreddit
 *
 * The bot does NOT comment, vote, DM, scrape, or run on a schedule.
 * Volume: 1-3 posts per week total across all subreddits.
 *
 * Auth: Reddit OAuth 2.0 password grant on a "script" app
 * (https://www.reddit.com/prefs/apps).
 *
 * Required env vars:
 *   REDDIT_CLIENT_ID
 *   REDDIT_CLIENT_SECRET
 *   REDDIT_USERNAME
 *   REDDIT_PASSWORD
 */

let _redditToken = null;
let _redditTokenExpiry = 0;

/**
 * Returns a valid bearer token, fetching a new one if expired.
 * Tokens are cached in memory and refresh ~60s before they expire.
 */
async function getRedditToken() {
  if (_redditToken && Date.now() < _redditTokenExpiry) return _redditToken;

  const id     = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  const user   = process.env.REDDIT_USERNAME;
  const pass   = process.env.REDDIT_PASSWORD;
  if (!id || !secret || !user || !pass) {
    throw new Error('reddit_creds_missing — set REDDIT_CLIENT_ID/SECRET/USERNAME/PASSWORD');
  }

  const auth = Buffer.from(`${id}:${secret}`).toString('base64');
  const r = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type':  'application/x-www-form-urlencoded',
      'User-Agent':    `melyxdev-blog-sync/1.0 by ${user}`,
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username:   user,
      password:   pass,
    }),
  });
  const j = await r.json();
  if (!j.access_token) {
    throw new Error('reddit_auth_failed: ' + JSON.stringify(j).slice(0, 200));
  }
  _redditToken       = j.access_token;
  _redditTokenExpiry = Date.now() + (j.expires_in - 60) * 1000;
  return _redditToken;
}

/**
 * Submit ONE post (self-post or link) to ONE subreddit.
 * Caller must have manually approved the content.
 *
 * @param {object} opts
 * @param {string} opts.subreddit  — name without "r/" (e.g. "SaaS")
 * @param {string} opts.title      — ≤300 chars
 * @param {string} [opts.text]     — self-post body (markdown), required if kind="self"
 * @param {string} [opts.url]      — link URL, required if kind="link"
 * @param {"self"|"link"} [opts.kind="self"]
 * @returns {Promise<{ok:boolean, url?:string, id?:string, error?:string}>}
 */
async function postToReddit({ subreddit, title, text, url, kind = 'self' }) {
  if (!subreddit) return { ok: false, error: 'subreddit_required' };
  if (!title)     return { ok: false, error: 'title_required' };
  if (kind === 'self' && !text) return { ok: false, error: 'text_required_for_self_post' };
  if (kind === 'link' && !url)  return { ok: false, error: 'url_required_for_link_post' };

  let token;
  try { token = await getRedditToken(); }
  catch (e) { return { ok: false, error: e.message }; }

  const user = process.env.REDDIT_USERNAME || 'melyxdev-bot';
  const params = {
    sr:    subreddit.replace(/^r\//i, ''),
    kind,
    title: String(title).slice(0, 300),
    api_type: 'json',
  };
  if (kind === 'self') params.text = String(text).slice(0, 40000);
  else                 params.url  = String(url);

  const r = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/x-www-form-urlencoded',
      'User-Agent':    `melyxdev-blog-sync/1.0 by ${user}`,
    },
    body: new URLSearchParams(params),
  });

  const j = await r.json().catch(() => ({}));
  const errs = j?.json?.errors || [];
  if (errs.length) {
    return { ok: false, error: errs.map(e => e.join(':')).join('; ') };
  }
  if (!r.ok) {
    return { ok: false, error: JSON.stringify(j).slice(0, 200) };
  }
  return {
    ok:  true,
    url: j?.json?.data?.url,
    id:  j?.json?.data?.id,
  };
}

module.exports = { getRedditToken, postToReddit };
