import { PrismaClient } from '@prisma/client'
import { generateHashedPassword } from '../src/utils/hashPassword.utils'

// import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {

  const one_user = 
    { name: "Daniel", last_name: "Peña", email: "pokemon@gmail.com", phone_number: "3123123123", state_id: true, is_verified: true }

  const credentials_password = "User123."

 
  // Crear usuario verificado por defecto
  await prisma.users.create({
    data: {
      ...one_user, // Datos del usuario
      credentials: {
        create: {
          password: await generateHashedPassword(credentials_password),
        }
      }
    }
  })

  console.log('Seeds creados exitosamente... 😎👍👌')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
