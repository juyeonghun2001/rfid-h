import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/employees - 직원 목록 조회
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
    const search = searchParams.get('search') || ''
    const rfidStatus = searchParams.get('rfidStatus') // 'registered' | 'unregistered'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const all = searchParams.get('all') === 'true'
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // member 역할인 경우 자신이 속한 병원의 직원만 조회
    if (currentUser.role === 'member') {
      if (currentUser.hospitalIds.length === 0) {
        // 소속된 병원이 없는 member 계정은 직원 데이터를 볼 수 없음
        if (all) {
          return NextResponse.json({
            success: true,
            data: []
          })
        }
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
        if (all) {
          return NextResponse.json({
            success: true,
            data: []
          })
        }
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

    // member이고 hospitalId/departmentId 파라미터가 없으면 자신의 병원들만 조회
    if (currentUser.role === 'member' && !hospitalId && !departmentId && currentUser.hospitalIds.length > 0) {
      where.department = { hospitalId: { in: currentUser.hospitalIds } }
    } else if (departmentId) {
      where.departmentId = departmentId
    } else if (hospitalId) {
      where.department = { hospitalId }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { rfidCode: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (rfidStatus === 'registered') {
      where.rfidCode = { not: null }
    } else if (rfidStatus === 'unregistered') {
      where.rfidCode = null
    }

    if (all) {
      const employees = await prisma.employee.findMany({
        where,
        include: {
          department: {
            include: { hospital: true }
          }
        },
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({
        success: true,
        data: employees
      })
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: {
            include: { hospital: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.employee.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('직원 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '직원 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/employees - 직원 등록
export async function POST(request: NextRequest) {
  try {
    const { departmentId, name, phone, location, uniformType, memo } = await request.json()

    if (!departmentId) {
      return NextResponse.json(
        { success: false, error: '부서를 선택해주세요.' },
        { status: 400 }
      )
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: '이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.create({
      data: {
        departmentId,
        name: name.trim(),
        phone: phone?.trim() || null,
        location: location?.trim() || null,
        uniformType: uniformType?.trim() || null,
        memo: memo?.trim() || null
      },
      include: {
        department: {
          include: { hospital: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: employee,
      message: '직원이 등록되었습니다.'
    })
  } catch (error) {
    console.error('직원 등록 오류:', error)
    return NextResponse.json(
      { success: false, error: '직원 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}
