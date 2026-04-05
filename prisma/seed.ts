import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 병원 생성
  const hospital1 = await prisma.hospital.create({
    data: {
      name: '서울대학교병원',
      departments: {
        create: [
          { name: '내과' },
          { name: '외과' },
          { name: '소아과' },
        ]
      }
    },
    include: { departments: true }
  })

  const hospital2 = await prisma.hospital.create({
    data: {
      name: '연세세브란스병원',
      departments: {
        create: [
          { name: '정형외과' },
          { name: '신경과' },
        ]
      }
    },
    include: { departments: true }
  })

  const hospital3 = await prisma.hospital.create({
    data: {
      name: '삼성서울병원',
      departments: {
        create: [
          { name: '응급의학과' },
          { name: '재활의학과' },
          { name: '피부과' },
        ]
      }
    },
    include: { departments: true }
  })

  // 직원 생성
  const employees = [
    { name: '홍길동', phone: '010-1234-5678', departmentId: hospital1.departments[0].id },
    { name: '김철수', phone: '010-2345-6789', departmentId: hospital1.departments[0].id },
    { name: '이영희', phone: '010-3456-7890', departmentId: hospital1.departments[1].id },
    { name: '박지민', phone: '010-4567-8901', departmentId: hospital1.departments[2].id },
    { name: '최수현', phone: '010-5678-9012', departmentId: hospital2.departments[0].id },
    { name: '정민수', phone: '010-6789-0123', departmentId: hospital2.departments[1].id },
    { name: '강태희', phone: '010-7890-1234', departmentId: hospital3.departments[0].id },
    { name: '윤서연', phone: '010-8901-2345', departmentId: hospital3.departments[1].id },
    { name: '임동혁', phone: '010-9012-3456', departmentId: hospital3.departments[2].id },
    { name: '한지우', phone: '010-0123-4567', departmentId: hospital3.departments[0].id },
  ]

  for (const emp of employees) {
    await prisma.employee.create({ data: emp })
  }

  // 일부 직원에게 RFID 등록
  const emps = await prisma.employee.findMany({ take: 5 })
  for (let i = 0; i < emps.length; i++) {
    await prisma.employee.update({
      where: { id: emps[i].id },
      data: {
        rfidCode: `E200341${String(i).padStart(4, '0')}B8020115${String(i).padStart(4, '0')}`,
        rfidRegisteredAt: new Date()
      }
    })
  }

  // 스캔 로그 생성
  const registeredEmps = await prisma.employee.findMany({
    where: { rfidCode: { not: null } }
  })

  for (const emp of registeredEmps) {
    // 스캔 로그
    await prisma.scanLog.create({
      data: {
        employeeId: emp.id,
        actionType: 'SCAN',
        rfidCode: emp.rfidCode!,
        deviceId: 'AT907-001'
      }
    })
    // 출력 로그
    await prisma.scanLog.create({
      data: {
        employeeId: emp.id,
        actionType: 'PRINT',
        rfidCode: emp.rfidCode!,
        deviceId: 'AT907-001'
      }
    })
  }

  console.log('Seeding completed!')
  console.log(`Created ${await prisma.hospital.count()} hospitals`)
  console.log(`Created ${await prisma.department.count()} departments`)
  console.log(`Created ${await prisma.employee.count()} employees`)
  console.log(`Created ${await prisma.scanLog.count()} scan logs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
