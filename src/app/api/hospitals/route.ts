import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/hospitals - 병원 목록 조회
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
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // 권한에 따른 필터링
    let where: any = {}
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const }
    }

    // member 역할인 경우 자신이 속한 병원만 조회
    if (currentUser.role === 'member') {
      if (currentUser.hospitalIds.length === 0) {
        // 소속된 병원이 없는 member 계정은 병원 데이터를 볼 수 없음
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        })
      }
      where.id = { in: currentUser.hospitalIds }
    }

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        include: {
          _count: {
            select: { departments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.hospital.count({ where })
    ])

    // 직원 수 계산
    const hospitalsWithCounts = await Promise.all(
      hospitals.map(async (hospital) => {
        const employeeCount = await prisma.employee.count({
          where: {
            department: {
              hospitalId: hospital.id
            }
          }
        })
        return {
          ...hospital,
          _count: {
            ...hospital._count,
            employees: employeeCount
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: hospitalsWithCounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('병원 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '병원 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/hospitals - 병원 등록
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: '병원명을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 병원 생성
    const hospital = await prisma.hospital.create({
      data: { name: name.trim() }
    })

    // member 계정이 병원 등록 시 자동으로 HospitalUser에 추가
    if (currentUser.role === 'member') {
      await prisma.hospitalUser.create({
        data: {
          userId: currentUser.id,
          hospitalId: hospital.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: hospital,
      message: '병원이 등록되었습니다.'
    })
  } catch (error) {
    console.error('병원 등록 오류:', error)
    return NextResponse.json(
      { success: false, error: '병원 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}
