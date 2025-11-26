import { ConvexError } from 'convex/values';
import { action, mutation, query } from './_generated/server';
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions';
import { Auth } from 'convex/server';
import { v } from "convex/values";

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
  console.error("Storage ID not found or deleted:", args.storageId);
  throw new Error(`Audio file unavailable, please re-record`);
}
    return url;
  },
});

export const queryWithUser = customQuery(
  query,
  customCtx(async (ctx) => {
    return {
      userId: await getUserId(ctx),
    };
  }),
);

export const mutationWithUser = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const userId = await getUserId(ctx);
    if (userId === undefined) {
      throw new ConvexError('User must be logged in.');
    }
    return { userId };
  }),
);

export const actionWithUser = customAction(
  action,
  customCtx(async (ctx) => {
    const userId = await getUserId(ctx);
    if (userId === undefined) {
      throw new ConvexError('User must be logged in.');
    }
    return { userId };
  }),
);

async function getUserId(ctx: { auth: Auth }) {
  const authInfo = await ctx.auth.getUserIdentity();
  return authInfo?.tokenIdentifier;
}

export const envVarsMissing = query({
  args: {},
  handler: async () => {
    if (process.env.TOGETHER_API_KEY) {
      return null;
    }
    const deploymentName = process.env.CONVEX_CLOUD_URL?.slice(8).replace(
      '.convex.cloud',
      '',
    );
    return (
      'https://dashboard.convex.dev/d/' +
      deploymentName +
      `/settings/environment-variables?var=TOGETHER_API_KEY`
    );
  },
});
