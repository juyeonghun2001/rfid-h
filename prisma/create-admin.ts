import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const username = 'admin'
  const password = 'infozpp00..'

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10)

  // 관리자 계정 생성
  const admin = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('관리자 계정이 생성되었습니다:')
  console.log(`아이디: ${username}`)
  console.log(`비밀번호: ${password}`)
  console.log(`역할: ${admin.role}`)
}

createAdmin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
