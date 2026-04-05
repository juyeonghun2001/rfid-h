import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/dashboard/stats - 대시보드 통계
export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 권한에 따른 필터링
    if (currentUser.role === 'member' && currentUser.hospitalIds.length === 0) {
      // 소속된 병원이 없는 member 계정은 빈 데이터 반환
      return NextResponse.json({
        success: true,
        data: {
          totalHospitals: 0,
          totalEmployees: 0,
          rfidRegistered: 0,
          rfidUnregistered: 0,
          todayScans: 0,
          todayRegisters: 0,
          todayPrints: 0
        }
      })
    }

    const hospitalFilter = currentUser.role === 'member'
      ? { id: { in: currentUser.hospitalIds } }
      : {}

    const [
      totalHospitals,
      totalEmployees,
      rfidRegistered,
      todayScans,
      todayRegisters,
      todayPrints
    ] = await Promise.all([
      prisma.hospital.count({ where: hospitalFilter }),
      prisma.employee.count({
        where: hospitalFilter.id ? {
          department: { hospitalId: { in: currentUser.hospitalIds } }
        } : undefined
      }),
      prisma.employee.count({
        where: {
          rfidCode: { not: null },
          ...(hospitalFilter.id ? {
            department: { hospitalId: { in: currentUser.hospitalIds } }
          } : {})
        }
      }),
      prisma.scanLog.count({
        where: {
          actionType: 'SCAN',
          createdAt: { gte: today },
          ...(hospitalFilter.id ? {
            employee: {
              department: { hospitalId: { in: currentUser.hospitalIds } }
            }
          } : {})
        }
      }),
      prisma.scanLog.count({
        where: {
          actionType: 'REGISTER',
          createdAt: { gte: today },
          ...(hospitalFilter.id ? {
            employee: {
              department: { hospitalId: { in: currentUser.hospitalIds } }
            }
          } : {})
        }
      }),
      prisma.scanLog.count({
        where: {
          actionType: 'PRINT',
          createdAt: { gte: today },
          ...(hospitalFilter.id ? {
            employee: {
              department: { hospitalId: { in: currentUser.hospitalIds } }
            }
          } : {})
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
