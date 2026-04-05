'use client'

import { useEffect, useState } from 'react'
import type { DashboardStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('통계 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  const statCards = [
    { label: '전체 병원', value: stats?.totalHospitals || 0, icon: '🏥', color: 'bg-blue-50 text-blue-700' },
    { label: '전체 직원', value: stats?.totalEmployees || 0, icon: '👥', color: 'bg-green-50 text-green-700' },
    { label: 'RFID 등록', value: stats?.rfidRegistered || 0, icon: '✅', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'RFID 미등록', value: stats?.rfidUnregistered || 0, icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
    { label: '오늘 스캔', value: stats?.todayScans || 0, icon: '📡', color: 'bg-purple-50 text-purple-700' },
    { label: '오늘 등록', value: stats?.todayRegisters || 0, icon: '🏷️', color: 'bg-orange-50 text-orange-700' },
    { label: '오늘 출력', value: stats?.todayPrints || 0, icon: '🖨️', color: 'bg-pink-50 text-pink-700' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
        <p className="text-gray-500 mt-1">시스템 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
