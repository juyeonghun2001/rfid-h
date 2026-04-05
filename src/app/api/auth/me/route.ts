import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// GET /api/auth/me - 현재 로그인한 사용자 정보
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        username: user.username,
        role: user.role,
        hospitalIds: user.hospitalIds
      }
    })
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
