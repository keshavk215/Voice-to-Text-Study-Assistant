import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export async function POST(req: Request) {
  const { noteId, storageId } = await req.json();

  // 1️⃣ Get the real Convex download URL for the audio
  const fileUrl = await fetchQuery(api.utils.getFileUrl, { storageId });

  // 2️⃣ Download the audio file locally
  const res = await fetch(fileUrl);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3️⃣ Save it temporarily to disk
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `tmp_audio_${Date.now()}.wav`);
  fs.writeFileSync(filePath, new Uint8Array(buffer));

  // 4️⃣ Run Whisper locally using your installed Python
let transcript = "Transcription failed.";

try {
  // Run the Python script and capture its UTF-8 output
  const result = execSync(`python transcribe_local.py "${filePath}"`, { encoding: "utf-8" }).trim();

  // Try parsing as JSON (since transcribe_local.py prints {"text": "..."} )
  try {
    const parsed = JSON.parse(result);
    transcript = (parsed.text || "").trim();
  } catch {
    // If it’s not valid JSON (edge case), just use raw text
    transcript = result;
  }

  // Handle empty result
  if (!transcript) {
    transcript = "No speech detected.";
  }
} catch (err) {
  console.error("Whisper failed:", err);
}


  // 5️⃣ Save the transcript to Convex
  await fetchMutation(api.whisper.saveTranscript, {
    id: noteId,
    transcript,
  });

  // 6️⃣ Delete temporary audio file
  fs.unlinkSync(filePath);

  return new Response("Transcription complete", { status: 200 });
}
