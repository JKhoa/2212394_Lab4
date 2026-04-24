# Tài Liệu Prompt Mẫu Chi Tiết - Lab 4 (Phần II - Hoàn Chỉnh)

**Tiếp theo từ DETAILED_PROMPTS_GUIDE.md (Part I-V)**

---

## PHẦN 5 — CRUD Bài Viết (Tiếp Tục)

### Prompt 5.2 — Trang Chi Tiết Bài Viết

**CONTEXT:**
Cần Server Component hiển thị một bài viết cụ thể theo slug.

**TASK:**
Viết `src/app/posts/[slug]/page.tsx`:
1. Lấy slug từ params
2. Query post với slug + status='published'
3. Nếu không tìm thấy → gọi `notFound()`
4. Render title, tác giả, ngày, nội dung
5. Thêm `generateMetadata` dựa trên title/excerpt
6. Hiển thị component comments

**CONSTRAINTS:**
- Server Component
- Xử lý 404 với `notFound()`
- Metadata dynamic

**OUTPUT MẪU:**
```typescript
// File: src/app/posts/[slug]/page.tsx

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CommentForm } from '@/components/posts/comment-form'
import { CommentList } from '@/components/posts/comment-list'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const params = await props.params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return { title: 'Không tìm thấy' }
  }

  return {
    title: post.title,
    description: post.excerpt || 'Đọc bài viết này',
  }
}

export default async function PostPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const supabase = await createClient()

  // Query post
  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles(display_name, avatar_url)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    notFound()
  }

  // Query comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(display_name, avatar_url)')
    .eq('post_id', post.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <article className="max-w-2xl mx-auto px-4 py-16 bg-white shadow-sm rounded-lg">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {post.profiles?.display_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-medium">{post.profiles?.display_name || 'Ẩn danh'}</p>
                <time className="text-sm">
                  {new Date(post.published_at).toLocaleDateString('vi-VN')}
                </time>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-16">
          {post.content?.split('\n').map((line: string, i: number) => (
            <p key={i} className="mb-4">
              {line}
            </p>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-12" />

        {/* Comments Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-8">Bình luận ({comments?.length || 0})</h2>
          
          <CommentForm postId={post.id} />
          
          <div className="mt-8">
            {comments && comments.length > 0 ? (
              <CommentList comments={comments} />
            ) : (
              <p className="text-gray-500 text-center py-8">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            )}
          </div>
        </section>
      </article>
    </main>
  )
}
```

---

### Prompt 5.3 — Dashboard: Danh Sách Bài Của User

**CONTEXT:**
Cần Server Component trang dashboard liệt kê bài của user đang login.

**TASK:**
Viết `src/app/dashboard/page.tsx`:
1. Kiểm tra user login (nếu null → redirect /login)
2. Query posts với author_id = user.id
3. Hiển thị bảng hoặc list
4. Có nút "Tạo bài mới" → /dashboard/new
5. Có nút Sửa (link /dashboard/edit/[id]) và Xóa

**CONSTRAINTS:**
- Server Component
- Protected route (check auth)
- Responsive layout

