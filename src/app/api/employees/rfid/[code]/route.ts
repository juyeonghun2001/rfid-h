import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/employees/rfid/:code - RFID로 직원 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const employee = await prisma.employee.findFirst({
      where: { rfidCode: code },
      include: {
        department: {
          include: { hospital: true }
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: '등록되지 않은 RFID입니다.', data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: employee
    })
  } catch (error) {
    console.error('RFID 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: 'RFID 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}
