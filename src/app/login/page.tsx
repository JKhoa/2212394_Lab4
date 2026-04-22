import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Đăng nhập</h2>
        </div>
        {params?.message && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{params.message}</div>}
        <LoginForm />
      </div>
    </div>
  )
}