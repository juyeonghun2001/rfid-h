import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/logs - 스캔/출력 이력 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const departmentId = searchParams.get('departmentId')
    const actionType = searchParams.get('actionType') as 'SCAN' | 'REGISTER' | 'PRINT' | null
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

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