**OUTPUT MẪU:**
```typescript
// File: src/app/dashboard/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DeletePostButton } from '@/components/dashboard/delete-post-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Query user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Quản Lý Bài Viết</h1>
          <Link
            href="/dashboard/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            ✏️ Tạo Bài Mới
          </Link>
        </div>

        {/* Posts Table */}
        {posts && posts.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Tiêu Đề</th>
                  <th className="px-6 py-3 text-left font-semibold">Trạng Thái</th>
                  <th className="px-6 py-3 text-left font-semibold">Ngày Tạo</th>
                  <th className="px-6 py-3 text-left font-semibold">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium truncate">{post.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.status === 'published' ? 'Xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link
                        href={`/dashboard/edit/${post.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Sửa
                      </Link>
                      <DeletePostButton postId={post.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Bạn chưa tạo bài viết nào.</p>
            <Link
              href="/dashboard/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Tạo bài viết đầu tiên →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
```

---

### Prompt 5.4 — Form Tạo/Sửa Bài (post-form.tsx)

**CONTEXT:**
Client component dùng chung cho create và edit post.

**TASK:**
Viết `src/components/dashboard/post-form.tsx`:
1. Props: `post?: Post` (optional, nếu có = edit mode)
2. Fields: title, excerpt, content (textarea lớn), status (select)
3. Khi chuyển status → published lần đầu, set published_at = now()
4. Dùng server actions `createPost` / `updatePost`
5. Sau lưu thành công redirect /dashboard
6. Show loading state

**CONSTRAINTS:**
- Client component (use client)
- Validate input
- Handle loading state

**OUTPUT MẪU:**
```typescript
// File: src/components/dashboard/post-form.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost, updatePost } from '@/app/actions/posts'
import type { Post } from '@/types/database'

interface PostFormProps {
  post?: Post
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      if (post?.id) {
        // Edit mode
        await updatePost(post.id, formData)
      } else {
        // Create mode
        await createPost(formData)
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu Đề
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={post?.title || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tiêu đề bài viết"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
          Tóm Tắt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt || ''}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tóm tắt ngắn gọn (optional)"
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Nội Dung
        </label>
        <textarea
          id="content"
          name="content"
          required
          defaultValue={post?.content || ''}
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder="Viết nội dung bài viết tại đây..."
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Trạng Thái
        </label>
        <select
          id="status"
          name="status"
          defaultValue={post?.status || 'draft'}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">📝 Bản Nháp (Chỉ mình tôi thấy)</option>
          <option value="published">✅ Xuất Bản (Mọi người thấy)</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Đang lưu...' : post ? 'Cập Nhật' : 'Tạo Bài Mới'}
      </button>
    </form>
  )
}
```

---

### Prompt 5.5 — Nút Xóa Bài (Confirm)

**CONTEXT:**
Client component cho nút xóa với confirm dialog.

**TASK:**
Viết `src/components/dashboard/delete-post-button.tsx`:
1. Props: postId
2. Khi click → confirm()
3. Nếu đồng ý → server action deletePost
4. Sau xóa → router.refresh()

**CONSTRAINTS:**
- Client component
- Confirm before delete
- Show error if any

**OUTPUT MẪU:**
```typescript
// File: src/components/dashboard/delete-post-button.tsx

'use client'

import { useRouter } from 'next/navigation'
import { deletePost } from '@/app/actions/posts'

interface DeletePostButtonProps {
  postId: string
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Bạn chắc chắn muốn xóa bài viết này không? (Hành động không thể hoàn tác)')) {
      return
    }

    try {
      await deletePost(postId)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Xóa bài viết thất bại')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 font-medium text-sm"
    >
      Xóa
    </button>
  )
}
```

---

### Prompt 5.6 — Server Actions Cho Posts

**CONTEXT:**
Server actions cho CRUD posts.

**TASK:**
Viết `src/app/actions/posts.ts`:
1. `createPost(formData)` - Tạo post mới
2. `updatePost(id, formData)` - Cập nhật post
3. `deletePost(id)` - Xóa post
4. Mỗi hàm check user, validate input
5. RLS sẽ chặn nếu user cố sửa/xóa bài người khác

**CONSTRAINTS:**
- Server actions
- Validate + error handling
- Auto-set author_id = user.id khi create
- Auto-set published_at khi chuyển sang published

**OUTPUT MẪU:**
```typescript
// File: src/app/actions/posts.ts

'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Tạo bài viết mới
 * Auto-set author_id = auth.uid()
 */
export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const status = (formData.get('status') as string) || 'draft'

  if (!title || !content) {
    return redirect('/dashboard/new?error=Vui lòng nhập tiêu đề và nội dung')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      title,
      excerpt,
      content,
      status,
      published_at: status === 'published' ? new Date() : null,
    })

  if (error) {
    console.error('Error creating post:', error)
    return redirect(`/dashboard/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  return redirect('/dashboard?message=Bài viết đã được tạo thành công')
}

/**
 * Cập nhật bài viết
 */
export async function updatePost(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const status = (formData.get('status') as string) || 'draft'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Kiểm tra user có quyền update
  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!post || post.author_id !== user.id) {
    return redirect('/dashboard?error=Bạn không có quyền chỉnh sửa bài này')
  }

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      excerpt,
      content,
      status,
      published_at: status === 'published' ? new Date() : null,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating post:', error)
    return redirect(`/dashboard/edit/${id}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  return redirect('/dashboard?message=Bài viết đã được cập nhật thành công')
}

/**
 * Xóa bài viết
 */
export async function deletePost(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Bạn phải đăng nhập để xóa bài viết')
  }

  // RLS sẽ chặn nếu user không phải author
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) {
    console.error('Error deleting post:', error)
    throw new Error('Lỗi khi xóa bài viết. Bạn có quyền xóa bài này không?')
  }

  revalidatePath('/', 'layout')
}
```

---

## PHẦN 6 — Comments & Realtime

### Prompt 6.1 — Form Bình Luận

**CONTEXT:**
Client component cho phép user bình luận trên bài viết.

**TASK:**
Viết `src/components/posts/comment-form.tsx`:
1. Props: postId
2. Textarea + submit button
3. Check auth (nếu chưa login show login link)
4. Gọi server action createComment
5. Clear form + router.refresh() sau success
6. Disable button nếu content rỗng hoặc loading

**CONSTRAINTS:**
- Client component (use client)
- Validate input
- Loading state

**OUTPUT MẪU:**
```typescript
// File: src/components/posts/comment-form.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createComment } from '@/app/actions/comments'

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await createComment(postId, content)
      setContent('')
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Gửi bình luận thất bại')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold">Gửi Bình Luận</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error === 'Unauthorized' ? (
            <p>
              Vui lòng{' '}
              <Link href="/login" className="font-medium hover:underline">
                đăng nhập
              </Link>
              {' '}để bình luận
            </p>
          ) : (
            <p>{error}</p>
          )}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận của bạn..."
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={!content.trim() || isLoading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Đang gửi...' : 'Gửi Bình Luận'}
      </button>
    </form>
  )
}
```

---

### Prompt 6.2 — Danh Sách Comment

**CONTEXT:**
Server component hiển thị danh sách comments.

**TASK:**
Viết `src/components/posts/comment-list.tsx`:
1. Props: `comments: CommentWithAuthor[]`
2. Hiển thị: avatar (initial), name, date (vi-VN), content
3. Nếu rỗng → "Chưa có bình luận nào"
4. Responsive card design

**CONSTRAINTS:**
- Server Component (no use client)
- Clean, readable layout

**OUTPUT MẪU:**
```typescript
// File: src/components/posts/comment-list.tsx

