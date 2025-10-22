import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/drizzle"
import * as schema from "@/drizzle/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    }
  }),
  emailAndPassword: {
    enabled: false, // Desabilitado - login apenas via Google
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "usuario",
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
      },
      businessName: {
        type: "string",
        required: false,
      },
      businessType: {
        type: "string",
        required: false,
      },
      plan: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      totalOrders: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      totalSpent: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
    }
  },
  advanced: {
    cookiePrefix: "orca-norte",
  },
})

export type Session = typeof auth.$Infer.Session

