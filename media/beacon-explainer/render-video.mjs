import { createServer } from "node:http";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { copyFile, rm } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import ffmpegPath from "ffmpeg-static";
import { chromium } from "playwright-core";

const root = fileURLToPath(new URL(".", import.meta.url));
const outputPath = resolve(process.argv[2] ?? join(root, "beacon-of-light.mp4"));
const webmPath = join(root, ".render-beacon.webm");
const chromeCandidates = [
  process.env.BEACON_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const executablePath = chromeCandidates.find(existsSync);

if (!executablePath) {
  throw new Error("Chrome/Chromium was not found. Set BEACON_CHROME_PATH.");
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const target = resolve(root, relative);
    if (!target.startsWith(resolve(root) + sep) || !existsSync(target) || statSync(target).isDirectory()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": contentTypes[extname(target)] ?? "application/octet-stream" });
    const { createReadStream } = await import("node:fs");
    createReadStream(target).pipe(response);
  } catch (error) {
    response.writeHead(500).end(String(error));
  }
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const { port } = server.address();
mkdirSync(resolve(outputPath, ".."), { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--use-angle=swiftshader"],
});

try {
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("console", (message) => process.stdout.write(`[browser] ${message.type()}: ${message.text()}\n`));
  page.on("pageerror", (error) => process.stderr.write(`[browser] ${error.stack || error}\n`));

  const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
  const download = await downloadPromise;
  await download.saveAs(webmPath);

  const browserError = await page.evaluate(() => window.__BEACON_ERROR ?? null);
  if (browserError) throw new Error(browserError);
  await context.close();
} finally {
  await browser.close();
  server.close();
}

const ffmpeg = spawnSync(
  ffmpegPath,
  [
    "-y",
    "-i",
    webmPath,
    "-t",
    "26",
    "-an",
    "-r",
    "30",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "19",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  ],
  { encoding: "utf8" },
);

if (ffmpeg.status !== 0) {
  process.stderr.write(ffmpeg.stderr);
  throw new Error(`ffmpeg failed with status ${ffmpeg.status}`);
}

await rm(webmPath, { force: true });
process.stdout.write(`Rendered ${outputPath}\n`);
