import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 1700 } });
await p.goto("file:///root/wirit/data/out/preview-m2-gov.html", { waitUntil: "networkidle" });
await p.screenshot({ path: "/tmp/preview-check.png", fullPage: false });
await b.close();
