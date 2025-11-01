// Re-exportar DB do drizzle para manter compatibilidade
// e garantir que todos os arquivos usam a mesma instância (singleton)
export { db } from "@/drizzle"
