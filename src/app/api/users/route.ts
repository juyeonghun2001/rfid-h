import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET /api/users - 사용자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        hospitalUsers: {
          select: {
            hospital: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // hospitalUsers를 hospitals 배열로 변환
    const usersWithHospitals = users.map(user => {
      const { hospitalUsers, ...userWithoutHospitalUsers } = user as any
      return {
        ...userWithoutHospitalUsers,
        hospitals: hospitalUsers.map((hu: any) => hu.hospital)
      }
    })

    return NextResponse.json({
      success: true,
      data: usersWithHospitals
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: '사용자 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/users - 사용자 생성
export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 존재하는 아이디입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'member'
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '사용자가 생성되었습니다.',
      data: user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: '사용자 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
