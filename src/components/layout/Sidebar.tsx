'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface CurrentUser {
  username: string
  role: string
  hospitalId: string | null
}

const allMenuItems = [
  { href: '/dashboard', label: '대시보드', icon: '📊', adminOnly: false },
  { href: '/hospitals', label: '병원 관리', icon: '🏥', adminOnly: false },
  { href: '/departments', label: '부서 관리', icon: '🏢', adminOnly: false },
  { href: '/employees', label: '직원 관리', icon: '👥', adminOnly: false },
  { href: '/users', label: '멤버 관리', icon: '👤', adminOnly: true },
  { href: '/logs', label: '이력 조회', icon: '📋', adminOnly: false },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success) {
          setUser(data.data)
        }
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error)
      }
    }
    fetchUser()
  }, [])

  const menuItems = allMenuItems.filter(item => !item.adminOnly || user?.role === 'admin')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">RFID 관리시스템</h1>
        <p className="text-sm text-gray-500 mt-1">hpro.linenstory.kr</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        {user && (
          <div className="px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{user.username}</span>
              <span className="ml-2 text-xs text-gray-400">
                {user.role === 'admin' ? '👑 관리자' : '👤 멤버'}
              </span>
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  )
}
