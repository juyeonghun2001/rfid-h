'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Employee, Department, Hospital } from '@/types'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterHospitalId, setFilterHospitalId] = useState('')
  const [filterDepartmentId, setFilterDepartmentId] = useState('')
  const [filterRfidStatus, setFilterRfidStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 모달 상태
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formHospitalId, setFormHospitalId] = useState('')
  const [formDepartmentId, setFormDepartmentId] = useState('')
  const [formDepartments, setFormDepartments] = useState<Department[]>([])
  const [employeeName, setEmployeeName] = useState('')
  const [employeePhone, setEmployeePhone] = useState('')
  const [employeeLocation, setEmployeeLocation] = useState('')
  const [employeeUniformType, setEmployeeUniformType] = useState('')
  const [employeeMemo, setEmployeeMemo] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search
      })
      if (filterHospitalId) params.set('hospitalId', filterHospitalId)
      if (filterDepartmentId) params.set('departmentId', filterDepartmentId)
      if (filterRfidStatus) params.set('rfidStatus', filterRfidStatus)

      const res = await fetch(`/api/employees?${params}`)
      const data = await res.json()
      if (data.success) {
        setEmployees(data.data)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('직원 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterHospitalId, filterDepartmentId, filterRfidStatus])

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

  const fetchDepartmentsByHospital = async (hospitalId: string) => {
    if (!hospitalId) {
      setDepartments([])
      return
    }
    try {
      const res = await fetch(`/api/departments?hospitalId=${hospitalId}&all=true`)
      const data = await res.json()
      if (data.success) {
        setDepartments(data.data)
      }
    } catch (error) {
      console.error('부서 목록 조회 오류:', error)
    }
  }

  useEffect(() => {
    fetchHospitals()
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    if (filterHospitalId) {
      fetchDepartmentsByHospital(filterHospitalId)
      setFilterDepartmentId('')
    } else {
      setDepartments([])
      setFilterDepartmentId('')
    }
  }, [filterHospitalId])

  const openModal = async (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee)
      const hospitalId = employee.department?.hospital?.id || ''
      setFormHospitalId(hospitalId)
      if (hospitalId) {
        const res = await fetch(`/api/departments?hospitalId=${hospitalId}&all=true`)
        const data = await res.json()
        if (data.success) {
          setFormDepartments(data.data)
        }
      }
      setFormDepartmentId(employee.departmentId)
      setEmployeeName(employee.name)
      setEmployeePhone(employee.phone || '')
      setEmployeeLocation(employee.location || '')
      setEmployeeUniformType(employee.uniformType || '')
      setEmployeeMemo(employee.memo || '')
    } else {
      setEditingEmployee(null)
      setFormHospitalId('')
      setFormDepartmentId('')
      setFormDepartments([])
      setEmployeeName('')
      setEmployeePhone('')
      setEmployeeLocation('')
      setEmployeeUniformType('')
      setEmployeeMemo('')
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEmployee(null)
  }

  const handleFormHospitalChange = async (hospitalId: string) => {
    setFormHospitalId(hospitalId)
    setFormDepartmentId('')
    if (hospitalId) {
      const res = await fetch(`/api/departments?hospitalId=${hospitalId}&all=true`)
      const data = await res.json()
      if (data.success) {
        setFormDepartments(data.data)
      }
    } else {
      setFormDepartments([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : '/api/employees'
      const method = editingEmployee ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: formDepartmentId,
          name: employeeName,
          phone: employeePhone,
          location: employeeLocation,
          uniformType: employeeUniformType,
          memo: employeeMemo
        })
      })

      const data = await res.json()
      if (data.success) {
        closeModal()
        fetchEmployees()
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

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`'${employee.name}' 직원을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchEmployees()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  const handleRfidRelease = async (employee: Employee) => {
    if (!confirm(`'${employee.name}' 직원의 RFID를 해제하시겠습니까?`)) {
      return
    }

    try {
      const res = await fetch(`/api/employees/${employee.id}/rfid`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchEmployees()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('RFID 해제 오류:', error)
      alert('RFID 해제에 실패했습니다.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">직원 관리</h1>
          <p className="text-gray-500 mt-1">직원 정보를 관리합니다</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          + 직원 등록
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
            value={filterDepartmentId}
            onChange={(e) => { setFilterDepartmentId(e.target.value); setPage(1) }}
            className="select max-w-[200px]"
            disabled={!filterHospitalId}
          >
            <option value="">전체 부서</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={filterRfidStatus}
            onChange={(e) => { setFilterRfidStatus(e.target.value); setPage(1) }}
            className="select max-w-[150px]"
          >
            <option value="">RFID 전체</option>
            <option value="registered">등록됨</option>
            <option value="unregistered">미등록</option>
          </select>
          <input
            type="text"
            placeholder="이름, 연락처, RFID 검색..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input max-w-xs"
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-center text-gray-500 py-8">로딩 중...</p>
        ) : employees.length === 0 ? (
          <p className="text-center text-gray-500 py-8">등록된 직원이 없습니다.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>병원/부서</th>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>위치</th>
                  <th>근무복</th>
                  <th>RFID</th>
                  <th>등록일</th>
                  <th className="w-40">관리</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">{emp.department?.hospital?.name}</div>
                        <div className="text-gray-500">{emp.department?.name}</div>
                      </div>
                    </td>
                    <td className="font-medium">{emp.name}</td>
                    <td>{emp.phone || '-'}</td>
                    <td>{emp.location || '-'}</td>
                    <td>{emp.uniformType || '-'}</td>
                    <td>
                      {emp.rfidCode ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-mono">
                          ✓ {emp.rfidCode}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">미등록</span>
                      )}
                    </td>
                    <td>{new Date(emp.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(emp)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          수정
                        </button>
                        {emp.rfidCode && (
                          <button
                            onClick={() => handleRfidRelease(emp)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm"
                          >
                            RFID해제
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(emp)}
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
              {editingEmployee ? '직원 수정' : '직원 등록'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  병원
                </label>
                <select
                  value={formHospitalId}
                  onChange={(e) => handleFormHospitalChange(e.target.value)}
                  className="select"
                  required
                >
                  <option value="">병원 선택</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부서
                </label>
                <select
                  value={formDepartmentId}
                  onChange={(e) => setFormDepartmentId(e.target.value)}
                  className="select"
                  required
                  disabled={!formHospitalId}
                >
                  <option value="">부서 선택</option>
                  {formDepartments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="input"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처
                </label>
                <input
                  type="text"
                  value={employeePhone}
                  onChange={(e) => setEmployeePhone(e.target.value)}
                  className="input"
                  placeholder="연락처를 입력하세요"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  위치
                </label>
                <input
                  type="text"
                  value={employeeLocation}
                  onChange={(e) => setEmployeeLocation(e.target.value)}
                  className="input"
                  placeholder="위치를 입력하세요"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  근무복 종류
                </label>
                <input
                  type="text"
                  value={employeeUniformType}
                  onChange={(e) => setEmployeeUniformType(e.target.value)}
                  className="input"
                  placeholder="근무복 종류를 입력하세요"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기타
                </label>
                <textarea
                  value={employeeMemo}
                  onChange={(e) => setEmployeeMemo(e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="메모를 입력하세요"
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
