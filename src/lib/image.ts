import "server-only";
import sharp from "sharp";

export async function convertPaymentProofToWebp(input: Buffer) {
  return sharp(input, { failOn: "error", limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}
