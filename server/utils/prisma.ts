import { PrismaClient } from '@prisma/client'

// Instance singleton du client Prisma
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

// Typage global pour éviter les instances multiples en développement
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

// Utiliser l'instance globale si elle existe, sinon en créer une nouvelle
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

// En développement, stocker l'instance dans globalThis pour éviter les reconnexions
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
