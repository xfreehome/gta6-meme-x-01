// gta6-meme-x-01 — the meme entry program.
// Standard library only, no network. Run from this directory: node main.ts
// It verifies the meme image and POST.json, writes caption.txt and
// manifest.json, and prints a summary. The image itself (meme.png) was built
// by build_meme.py from an AI-generated Vice City scene plus the official
// make.fun press assets in assets/ (ghost mark + lockup from https://make.fun/press/).
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";

const IMAGE = "meme.png";
const POST = "POST.json";
const CAPTION =
  "Waited 12 years for GTA 6. My AI agent already made $500 on make.fun 😂 @makefunai makefun-octopus-candy-pilot";
const COMPETITION = "gta6-meme-x-01";
const ACCOUNT = "@0xredzone";
const PLAY_CODE = "makefun-octopus-candy-pilot";

function pngSize(buf: Buffer): { width: number; height: number } {
  if (buf.length < 33 || buf.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`${IMAGE} is not a PNG file`);
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function postUrl(): string {
  if (!existsSync(POST)) throw new Error(`${POST} is missing`);
  const parsed: unknown = JSON.parse(readFileSync(POST, "utf8"));
  const handle = ACCOUNT.replace(/^@/, "");
  const pattern = new RegExp(`^https://x\\.com/${handle}/status/\\d+$`);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { url?: unknown }).url !== "string" ||
    !pattern.test((parsed as { url: string }).url)
  ) {
    throw new Error(`${POST} must carry a url like https://x.com/${handle}/status/<id>`);
  }
  return (parsed as { url: string }).url;
}

function main(): void {
  if (!existsSync(IMAGE)) throw new Error(`${IMAGE} is missing`);
  const buf = readFileSync(IMAGE);
  const { width, height } = pngSize(buf);
  const sha256 = createHash("sha256").update(buf).digest("hex");
  const bytes = statSync(IMAGE).size;
  const post_url = postUrl();

  writeFileSync("caption.txt", CAPTION + "\n");
  const manifest = {
    competition: COMPETITION,
    account: ACCOUNT,
    play_code: PLAY_CODE,
    post_url,
    image: IMAGE,
    width,
    height,
    bytes,
    sha256,
    caption: CAPTION,
  };
  writeFileSync("manifest.json", JSON.stringify(manifest, null, 2) + "\n");

  console.log(`competition: ${COMPETITION}`);
  console.log(`account: ${ACCOUNT}`);
  console.log(`post: ${post_url}`);
  console.log(`image: ${IMAGE} (${width}x${height}, ${bytes} bytes, sha256 ${sha256})`);
  console.log(`caption: ${CAPTION}`);
  console.log("wrote caption.txt and manifest.json");
}

main();
