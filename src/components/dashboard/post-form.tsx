'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Post, PostStatus } from '@/types/database'

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!post
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [status, setStatus] = useState<PostStatus>(post?.status || 'draft')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setError('Chưa đăng nhập')
      const postData = { title, content, excerpt, status, author_id: user.id, published_at: status === 'published' ? new Date().toISOString() : null }
      if (isEditing) {
        const { error } = await supabase.from('posts').update(postData).eq('id', post.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('posts').insert(postData)
        if (error) throw error
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500">{error}</p>}
      <input placeholder="Tiêu đề" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-2" />
      <input placeholder="Tóm tắt" value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full border p-2" />
      <textarea placeholder="Nội dung" rows={10} value={content} onChange={e=>setContent(e.target.value)} className="w-full border p-2" />
      <select value={status} onChange={e=>setStatus(e.target.value as PostStatus)} className="w-full border p-2">
        <option value="draft">Bản nháp</option>
        <option value="published">Xuất bản</option>
      </select>
      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white">{isEditing ? 'Cập nhật' : 'Tạo mới'}</button>
    </form>
  )
}