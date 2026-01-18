import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });

const globalAuth = globalThis as unknown as {
  auth: ReturnType<typeof betterAuth>;
};

export const auth =
  globalAuth.auth ||
  betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },

    experimental: { joins: true },
    session: {
      disableSessionRefresh: false,
      cookieCache: {
        enabled: false,
        maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
        strategy: "jwe",
        refreshCache: true,
      },
      account: {
        storeStateStrategy: "cookie",
        storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalAuth.auth = auth;
}
