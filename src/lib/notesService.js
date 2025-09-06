import { supabase } from "./supabaseClient";
import {
  encryptText,
  decryptText,
  derivePasswordHash,
  passwordLookupHash,
} from "./crypto";
import { nanoid } from "nanoid";

export async function createNote({
  text,
  password,
  expiresAt = null,
  oneTime = false,
}) {
  const id = nanoid(16);
  const payload = await encryptText(text, password);
  const lookup_hash = await passwordLookupHash(password);

  const { error } = await supabase.from("notes").insert({
    id,
    encrypted_content: payload.encrypted_content,
    password_hash: payload.password_hash, // salted verifier
    lookup_hash, // unsalted lookup key
    salt: payload.salt,
    iv: payload.iv,
    expires_at: expiresAt,
    one_time: oneTime,
  });

  if (error) throw new Error(error.message);
  return { id };
}

export async function fetchNoteByPassword(password) {
  const lookup_hash = await passwordLookupHash(password);
  const { data, error } = await supabase.rpc("fetch_by_password", {
    p_lookup_hash: lookup_hash,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { notFound: true };

  // verify against salted hash, then decrypt
  const expected = await derivePasswordHash(password, row.salt);
  if (expected !== row.password_hash) return { wrongPassword: true };

  try {
    const plaintext = await decryptText(
      row.encrypted_content,
      password,
      row.salt,
      row.iv
    );
    return {
      plaintext,
      meta: { one_time: row.one_time, view_count: row.view_count },
    };
  } catch {
    return { wrongPassword: true };
  }
}
