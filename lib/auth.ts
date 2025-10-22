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
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    "https://www.orcanorte.com.br",
    "https://orcanorte.com.br",
  ],
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
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // Atualiza a cada 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 * 1000, // 5 minutos
    },
  },
})

export type Session = typeof auth.$Infer.Session

