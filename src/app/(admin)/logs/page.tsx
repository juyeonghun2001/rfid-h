'use client'

import { useEffect, useState, useCallback } from 'react'
import type { ScanLog, Hospital } from '@/types'

export default function LogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterHospitalId, setFilterHospitalId] = useState('')
  const [filterActionType, setFilterActionType] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search
      })
      if (filterHospitalId) params.set('hospitalId', filterHospitalId)
      if (filterActionType) params.set('actionType', filterActionType)
      if (filterFrom) params.set('from', filterFrom)
      if (filterTo) params.set('to', filterTo)

      const res = await fetch(`/api/logs?${params}`)
      const data = await res.json()
      if (data.success) {
        setLogs(data.data)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('로그 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterHospitalId, filterActionType, filterFrom, filterTo])

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals?limit=100')
      const data = await res.json()
      if (data.success) {
        setHospitals(data.data)
      }
    } catch (error) {
      console.error('병원 목록 조회 오류:', error)
    }
  }

  useEffect(() => {
    fetchHospitals()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (filterHospitalId) params.set('hospitalId', filterHospitalId)
    if (filterActionType) params.set('actionType', filterActionType)
    if (filterFrom) params.set('from', filterFrom)
    if (filterTo) params.set('to', filterTo)

    window.location.href = `/api/logs/export?${params}`
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">이력 조회</h1>
          <p className="text-gray-500 mt-1">스캔 및 출력 이력을 조회합니다</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary">
          📥 CSV 내보내기
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterHospitalId}
            onChange={(e) => { setFilterHospitalId(e.target.value); setPage(1) }}
            className="select max-w-[200px]"
          >
            <option value="">전체 병원</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <select
            value={filterActionType}
            onChange={(e) => { setFilterActionType(e.target.value); setPage(1) }}
            className="select max-w-[150px]"
          >
            <option value="">전체 타입</option>
            <option value="SCAN">스캔</option>
            <option value="REGISTER">등록</option>
            <option value="PRINT">출력</option>
          </select>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => { setFilterFrom(e.target.value); setPage(1) }}
            className="input max-w-[160px]"
          />
          <span className="self-center text-gray-400">~</span>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => { setFilterTo(e.target.value); setPage(1) }}
            className="input max-w-[160px]"
          />
          <input
            type="text"
            placeholder="직원명, RFID 검색..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input max-w-xs"
          />
        </div>
      </div>

      <div className="card">
        <div className="mb-4 text-sm text-gray-500">
          총 {total.toLocaleString()}건
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">로딩 중...</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">이력이 없습니다.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>병원/부서</th>
                  <th>직원명</th>
                  <th>RFID</th>
                  <th>액션</th>
                  <th>디바이스</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td>
                      <div className="text-sm">
                        <div>{log.employee?.department?.hospital?.name}</div>
                        <div className="text-gray-500">{log.employee?.department?.name}</div>
                      </div>
                    </td>
                    <td className="font-medium">{log.employee?.name}</td>
                    <td className="font-mono text-sm">{log.rfidCode}</td>
                    <td>
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        log.actionType === 'SCAN'
                          ? 'bg-blue-50 text-blue-700'
                          : log.actionType === 'REGISTER'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {log.actionType === 'SCAN' ? '📡 스캔' : log.actionType === 'REGISTER' ? '🏷️ 등록' : '🖨️ 출력'}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">{log.deviceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  이전
                </button>
                <span className="px-4 py-2 text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
