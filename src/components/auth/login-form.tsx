'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return
      }
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="mt-8 space-y-6">
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}
      <div>
        <button type="button" onClick={handleGitHubLogin} className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">Đăng nhập với GitHub</button>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md" placeholder="email@example.com" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md" placeholder="••••••••" />
        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">Đăng nhập</button>
      </form>
    </div>
  )
}