import "server-only";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const paymentBucket = "payment-proofs";
const courtBucket = "court-images";
let adminClient: SupabaseClient | undefined;
let bucketReady: Promise<void> | undefined;

export function isSupabaseStorageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getAdminClient() {
  if (!isSupabaseStorageConfigured()) throw new Error("Supabase Storage belum dikonfigurasi");
  adminClient ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  return adminClient;
}

async function ensurePaymentBucket() {
  const supabase = getAdminClient();
  const { data } = await supabase.storage.getBucket(paymentBucket);
  if (data) return;
  const { error } = await supabase.storage.createBucket(paymentBucket, { public: false, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes: ["image/webp"] });
  if (error && !error.message.toLowerCase().includes("already exists")) throw error;
}

export async function uploadPaymentProofWebp(buffer: Buffer, bookingId: string) {
  bucketReady ??= ensurePaymentBucket();
  await bucketReady;
  const path = `${bookingId}/${randomUUID()}.webp`;
  const { error } = await getAdminClient().storage.from(paymentBucket).upload(path, buffer, { contentType: "image/webp", cacheControl: "3600", upsert: false });
  if (error) throw error;
  return { bucket: paymentBucket, path };
}

export async function removePaymentProof(path: string) {
  const { error } = await getAdminClient().storage.from(paymentBucket).remove([path]);
  if (error) throw error;
}

export async function createPaymentProofSignedUrl(path: string, expiresInSeconds = 300) {
  const { data, error } = await getAdminClient().storage.from(paymentBucket).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadCourtImageWebp(buffer: Buffer) {
  const supabase = getAdminClient();
  const { data } = await supabase.storage.getBucket(courtBucket);
  if (!data) { const { error } = await supabase.storage.createBucket(courtBucket, { public: true, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes: ["image/webp"] }); if (error && !error.message.toLowerCase().includes("already exists")) throw error; }
  const path = `${randomUUID()}.webp`;
  const { error } = await supabase.storage.from(courtBucket).upload(path, buffer, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return supabase.storage.from(courtBucket).getPublicUrl(path).data.publicUrl;
}
