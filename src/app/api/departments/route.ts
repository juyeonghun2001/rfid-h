import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/departments - 부서 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const all = searchParams.get('all') === 'true'
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (hospitalId) where.hospitalId = hospitalId
    if (search) where.name = { contains: search, mode: 'insensitive' }

    if (all) {
      const departments = await prisma.department.findMany({
        where,
        include: {
          hospital: true,
          _count: {
            select: { employees: true }
          }
        },
        orderBy: [
          { hospital: { name: 'asc' } },
          { name: 'asc' }
        ]
      })

      return NextResponse.json({
        success: true,
        data: departments
      })
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        include: {
          hospital: true,
          _count: {
            select: { employees: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.department.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: departments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('부서 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '부서 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/departments - 부서 등록
export async function POST(request: NextRequest) {
  try {
    const { hospitalId, name } = await request.json()

    if (!hospitalId) {
      return NextResponse.json(
        { success: false, error: '병원을 선택해주세요.' },
        { status: 400 }
      )
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: '부서명을 입력해주세요.' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        hospitalId,
        name: name.trim()
      },
      include: {
        hospital: true
      }
    })

    return NextResponse.json({
      success: true,
      data: department,
      message: '부서가 등록되었습니다.'
    })
  } catch (error) {
    console.error('부서 등록 오류:', error)
    return NextResponse.json(
      { success: false, error: '부서 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}
