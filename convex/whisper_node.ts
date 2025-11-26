"use node";

import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { execSync } from "child_process";
import fs from "fs";
import { internal } from "./_generated/api";
import os from "os";
import path from "path";

// --- NODE RUNTIME: Local Whisper Transcription ---
export const chat = internalAction({
  args: {
    fileUrl: v.string(),
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const fileResponse = await fetch(args.fileUrl);
    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tmpDir = os.tmpdir(); // always writable inside Convex Node runtime
    const filePath = path.join(tmpDir, `tmp_audio_${Date.now()}.wav`);
    fs.writeFileSync(filePath, new Uint8Array(buffer));

    let transcript = "Transcription failed.";
    // try {
    //   const result = execSync(`python transcribe_local.py ${filePath}`).toString().trim();
    //   transcript = result.length > 0 ? result : "No speech detected.";
    // } catch (err) {
    //   console.error("Whisper failed:", err);
    // }

// await ctx.runMutation(internal.whisper.saveTranscript, {
//   id: args.id,
//   transcript,
// });
await ctx.runMutation((internal as any).whisper.saveTranscript, {
  id: args.id,
  transcript,
});

    fs.unlinkSync(filePath);
  },
});
