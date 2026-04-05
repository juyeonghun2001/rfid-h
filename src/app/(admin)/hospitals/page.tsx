'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Hospital } from '@/types'

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 모달 상태
  const [showModal, setShowModal] = useState(false)
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null)
  const [hospitalName, setHospitalName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchHospitals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search
      })
      const res = await fetch(`/api/hospitals?${params}`)
      const data = await res.json()
      if (data.success) {
        setHospitals(data.data)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('병원 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchHospitals()
  }, [fetchHospitals])

  const openModal = (hospital?: Hospital) => {
    if (hospital) {
      setEditingHospital(hospital)
      setHospitalName(hospital.name)
    } else {
      setEditingHospital(null)
      setHospitalName('')
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingHospital(null)
    setHospitalName('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingHospital
        ? `/api/hospitals/${editingHospital.id}`
        : '/api/hospitals'
      const method = editingHospital ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: hospitalName })
      })

      const data = await res.json()
      if (data.success) {
        closeModal()
        fetchHospitals()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (hospital: Hospital) => {
    if (!confirm(`'${hospital.name}' 병원을 삭제하시겠습니까?\n하위 부서와 직원도 함께 삭제됩니다.`)) {
      return
    }

    try {
      const res = await fetch(`/api/hospitals/${hospital.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchHospitals()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">병원 관리</h1>
          <p className="text-gray-500 mt-1">병원 정보를 관리합니다</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          + 병원 등록
        </button>
      </div>

      <div className="card mb-6">
        <input
          type="text"
          placeholder="병원명 검색..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="input max-w-xs"
        />
      </div>

      <div className="card">
        {loading ? (
          <p className="text-center text-gray-500 py-8">로딩 중...</p>
        ) : hospitals.length === 0 ? (
          <p className="text-center text-gray-500 py-8">등록된 병원이 없습니다.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>병원명</th>
                  <th>부서 수</th>
                  <th>직원 수</th>
                  <th>등록일</th>
                  <th className="w-32">관리</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map((hospital) => (
                  <tr key={hospital.id}>
                    <td className="font-medium">{hospital.name}</td>
                    <td>{hospital._count?.departments || 0}개</td>
                    <td>{hospital._count?.employees || 0}명</td>
                    <td>{new Date(hospital.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(hospital)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(hospital)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
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

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">
              {editingHospital ? '병원 수정' : '병원 등록'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  병원명
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="input"
                  placeholder="병원명을 입력하세요"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
