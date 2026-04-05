import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/logs - 스캔/출력 이력 조회
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    let hospitalId = searchParams.get('hospitalId')
    const departmentId = searchParams.get('departmentId')
    const actionType = searchParams.get('actionType') as 'SCAN' | 'REGISTER' | 'PRINT' | null
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // member 역할인 경우 자신이 속한 병원의 이력만 조회
    if (currentUser.role === 'member') {
      if (currentUser.hospitalIds.length === 0) {
        // 소속된 병원이 없는 member 계정은 이력 데이터를 볼 수 없음
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        })
      }
      // 요청된 hospitalId가 자신의 병원에 속하는지 확인
      if (hospitalId && !currentUser.hospitalIds.includes(hospitalId)) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        })
      }
    }

    if (actionType) {
      where.actionType = actionType
    }

    if (from || to) {
      where.createdAt = {}
      if (from) (where.createdAt as Record<string, Date>).gte = new Date(from)
      if (to) {
        const toDate = new Date(to)
        toDate.setHours(23, 59, 59, 999)
        ;(where.createdAt as Record<string, Date>).lte = toDate
      }
    }

    if (departmentId) {
      where.employee = { departmentId }
    } else if (hospitalId) {
      where.employee = { department: { hospitalId } }
    } else if (currentUser.role === 'member' && currentUser.hospitalIds.length > 0) {
      // member이고 병원 필터가 없으면 자신의 모든 병원 이력 조회
      where.employee = {
        department: {
          hospitalId: { in: currentUser.hospitalIds }
        }
      }
    }

    if (search) {
      where.OR = [
        { rfidCode: { contains: search, mode: 'insensitive' } },
        { employee: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [logs, total] = await Promise.all([
      prisma.scanLog.findMany({
        where,
        include: {
          employee: {
            include: {
              department: {
                include: { hospital: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.scanLog.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('로그 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '로그를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/logs - 로그 기록 (PDA에서 호출)
export async function POST(request: NextRequest) {
  try {
    const { employeeId, actionType, rfidCode, deviceId } = await request.json()

    if (!employeeId || !actionType || !rfidCode || !deviceId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const log = await prisma.scanLog.create({
      data: {
        employeeId,
        actionType,
        rfidCode,
        deviceId
      },
      include: {
        employee: {
          include: {
            department: {
              include: { hospital: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: log,
      message: '로그가 기록되었습니다.'
    })
  } catch (error) {
    console.error('로그 기록 오류:', error)
    return NextResponse.json(
      { success: false, error: '로그 기록에 실패했습니다.' },
      { status: 500 }
    )
  }
}
