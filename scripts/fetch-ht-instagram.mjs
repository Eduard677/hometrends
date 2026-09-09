#!/usr/bin/env node
/**
 * Pull stills from @hometrends.ennis.
 *
 * Instagram's profile API needs a session cookie. Without one we use the
 * public embed page for known posts (works, no login).
 *
 *   node scripts/fetch-ht-instagram.mjs
 *   INSTAGRAM_SESSION_ID=... node scripts/fetch-ht-instagram.mjs --all
 */
import { writeFile, mkdir, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

const USER = "hometrends.ennis";
const OUT = path.resolve("public/media/instagram");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SEED = [
  "DWPTopHDCc2",
  "DQ2IhG3jHAb",
  "DQCoQyJDMLJ",
  "DYz-Vu-Mmn2",
  "DbgfyZfM84u",
  "C74jg8UtOeH",
  "C-8IH_Nt88V",
];

async function download(url, dest) {
  await execFileAsync("curl", ["-sL", "-A", UA, "-H", "Referer: https://www.instagram.com/", "-o", dest, url]);
}

function pickPhoto(html) {
  const raw = [...html.matchAll(/https:\/\/scontent[^"'\\\s<>]+/gi)].map((m) =>
    m[0].replace(/&/g, "&").replace(/\\u0026/g, "&"),
  );
  const photos = raw.filter((u) => /t51\.8/.test(u) && !/s150x150/.test(u) && !/s100x100/.test(u));
  const ranked = photos.sort((a, b) => {
    const score = (u) =>
      /p1080x1080|1440|e35_tt6/.test(u) && !/p720|p640|p480|p320|p240/.test(u) ? 5 : /p1080/.test(u) ? 4 : /p720/.test(u) ? 2 : 1;
    return score(b) - score(a);
  });
  return ranked[0] || photos[0];
}

async function curlGet(url) {
  const { stdout } = await execFileAsync("curl", ["-sL", "-A", UA, url], {
    maxBuffer: 8 * 1024 * 1024,
  });
  return stdout;
}

async function fromEmbed(shortcode) {
  const html = await curlGet(`https://www.instagram.com/p/${shortcode}/embed/`);
  if (html.length < 2000) throw new Error(`embed too small (${html.length})`);
  const caption = (html.match(/class="Caption"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)?.[1] || "")
    .replace(/<[^>]+>/g, "")
    .trim();
  const media = pickPhoto(html);
  if (!media) {
    const n = (html.match(/scontent/g) || []).length;
    throw new Error(`no still (scontent×${n}, ${html.length}b)`);
  }
  return { shortcode, caption, media };
}

async function fromSession(sessionId, limit) {
  const headers = {
    "User-Agent": UA,
    Accept: "application/json",
    "X-IG-App-ID": "936619743392459",
    Cookie: `sessionid=${sessionId}`,
  };
  const profileRes = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USER}`,
    { headers },
  );
  if (!profileRes.ok) throw new Error(`profile ${profileRes.status} — session likely expired`);
  const profile = await profileRes.json();
  const user = profile.data?.user;
  if (!user) throw new Error("no user on profile payload");
  const edges = user.edge_owner_to_timeline_media?.edges ?? [];
  return edges.slice(0, limit).map((edge) => ({
    shortcode: edge.node.shortcode,
    caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
    media: edge.node.display_url,
    isVideo: edge.node.is_video,
  }));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const session = process.env.INSTAGRAM_SESSION_ID;
  let posts = [];
  if (session) {
    console.log("Using Instagram session…");
    posts = await fromSession(session, 80);
  } else {
    console.log("No session — pulling public embeds for known posts.");
    for (const code of SEED) {
      try {
        posts.push(await fromEmbed(code));
      } catch (err) {
        console.warn(`skip ${code}:`, err.message);
      }
    }
  }

  const saved = [];
  for (const post of posts) {
    if (!post.media) {
      console.warn(`no still for ${post.shortcode}`);
      continue;
    }
    const dest = path.join(OUT, `${post.shortcode}.jpg`);
    try {
      await download(post.media, dest);
      const info = await stat(dest);
      if (info.size < 4000) throw new Error(`tiny file ${info.size}`);
      saved.push({ ...post, file: `/media/instagram/${post.shortcode}.jpg` });
      console.log("saved", post.shortcode, `${Math.round(info.size / 1024)}kb`);
    } catch (err) {
      console.warn(`fail ${post.shortcode}:`, err.message);
    }
  }

  await writeFile(path.join(OUT, "manifest.json"), JSON.stringify({ user: USER, fetched: saved }, null, 2));
  console.log(`\n${saved.length} stills → ${OUT}`);
  if (!session) {
    console.log("For the full grid: INSTAGRAM_SESSION_ID=<cookie> node scripts/fetch-ht-instagram.mjs");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
