'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  username: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // 모달 상태
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setUsername(user.username)
      setRole(user.role as 'admin' | 'member')
      setPassword('')
    } else {
      setEditingUser(null)
      setUsername('')
      setPassword('')
      setRole('member')
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const body: any = {
        username,
        role
      }

      // 신규 생성시 또는 비밀번호 변경시
      if (password) {
        body.password = password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        closeModal()
        fetchUsers()
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

  const handleDelete = async (user: User) => {
    if (!confirm(`'${user.username}' 사용자를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchUsers()
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
          <h1 className="text-2xl font-bold text-gray-800">멤버 관리</h1>
          <p className="text-gray-500 mt-1">시스템 사용자를 관리합니다</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          + 사용자 등록
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-center text-gray-500 py-8">로딩 중...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 py-8">등록된 사용자가 없습니다.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>아이디</th>
                <th>역할</th>
                <th>생성일</th>
                <th>수정일</th>
                <th className="w-40">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.username}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {user.role === 'admin' ? '👑 관리자' : '👤 멤버'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td>{new Date(user.updatedAt).toLocaleDateString('ko-KR')}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
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
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">
              {editingUser ? '사용자 수정' : '사용자 등록'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  아이디
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="아이디를 입력하세요"
                  required
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">아이디는 수정할 수 없습니다.</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 {editingUser && '(변경시에만 입력)'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder={editingUser ? '비밀번호 변경시에만 입력' : '비밀번호를 입력하세요'}
                  required={!editingUser}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                  className="select"
                  required
                >
                  <option value="member">멤버</option>
                  <option value="admin">관리자</option>
                </select>
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
