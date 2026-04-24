# Tài Liệu Prompt Mẫu - Lab 4 Next.js & Supabase

**MSSV:** 2212394

Tài liệu này tập hợp toàn bộ các prompt, lệnh, query, và hướng dẫn sử dụng trong quá trình thực hiện bài thực hành Lab 4.

---

## I. HƯỚNG DẪN CẤU HÌNH SUPABASE

### 1. Tạo Tài Khoản và Project
- Truy cập: https://supabase.com
- Đăng ký tài khoản GitHub (khuyến nghị)
- Tạo project mới
- Lấy `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. File `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## II. SQL QUERIES - TẠO BẢNG VÀ CẤU HÌNH RLS

Chạy các câu lệnh SQL sau trong **SQL Editor** của Supabase Dashboard:

### 2.1 Tạo Bảng Profiles (Hồ Sơ Người Dùng)
```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người có thể xem profiles
CREATE POLICY "Cho phép mọi người xem profiles" ON profiles FOR SELECT USING (true);

-- Policy: User tự tạo profile cho mình
CREATE POLICY "User tự tạo profile cho mình" ON profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- Policy: User tự cập nhật profile của mình
CREATE POLICY "User tự cập nhật profile của mình" ON profiles FOR UPDATE USING ((SELECT auth.uid()) = id);
```

### 2.2 Tạo Bảng Posts (Bài Viết)
```sql
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người có thể xem bài viết đã public
CREATE POLICY "Mọi người có thể xem bài viết đã public" ON posts FOR SELECT USING (status = 'published');

-- Policy: User xem bài viết của mình
CREATE POLICY "User xem bài viết của mình" ON posts FOR SELECT USING ((SELECT auth.uid()) = author_id);

-- Policy: User tự thêm bài viết
CREATE POLICY "User tự thêm bài viết" ON posts FOR INSERT WITH CHECK ((SELECT auth.uid()) = author_id);

-- Policy: User tự cập nhật bài viết
CREATE POLICY "User tự cập nhật bài viết" ON posts FOR UPDATE USING ((SELECT auth.uid()) = author_id);

-- Policy: User tự xóa bài viết
CREATE POLICY "User tự xóa bài viết" ON posts FOR DELETE USING ((SELECT auth.uid()) = author_id);
```

### 2.3 Tạo Bảng Comments (Bình Luận)
```sql
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người xem được comment
CREATE POLICY "Mọi người xem được comment" ON comments FOR SELECT USING (true);

-- Policy: User đăng nhập mới được comment
CREATE POLICY "User đăng nhập mới được comment" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: User sửa comment của mình
CREATE POLICY "User sửa comment của mình" ON comments FOR UPDATE USING ((SELECT auth.uid()) = author_id);

-- Policy: User xóa comment của mình
CREATE POLICY "User xóa comment của mình" ON comments FOR DELETE USING ((SELECT auth.uid()) = author_id);
```

### 2.4 Tạo Trigger Tự Động Đồng Bộ User
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Anonymous'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## III. SETUP PROJECT NEXT.JS

### 3.1 Tạo Project
```bash
# Tạo project Next.js mới với App Router
npx create-next-app@latest ctk46-lab04 --typescript --tailwind --eslint

# Chọn các tùy chọn:
# ✔ TypeScript
# ✔ Tailwind CSS
# ✔ ESLint
# ✔ App Router
```

### 3.2 Cài Đặt Dependencies
```bash
cd ctk46-lab04

# Cài Supabase SDK cho Next.js
npm install @supabase/supabase-js @supabase/ssr

# Cài types cho Supabase (nếu cần)
npm install --save-dev @types/node @types/react
```

### 3.3 Lệnh Chạy Ứng Dụng
```bash
# Chạy Development Server
npm run dev

# Build Production
npm run build

# Preview Production Build
npm start
```

---

## IV. HƯỚNG DẪN SỬ DỤNG GIAO DIỆN

