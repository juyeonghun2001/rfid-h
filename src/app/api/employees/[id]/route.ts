import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/employees/:id - 직원 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: {
          include: { hospital: true }
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: '직원을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: employee
    })
  } catch (error) {
    console.error('직원 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '직원 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT /api/employees/:id - 직원 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { departmentId, name, phone, location, uniformType, memo } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: '이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {
      name: name.trim(),
      phone: phone?.trim() || null,
      location: location?.trim() || null,
      uniformType: uniformType?.trim() || null,
      memo: memo?.trim() || null
    }
    if (departmentId) data.departmentId = departmentId

    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: {
        department: {
          include: { hospital: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: employee,
      message: '직원 정보가 수정되었습니다.'
    })
  } catch (error) {
    console.error('직원 수정 오류:', error)
    return NextResponse.json(
      { success: false, error: '직원 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/employees/:id - 직원 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.employee.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '직원이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('직원 삭제 오류:', error)
    return NextResponse.json(
      { success: false, error: '직원 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
