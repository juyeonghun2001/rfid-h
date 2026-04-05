import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/dashboard/stats - 대시보드 통계
export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalHospitals,
      totalEmployees,
      rfidRegistered,
      todayScans,
      todayRegisters,
      todayPrints
    ] = await Promise.all([
      prisma.hospital.count(),
      prisma.employee.count(),
      prisma.employee.count({ where: { rfidCode: { not: null } } }),
      prisma.scanLog.count({
        where: {
          actionType: 'SCAN',
          createdAt: { gte: today }
        }
      }),
      prisma.scanLog.count({
        where: {
          actionType: 'REGISTER',
          createdAt: { gte: today }
        }
      }),
      prisma.scanLog.count({
        where: {
          actionType: 'PRINT',
          createdAt: { gte: today }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalHospitals,
        totalEmployees,
        rfidRegistered,
        rfidUnregistered: totalEmployees - rfidRegistered,
        todayScans,
        todayRegisters,
        todayPrints
      }
    })
  } catch (error) {
    console.error('통계 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
