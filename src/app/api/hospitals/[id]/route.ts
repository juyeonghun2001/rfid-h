import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/hospitals/:id - 병원 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            _count: {
              select: { employees: true }
            }
          }
        }
      }
    })

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: '병원을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: hospital
    })
  } catch (error) {
    console.error('병원 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '병원 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT /api/hospitals/:id - 병원 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: '병원명을 입력해주세요.' },
        { status: 400 }
      )
    }

    const hospital = await prisma.hospital.update({
      where: { id },
      data: { name: name.trim() }
    })

    return NextResponse.json({
      success: true,
      data: hospital,
      message: '병원 정보가 수정되었습니다.'
    })
  } catch (error) {
    console.error('병원 수정 오류:', error)
    return NextResponse.json(
      { success: false, error: '병원 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/hospitals/:id - 병원 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.hospital.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '병원이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('병원 삭제 오류:', error)
    return NextResponse.json(
      { success: false, error: '병원 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
