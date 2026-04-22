import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PostList } from '@/components/dashboard/post-list'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase.from('posts').select('*').eq('author_id', user.id).order('created_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Bài viết của tôi</h1>
        <Link href="/dashboard/new" className="bg-blue-600 text-white px-4 py-2 rounded">+ Thêm mới</Link>
      </div>
      {posts && posts.length > 0 ? <PostList posts={posts} /> : (<p>Bạn chưa có bài viết nào.</p>)}
    </main>
  )
}