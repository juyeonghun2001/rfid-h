import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/users/[id]/hospitals - 사용자에게 병원 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { hospitalId } = await request.json()

    if (!hospitalId) {
      return NextResponse.json(
        { success: false, error: '병원 ID를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 병원 존재 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    })

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: '병원을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 존재하는 관계인지 확인
    const existing = await prisma.hospitalUser.findUnique({
      where: {
        userId_hospitalId: {
          userId: id,
          hospitalId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 소속된 병원입니다.' },
        { status: 400 }
      )
    }

    // 병원 추가
    await prisma.hospitalUser.create({
      data: {
        userId: id,
        hospitalId
      }
    })

    return NextResponse.json({
      success: true,
      message: '병원이 추가되었습니다.'
    })
  } catch (error) {
    console.error('Error adding hospital:', error)
    return NextResponse.json(
      { success: false, error: '병원 추가에 실패했습니다.' },
      { status: 500 }
    )
  }
}