### 4.1 Trang Chủ (Home Page)
- **URL:** http://localhost:3000
- **Chức năng:** Hiển thị danh sách bài viết đã publish
- **Thành phần:** Hero banner, danh sách thẻ bài viết, thông tin tác giả, ngày đăng

### 4.2 Trang Đăng Ký (Register)
- **URL:** http://localhost:3000/register
- **Nhập:** Email & Password
- **Hành động:** Tạo tài khoản mới trong Supabase Auth

### 4.3 Trang Đăng Nhập (Login)
- **URL:** http://localhost:3000/login
- **Nhập:** Email & Password
- **Hành động:** Xác thực tài khoản, lưu session vào cookie

### 4.4 Dashboard Quản Lý (Protected Route)
- **URL:** http://localhost:3000/dashboard
- **Yêu cầu:** Phải đã đăng nhập
- **Chức năng:** Quản lý bài viết của bạn (CRUD)

### 4.5 Tạo Bài Viết Mới
- **URL:** http://localhost:3000/dashboard/new
- **Nhập:** Tiêu đề, Tóm tắt (Excerpt), Nội dung, Trạng thái (Draft/Published)
- **Ghi chú:** Slug tự động được tạo từ tiêu đề

### 4.6 Chỉnh Sửa Bài Viết
- **URL:** http://localhost:3000/dashboard/edit/[id]
- **Chức năng:** Cập nhật thông tin bài viết

### 4.7 Xem Chi Tiết Bài Viết (Public Post)
- **URL:** http://localhost:3000/posts/[slug]
- **Chức năng:** Hiển thị nội dung đầy đủ + phần bình luận
- **Yêu cầu:** Post phải có status = 'published'

### 4.8 Bình Luận (Comments)
- **Vị trí:** Ở cuối trang chi tiết bài viết
- **Yêu cầu:** Phải đăng nhập
- **Chức năng:** Thêm bình luận vào bài viết

---

## V. CẤU HÌNH MIDDLEWARE & SECURITY

### 5.1 Middleware (src/middleware.ts)
```typescript
// Chức năng: Làm mới session auth, bảo vệ route /dashboard
// Tự động kiểm tra token hết hạn và làm mới nếu cần
// Chuyển hướng user chưa đăng nhập ra khỏi /dashboard
```

### 5.2 Row Level Security (RLS)
```
- Profiles: Mọi người xem được, user chỉ sửa được profile của mình
- Posts: Mọi người xem published posts, author chỉ sửa/xóa post của mình
- Comments: Mọi người xem, authenticated user mới post được, author sửa/xóa của mình
```

---

## VI. CẤU TRÚC THƯ MỤC DỰ ÁN

```
ctk46-lab04/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Trang chủ (hiển thị bài published)
│   │   ├── layout.tsx                  # Layout gốc (Header + Footer)
│   │   ├── globals.css                 # Tailwind + global styles
│   │   ├── login/                      # Trang đăng nhập
│   │   ├── register/                   # Trang đăng ký
│   │   ├── dashboard/                  # Dashboard quản lý (protected)
│   │   │   ├── page.tsx               # Danh sách bài viết của user
│   │   │   ├── new/page.tsx           # Tạo bài viết mới
│   │   │   └── edit/[id]/page.tsx     # Chỉnh sửa bài viết
│   │   ├── posts/
│   │   │   └── [slug]/page.tsx        # Chi tiết bài viết (public)
│   │   ├── actions/
│   │   │   └── auth.ts                # Server actions auth (logout)
│   │   └── middleware.ts              # Middleware bảo vệ route
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.tsx             # Header navigation
│   │   ├── dashboard/
│   │   │   ├── post-form.tsx          # Form tạo/sửa post
│   │   │   └── post-list.tsx          # Danh sách post của user
│   │   └── posts/
│   │       ├── comment-form.tsx       # Form thêm comment
│   │       └── comment-list.tsx       # Danh sách comment
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts              # Supabase client (browser)
│   │       ├── server.ts              # Supabase server (Node.js)
│   │       └── middleware.ts          # Auth middleware logic
│   └── types/
│       └── database.ts                # TypeScript interfaces
├── .env.local                         # Supabase credentials (git ignored)
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
└── package.json
```

