import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(display_name, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bài viết mới nhất</h1>
      <div className="space-y-6">
        {posts?.map(post => (
          <div key={post.id} className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p>{post.excerpt}</p>
          </div>
        ))}
      </div>
    </main>
  )
}