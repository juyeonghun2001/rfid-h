import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/employees - 직원 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const departmentId = searchParams.get('departmentId')
    const search = searchParams.get('search') || ''
    const rfidStatus = searchParams.get('rfidStatus') // 'registered' | 'unregistered'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const all = searchParams.get('all') === 'true'
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (departmentId) {
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