---

## VII. COMMAND TÓMLẠT THƯỜNG DÙNG

### Development
```bash
npm run dev              # Chạy dev server (localhost:3000)
npm run build            # Build production
npm start                # Chạy production build
npm run lint             # Kiểm tra linting
```

### Git Commands
```bash
git add -A              # Stage tất cả thay đổi
git commit -m "message" # Commit với message
git push                # Push lên remote
git pull                # Pull từ remote
```

### Database (Supabase)
```sql
-- Xem tất cả bảng
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Xem dữ liệu từ bảng
SELECT * FROM profiles;
SELECT * FROM posts;
SELECT * FROM comments;
```

---

## VIII. TESTING & TROUBLESHOOTING

### Test Đăng Ký / Đăng Nhập
1. Mở http://localhost:3000/register
2. Nhập Email & Password
3. Bấm "Đăng ký"
4. Kiểm tra Supabase > Authentication > Users (có user mới)
5. Mở http://localhost:3000/login
6. Nhập cùng Email & Password
7. Bấm "Đăng nhập" → Chuyển hướng tới Dashboard

### Test Tạo Bài Viết
1. Đăng nhập thành công
2. Vào http://localhost:3000/dashboard/new
3. Nhập Tiêu đề, Nội dung, chọn "Xuất bản"
4. Bấm "Tạo bài viết mới"
5. Kiểm tra Supabase > Table Editor > posts (có bài mới)

### Test Xem Bài Viết & Bình Luận
1. Mở http://localhost:3000 (trang chủ)
2. Thấy bài viết vừa tạo → Bấm "Đọc tiếp"
3. Vào chi tiết bài viết (http://localhost:3000/posts/[slug])
4. Thêm bình luận nếu đã đăng nhập
5. Kiểm tra Supabase > Table Editor > comments (có comment mới)

### Lỗi Thường Gặp
| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|------------|----------|
| "Error: NEXT_PUBLIC_SUPABASE_URL is not defined" | Thiếu .env.local | Tạo file .env.local với credentials |
| "Port 3000 is in use" | Port 3000 đã bị chiếm | Đóng ứng dụng khác hoặc dùng port khác |
| "Cannot POST /api/auth/logout" | Middleware/auth action lỗi | Kiểm tra auth.ts trong /actions |
| "Row level security denies access" | RLS policy không cho phép | Kiểm tra INSERT/UPDATE/DELETE policies |

---

## IX. HƯỚNG DẪN NỘP BÀI

### Chuẩn Bị Tài Liệu
✅ README.md (Tiếng Việt, có dấu đầy đủ)
✅ Mã nguồn hoàn chỉnh trên GitHub (https://github.com/JKhoa/2212394_Lab4)
✅ Báo cáo PDF (BaoCao_ThucHanh_Lab4.md → PDF)
✅ File prompt này (PROMPTS_AND_COMMANDS.md)

### Nộp Trên Hệ Thống
1. Tạo thư mục nộp: `Lab4_2212394`
2. Chứa:
   - README.md (hướng dẫn cài đặt)
   - PDF báo cáo (chứa ảnh và giải thích)
   - PROMPTS_AND_COMMANDS.md (tài liệu này)
   - Link GitHub repository

---

## X. TÀI LIỆU THAM KHẢO

### Next.js
- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/building-your-application/rendering/server-components

### Supabase
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database/postgres/row-level-security

### Tailwind CSS
- https://tailwindcss.com/docs

### React
- https://react.dev/
- https://react.dev/reference/react-dom

---

**Ngày cập nhật:** 24/04/2026  
**MSSV:** 2212394
