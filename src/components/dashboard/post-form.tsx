'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Post, PostStatus } from '@/types/database'

function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Math.random().toString(36).substring(2, 6);
}

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
    setError(null)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return setError('Chưa đăng nhập')
      
      const slug = post?.slug || createSlug(title)
      
      const postData = { 
        title, 
        content, 
        excerpt, 
        status, 
        author_id: user.id, 
        slug,
        published_at: status === 'published' ? new Date().toISOString() : null 
      }
      
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
      {error && <p className="text-red-500 font-medium p-3 bg-red-50 rounded">{error}</p>}
      <div>
        <label className="block mb-2 font-medium text-gray-700">Tiêu đề bài viết</label>
        <input placeholder="Nhập tiêu đề..." required value={title} onChange={e=>setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 bg-white" />
      </div>
      <div>
        <label className="block mb-2 font-medium text-gray-700">Tóm tắt (Excerpt)</label>
        <input placeholder="Mô tả ngắn..." value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 bg-white" />
      </div>
      <div>
        <label className="block mb-2 font-medium text-gray-700">Nội dung</label>
        <textarea placeholder="Viết nội dung bài viết của bạn tại đây..." rows={10} value={content} onChange={e=>setContent(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 bg-white" />
      </div>
      <div>
        <label className="block mb-2 font-medium text-gray-700">Trạng thái</label>
        <select value={status} onChange={e=>setStatus(e.target.value as PostStatus)} className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 bg-white">
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:opacity-50">
        {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo bài viết mới')}
      </button>
    </form>
  )
}

