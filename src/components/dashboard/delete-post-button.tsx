'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function DeletePostButton({ postId, postTitle }: { postId: string, postTitle: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa bài viết "${postTitle}"?`)
    if (!confirmed) return
    setLoading(true)
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
      router.refresh()
    } catch (err) {
      alert('Lỗi khi xóa bài')
    } finally {
      setLoading(false)
    }
  }
  return <button onClick={handleDelete} disabled={loading} className="text-red-600 text-sm">Xóa</button>
}