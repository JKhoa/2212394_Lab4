import Link from 'next/link'
import { Post } from '@/types/database'
import { DeletePostButton } from './delete-post-button'

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{post.status}</span>
            </div>
            <div className="flex gap-2">
              <Link href={`/posts/${post.slug}`} className="text-sm">Xem</Link>
              <Link href={`/dashboard/edit/${post.id}`} className="text-sm text-blue-600">Sửa</Link>
              <DeletePostButton postId={post.id} postTitle={post.title} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}