import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT /api/employees/:id/rfid - RFID 등록/수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { rfidCode, deviceId } = await request.json()

    if (!rfidCode?.trim()) {
      return NextResponse.json(
        { success: false, error: 'RFID 코드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 중복 체크
    const existing = await prisma.employee.findFirst({
      where: {
        rfidCode: rfidCode.trim(),
        id: { not: id }
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 RFID 코드입니다.' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        rfidCode: rfidCode.trim(),
        rfidRegisteredAt: new Date()
      },
      include: {
        department: {
          include: { hospital: true }
        }
      }
    })

    // 스캔 로그 기록
    if (deviceId) {
      await prisma.scanLog.create({
        data: {
          employeeId: id,
          actionType: 'SCAN',
          rfidCode: rfidCode.trim(),
          deviceId
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'RFID가 등록되었습니다.'
    })
  } catch (error) {
    console.error('RFID 등록 오류:', error)
    return NextResponse.json(
      { success: false, error: 'RFID 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/employees/:id/rfid - RFID 해제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        rfidCode: null,
        rfidRegisteredAt: null
      },
      include: {
        department: {
          include: { hospital: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'RFID가 해제되었습니다.'
    })
  } catch (error) {
    console.error('RFID 해제 오류:', error)
    return NextResponse.json(
      { success: false, error: 'RFID 해제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
