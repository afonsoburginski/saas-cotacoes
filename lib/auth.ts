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
  session: {
    // Expiração da sessão: 30 dias (em segundos)
    expiresIn: 60 * 60 * 24 * 30,
    // Atualizar sessão a cada 7 dias de atividade (evita perder sessão por inatividade)
    updateAge: 60 * 60 * 24 * 7,
  },
  advanced: {
    cookiePrefix: "orca-norte",
    // Configurações de cookie para manter sessão persistentemente
    cookies: {
      sessionToken: {
        attributes: {
          // HttpOnly para segurança (proteção contra XSS)
          httpOnly: true,
          // Secure apenas em produção (HTTPS)
          secure: process.env.NODE_ENV === "production",
          // SameSite para permitir cookies em cross-site quando necessário
          sameSite: "lax",
          // Path para garantir que o cookie seja enviado em todas as rotas
          path: "/",
          // Max-Age será gerenciado pelo Better Auth baseado em expiresIn
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session

