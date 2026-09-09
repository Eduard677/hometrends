#!/usr/bin/env node
/** Restore genuine Shopify product photos into public/media/shopify. */
import { mkdir, writeFile, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve("public/media/shopify");
const CATALOG = path.resolve("src/data/ht-shop.json");
const SOURCE = path.resolve("public/data/ht-shop.json");
const CONCURRENCY = 12;

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  await execFileAsync("curl", ["-fsL", "--retry", "2", "--retry-delay", "1", "-o", dest, url], {
    timeout: 30000,
  });
}

async function main() {
  const shop = JSON.parse(await (await import("node:fs/promises")).readFile(CATALOG, "utf8"));
  const raw = JSON.parse(await (await import("node:fs/promises")).readFile(SOURCE, "utf8"));
  const byHandle = new Map((raw.products ?? raw).map((p) => [p.handle, p]));
  await mkdir(ROOT, { recursive: true });

  const jobs = [];
  for (const item of shop) {
    const src = byHandle.get(item.slug);
    const url = src?.image;
    if (!url) {
      jobs.push({ slug: item.slug, dest: path.join(ROOT, path.basename(item.image)), url: null });
      continue;
    }
    const dest = path.join(ROOT, path.basename(item.image));
    jobs.push({ slug: item.slug, dest, url });
  }

  let ok = 0;
  let skipped = 0;
  let failed = [];
  let i = 0;
  async function worker() {
    while (i < jobs.length) {
      const job = jobs[i++];
      if (!job.url) {
        failed.push({ slug: job.slug, reason: "no-source-url" });
        continue;
      }
      if (await exists(job.dest)) {
        skipped += 1;
        continue;
      }
      try {
        await download(job.url, job.dest);
        ok += 1;
        if ((ok + skipped) % 50 === 0) console.log(`images ${ok + skipped}/${jobs.length}`);
      } catch (err) {
        failed.push({ slug: job.slug, reason: err.message });
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  await writeFile(
    path.join(ROOT, "restore-log.json"),
    JSON.stringify({ restored: ok, skipped, failed, total: jobs.length, at: new Date().toISOString() }, null, 2),
  );
  console.log(`restored ${ok}, skipped ${skipped}, failed ${failed.length}, total ${jobs.length}`);
  if (failed.length) {
    console.log("failed sample", failed.slice(0, 8));
    process.exitCode = 1;
  }
}

main();
