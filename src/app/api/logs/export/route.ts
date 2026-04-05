import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/logs/export - CSV 내보내기
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const departmentId = searchParams.get('departmentId')
    const actionType = searchParams.get('actionType') as 'SCAN' | 'PRINT' | null
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Record<string, unknown> = {}

    if (actionType) {
      where.actionType = actionType
    }

    if (from || to) {
      where.createdAt = {}
      if (from) (where.createdAt as Record<string, Date>).gte = new Date(from)
      if (to) {
        const toDate = new Date(to)
        toDate.setHours(23, 59, 59, 999)
        ;(where.createdAt as Record<string, Date>).lte = toDate
      }
    }

    if (departmentId) {
      where.employee = { departmentId }
    } else if (hospitalId) {
      where.employee = { department: { hospitalId } }
    }

    const logs = await prisma.scanLog.findMany({
      where,
      include: {
        employee: {
          include: {
            department: {
              include: { hospital: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // CSV 생성
    const headers = ['일시', '병원명', '부서명', '직원명', 'RFID', '액션', '디바이스ID']
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString('ko-KR'),
      log.employee.department.hospital.name,
      log.employee.department.name,
      log.employee.name,
      log.rfidCode,
      log.actionType === 'SCAN' ? '스캔' : '출력',
      log.deviceId
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n')

    // BOM 추가 (Excel에서 한글 깨짐 방지)
    const bom = '\uFEFF'
    const csvWithBom = bom + csv

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="scan_logs_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('CSV 내보내기 오류:', error)
    return NextResponse.json(
      { success: false, error: 'CSV 내보내기에 실패했습니다.' },
      { status: 500 }
    )
  }
}
