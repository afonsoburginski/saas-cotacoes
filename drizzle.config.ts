import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema.tsx",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;

