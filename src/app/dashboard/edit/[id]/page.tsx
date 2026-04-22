import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PostForm } from '@/components/dashboard/post-form'

export default async function EditPost(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: post } = await supabase.from('posts').select('*').eq('id', params.id).eq('author_id', user.id).single()
  if (!post) notFound()
  return <div className="max-w-4xl mx-auto p-4"><h1 className="text-3xl mb-8">Chỉnh sửa</h1><PostForm post={post} /></div>
}