import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/users/[id]/hospitals/[hospitalId] - 사용자의 병원 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hospitalId: string }> }
) {
  try {
    const { id, hospitalId } = await params

    // 관계 존재 확인
    const hospitalUser = await prisma.hospitalUser.findUnique({
      where: {
        userId_hospitalId: {
          userId: id,
          hospitalId
        }
      }
    })

    if (!hospitalUser) {
      return NextResponse.json(
        { success: false, error: '소속되지 않은 병원입니다.' },
        { status: 404 }
      )
    }

    // 병원 제거
    await prisma.hospitalUser.delete({
      where: {
        userId_hospitalId: {
          userId: id,
          hospitalId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '병원이 제거되었습니다.'
    })
  } catch (error) {
    console.error('Error removing hospital:', error)
    return NextResponse.json(
      { success: false, error: '병원 제거에 실패했습니다.' },
      { status: 500 }
    )
  }
}