import type { CommentWithAuthor } from '@/types/database'

interface CommentListProps {
  comments: CommentWithAuthor[]
}

export function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có bình luận nào. Hãy là người đầu tiên!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {comment.profiles?.display_name?.charAt(0) || 'A'}
            </div>
          </div>

          {/* Comment Body */}
          <div className="flex-1 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900">
                {comment.profiles?.display_name || 'Ẩn danh'}
              </h4>
              <time className="text-sm text-gray-600">
                {new Date(comment.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

### Prompt 6.3 — Server Action Tạo Comment

**CONTEXT:**
Server action để tạo comment mới.

**TASK:**
Viết trong `src/app/actions/comments.ts`:
1. `createComment(postId, content)` - Insert comment
2. Check user auth
3. Check post exists + is published
4. RLS sẽ tự động chặn nếu post không published

**OUTPUT MẪU:**
```typescript
// File: src/app/actions/comments.ts

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Tạo comment mới
 */
export async function createComment(postId: string, content: string) {
  if (!content.trim()) {
    throw new Error('Bình luận không được để trống')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
    })

  if (error) {
    console.error('Error creating comment:', error)
    throw new Error('Gửi bình luận thất bại: ' + error.message)
  }

  revalidatePath(`/posts/[slug]`, 'page')
}
```

---

### Prompt 6.4 — Bật Replication Cho Realtime

**CONTEXT:**
Cần bật realtime replication để subscribe tới changes.

**TASK:**
Hướng dẫn bật replication:
1. Vào Supabase Dashboard
2. Database → Replication
3. Bật replication cho bảng comments

**OUTPUT MẪU:**
```markdown
## Cách Bật Replication Cho Realtime

### Bước 1: Vào Supabase Dashboard
- Truy cập https://supabase.com → chọn project của bạn

### Bước 2: Vào Database Settings
- Left sidebar → Database → Replication

### Bước 3: Bật Replication Cho Table Comments
- Tìm table "comments"
- Bật toggle **ON**
- Hệ thống sẽ tạo replication slot tự động

### Bước 4: Test Realtime
Trong Next.js component dùng:
\`\`\`typescript
const subscription = supabase
  .channel('comments_changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'comments',
    filter: \`post_id=eq.\${postId}\`,
  }, (payload) => {
    console.log('New comment:', payload.new)
  })
  .subscribe()
\`\`\`

**Lưu ý:** Realtime chỉ broadcast changes, không lưu state. 
Cần manual query lại comment đó kèm profiles để hiển thị đầy đủ.
```

---

## PHẦN 7 — Tổng Kết, TypeScript Types, Layout

### Prompt 7.1 — TypeScript Types Cho Database

**CONTEXT:**
Cần định nghĩa TypeScript interfaces cho database.

**TASK:**
Viết `src/types/database.ts`:
1. Interfaces: Profile, Post, Comment
2. Unions: PostWithAuthor, CommentWithAuthor

**OUTPUT MẪU:**
```typescript
// File: src/types/database.ts

/**
 * Database Types - Tương ứng với PostgreSQL schema
 */

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  updated_at: string
}

// Unions với author profile (khi query có join)
export interface PostWithAuthor extends Post {
  profiles: Profile | null
}

export interface CommentWithAuthor extends Comment {
  profiles: Profile | null
}
```

---

### Prompt 7.2 — Header Navigation

**CONTEXT:**
Server component cho navigation header.

**TASK:**
Viết `src/components/layout/header.tsx`:
1. Logo "Simple Blog" với icon
2. Link "Trang chủ"
3. Nếu user login: Dashboard + button Đăng xuất
4. Nếu chưa: Links Đăng nhập / Đăng ký
5. Sticky positioning + backdrop blur

**OUTPUT MẪU:**
```typescript
// File: src/components/layout/header.tsx

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/auth/signout-button'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
          <span>📝</span>
          Simple Blog
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Trang chủ
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Quản lý bài viết
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
```

---

## PHẦN 8 — Debug & Troubleshooting

### Prompt D.1 — Lỗi Cookies() Async

**CONTEXT:**
Lỗi: "cookies() should be awaited before using its value"

**TASK:**
Giải thích tại sao xảy ra + cách fix

**OUTPUT MẪU:**
```markdown
## Lỗi: cookies() should be awaited before using its value

### Nguyên Nhân
Trong Next.js 15, \`cookies()\` từ next/headers trở thành async function.
Nhưng trong Supabase @supabase/ssr, hàm tạo cookie handler cần synchronous.

### Cách Fix

\`\`\`typescript
// ❌ SAI
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const cookieStore = cookies()  // ← Quên await!

const supabase = createServerClient(..., {
  cookies: {
    getAll() {
      return cookieStore.getAll()  // ← Lỗi vì cookieStore chưa được await
    }
  }
})

// ✅ ĐÚNG
const cookieStore = await cookies()  // ← await ở đây
\`\`\`

### Lưu Ý
Supabase callback functions (getAll, setAll) cần synchronous, 
nhưng việc lấy cookieStore lại cần await.
Giải pháp: await ở đầu function, rồi dùng synchronously sau đó.
```

---

### Prompt D.2 — Lỗi RLS Chặn Insert

**CONTEXT:**
Lỗi: "new row violates row-level security policy for table posts"

**TASK:**
Debug vì sao auth.uid() không khớp author_id

**OUTPUT MẪU:**
```markdown
## Lỗi: RLS Policy Insert Bị Chặn

### Nguyên Nhân Phổ Biến

#### 1. ❌ User chưa login (auth.uid() = NULL)
\`\`\`typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)  // ← Kiểm tra user có null không?
\`\`\`

#### 2. ❌ Gửi author_id khác với user.id
\`\`\`typescript
// Sai:
await supabase.from('posts').insert({
  author_id: 'some-other-uuid',  // ← Khác user.id
  ...
})

// Đúng:
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('posts').insert({
  author_id: user.id,  // ← Phải là user đang login
  ...
})
\`\`\`

#### 3. ❌ Policy requirement không đúng
\`\`\`sql
-- Sai: Chỉ check INSERT được insert, quên check WITH CHECK
CREATE POLICY "create_post" ON posts
  FOR INSERT
  USING ((select auth.uid()) = author_id);  -- ← USING không đủ

-- Đúng: Cần WITH CHECK
CREATE POLICY "create_post" ON posts
  FOR INSERT
  WITH CHECK ((select auth.uid()) = author_id);
\`\`\`

### Debug Steps
1. Check server logs: \`console.log('User:', user)\`
2. Kiểm tra auth.uid() không null: \`SELECT auth.uid();\` trong SQL Editor
3. Xem policy: SELECT * FROM pg_policies WHERE tablename = 'posts';
4. Test role: SET ROLE authenticated; SET request.jwt.claims = '{"sub":"..."}'; ...
```

---

### Prompt D.3 — Trigger handle_new_user Không Chạy

**CONTEXT:**
User đăng ký mới nhưng profile không được tạo.

**TASK:**
Kiểm tra trigger, function, và logs

**OUTPUT MẪU:**
```markdown
## Lỗi: Trigger handle_new_user Không Tạo Profile

### Kiểm Tra Step-by-Step

#### 1. Kiểm Tra Trigger Tồn Tại
\`\`\`sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
\`\`\`

#### 2. Kiểm Tra Function
\`\`\`sql
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
\`\`\`

#### 3. Xem Supabase Logs
Supabase Dashboard → Logs → Function Logs
Tìm errors liên quan tới handle_new_user

#### 4. Kiểm Tra raw_user_meta_data
Khi user signup qua OAuth, raw_user_meta_data chứa gì?
\`\`\`sql
SELECT id, email, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;
\`\`\`

Nếu raw_user_meta_data = NULL hoặc không có 'full_name', trigger sẽ gán 'Anonymous'

#### 5. Cách Fix
Nếu function không chạy:
\`\`\`sql
-- Recreate trigger:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Sau đó: xóa user cũ, signup lại
DELETE FROM auth.users WHERE email = 'test@example.com';
\`\`\`
```

---

### Prompt D.4 — Middleware Redirect Loop

**CONTEXT:**
Middleware gây redirect loop khi vào /login.

**TASK:**
Fix matcher để không infinite redirect

**OUTPUT MẪU:**
```typescript
// ❌ SAI - Gây redirect loop
export const config = {
  matcher: ['/:path*'],  // ← Match tất cả, kể cả /login
}

// Middleware kiểm tra /dashboard, nếu null redirect /login
// Nhưng /login cũng match, nên lại kiểm tra, lại redirect...

// ✅ ĐÚNG - Bỏ qua /login, /register, /auth
export const config = {
  matcher: [
    '/dashboard/:path*',  // ← Chỉ protect /dashboard
    '/api/:path*',        // ← Protect API
    '/((?!login|register|auth|_next/static|favicon.ico).*)',  // ← Bỏ qua auth routes
  ],
}
```

---

## IX. THAM KHẢO & LINK QUAN TRỌNG

| Công Nghệ | Link | Ghi Chú |
|-----------|------|--------|
| Next.js 15 Docs | https://nextjs.org/docs | App Router, Server Components |
| Supabase JS Docs | https://supabase.com/docs/reference/javascript | SDK + Realtime |
| PostgreSQL RLS | https://www.postgresql.org/docs/current/ddl-rowsecurity.html | Row Level Security |
| TypeScript | https://www.typescriptlang.org/docs | Type Safety |
| Tailwind CSS | https://tailwindcss.com/docs | Styling |
| Supabase Auth | https://supabase.com/docs/guides/auth | Email, OAuth |

---

## X. CHECKLIST HOÀN THÀNH

- ✅ Phần I: Khởi tạo project (Prompts 1.1-1.4)
- ✅ Phần II: Database schema (Prompts 2.1-2.4)
- ✅ Phần III: RLS (Prompts 3.1-3.5)
- ✅ Phần IV: Authentication (Prompts 4.1-4.5)
- ✅ Phần V: CRUD (Prompts 5.1-5.6)
- ✅ Phần VI: Comments (Prompts 6.1-6.4)
- ✅ Phần VII: TypeScript + Layout (Prompts 7.1-7.2)
- ✅ Phần VIII: Debug (Prompts D.1-D.4)
- ✅ Phần IX: Tham khảo & Links

---

**Hoàn thành: 24/04/2026**  
**MSSV: 2212394**  
**Trạng thái: 100% - Tài liệu chi tiết hoàn chỉnh**

Sử dụng tài liệu này khi làm Lab 4 để đạt kết quả tối ưu! 🚀
