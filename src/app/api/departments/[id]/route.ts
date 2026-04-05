import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/departments/:id - 부서 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        hospital: true,
        employees: true
      }
    })

    if (!department) {
      return NextResponse.json(
        { success: false, error: '부서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: department
    })
  } catch (error) {
    console.error('부서 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '부서 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT /api/departments/:id - 부서 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { hospitalId, name } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: '부서명을 입력해주세요.' },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = { name: name.trim() }
    if (hospitalId) data.hospitalId = hospitalId

    const department = await prisma.department.update({
      where: { id },
      data,
      include: {
        hospital: true
      }
    })

    return NextResponse.json({
      success: true,
      data: department,
      message: '부서 정보가 수정되었습니다.'
    })
  } catch (error) {
    console.error('부서 수정 오류:', error)
    return NextResponse.json(
      { success: false, error: '부서 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/departments/:id - 부서 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.department.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '부서가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('부서 삭제 오류:', error)
    return NextResponse.json(
      { success: false, error: '부서 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
