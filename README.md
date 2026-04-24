
# Báo Cáo Thực Hành Lab 4 - Next.js & Supabase

**Họ và tên:** (Điền tên của bạn)
**MSSV:** 2212394

Đây là repository chứa mã nguồn cho bài thực hành Lab 4 môn Công Nghệ Mới, xây dựng ứng dụng web phân tán với Next.js (App Router) và Supabase. Nó được tạo qua `create-next-app` và lưu trữ tại [github.com/JKhoa/2212394_Lab4](https://github.com/JKhoa/2212394_Lab4).

## 📋 Danh sách Yêu cầu & Hoàn thành

Dưới đây là danh sách các yêu cầu của bài thực hành:

- [x] Tạo project Supabase và lấy credentials 
- [x] Khởi tạo project Next.JS với Supabase packages 
- [x] Tạo đầy đủ 3 bảng: profiles, posts, comments 
- [x] Cấu hình RLS cho tất cả bảng 
- [x] Implement authentication (Email/Password + OAuth) 
- [x] Implement CRUD cho posts 
- [x] Bảo vệ routes cần authentication 
- [x] Commit code lên GitHub 

## 🚀 Tính năng và Setup

- **Front-end:** Next.js (App Router), Tailwind CSS.
- **Backend:** Supabase (PostgreSQL, Auth, RLS).

Bạn cần thiết lập `.env.local` với:
```bash
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

Chạy `npm install` và sau đó `npm run dev` để khởi chạy.

