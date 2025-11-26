import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveTranscript = mutation({
  args: { id: v.id("notes"), transcript: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      transcription: args.transcript,
      generatingTranscript: false,
    });
  },
});
