# Tài Liệu Prompt Mẫu Chi Tiết - Lab 4 Next.js & Supabase

**MSSV:** 2212394  
**Ngày cập nhật:** 24/04/2026

Tài liệu này chứa toàn bộ các prompt mẫu được cấu trúc theo công thức 4 phần (Context, Task, Constraints, Output) để hướng dẫn làm bài Lab 4 một cách chi tiết và hệ thống.

---

## Công Thức Prompt - 4 Phần

Mỗi prompt được thiết kế theo cấu trúc sau:

```
🔹 CONTEXT (Bối cảnh):
   Nêu rõ công nghệ đang dùng: Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase @supabase/ssr

🔹 TASK (Nhiệm vụ):
   Yêu cầu cụ thể: viết SQL, component, server action, sửa lỗi...

🔹 CONSTRAINTS (Ràng buộc):
   Quy ước code: RLS bật sẵn, Server Component mặc định, chỉ "use client" khi cần, chú thích tiếng Việt

🔹 OUTPUT (Đầu ra):
   Trả về: code đầy đủ + đường dẫn file + chú thích tiếng Việt
```

---

## I. PHẦN 1 — Giới Thiệu Supabase & Khởi Tạo Project

### Prompt 1.1 — Giải Thích BaaS và So Sánh Supabase

**CONTEXT:**
Đang học về Backend-as-a-Service và Supabase trong môn Công Nghệ Mới (Lab 4).

**TASK:**
Giải thích ngắn gọn khái niệm Backend-as-a-Service (BaaS) là gì, và so sánh Supabase với Firebase, Appwrite, PocketBase theo các tiêu chí:
- Database
- Open source
- Self-host capability
- Realtime features
- Authentication methods
- Storage service
- Free tier

**CONSTRAINTS:**
- Trình bày dưới dạng bảng so sánh rõ ràng
- Dùng tiếng Việt có dấu đầy đủ
- Phù hợp đưa vào báo cáo Lab 4

**OUTPUT MẪU:**
```markdown
## BaaS là gì?
Backend-as-a-Service (BaaS) là nền tảng cung cấp các dịch vụ backend được quản lý sẵn 
như database, auth, storage, realtime, mà không cần developer viết backend từ đầu.

## Bảng So Sánh
| Tiêu chí | Supabase | Firebase | Appwrite | PocketBase |
|----------|----------|----------|----------|-----------|
| Database | PostgreSQL | Firestore/Realtime DB | MongoDB | SQLite |
| Open Source | ✅ Có | ❌ Không | ✅ Có | ✅ Có |
| Self-host | ✅ Có | ❌ Không | ✅ Có | ✅ Có |
| Realtime | ✅ Broadcast, Presence | ✅ Có | ✅ Có | ❌ Không |
| Auth | Email, OAuth, SAML | Email, Phone, OAuth | Email, Phone, OAuth | Email, Password |
| Storage | ✅ S3 compatible | ✅ Cloud Storage | ✅ Có | ❌ Không |
| Free Tier | 500MB DB, 1GB bandwidth | 100 concurrent connections | 1GB data | Unlimited (self-host) |

## Tại sao chọn Supabase cho Lab 4?
- PostgreSQL là database relational, phù hợp học RLS
- Có auth, realtime, storage trong 1 nền tảng
- Open source, có thể self-host sau này
- Free tier đủ cho dự án lab 4
```

---

### Prompt 1.2 — Khởi Tạo Project Next.js + Supabase

**CONTEXT:**
Cần khởi tạo project Next.js mới với Next.js 15, TypeScript, Tailwind CSS, Supabase SDKs.

**TASK:**
Hướng dẫn các lệnh terminal để:
1. Tạo project Next.js mới tên `ctk46-lab04`
2. Chọn các options: TypeScript, Tailwind, ESLint, App Router, Turbopack, src/ directory
3. Cài thêm packages Supabase: `@supabase/supabase-js` và `@supabase/ssr`
4. Giải thích vai trò của mỗi package

**CONSTRAINTS:**
- Sử dụng `create-next-app` phiên bản mới nhất
- Đảm bảo Turbopack được enable
- Giải thích rõ tại sao cần 2 packages Supabase

**OUTPUT MẪU:**
```bash
# 1. Tạo project Next.js
npx create-next-app@latest ctk46-lab04 \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --turbopack \
  --src-dir

# Khi hỏi "Would you like to use ESLint?" → Yes
# Khi hỏi "Would you like to use Tailwind CSS?" → Yes
# Khi hỏi "Would you like your code inside a `src/` directory?" → Yes
# Khi hỏi "Would you like to use App Router?" → Yes
# Khi hỏi "Would you like to use Turbopack for next dev?" → Yes

# 2. Vào thư mục project
cd ctk46-lab04

# 3. Cài Supabase packages
npm install @supabase/supabase-js @supabase/ssr

# 4. Kiểm tra package.json
cat package.json | grep supabase
```

**Giải thích từng package:**
- `@supabase/supabase-js`: Client SDK chính để query database, auth, storage từ browser hoặc server
- `@supabase/ssr`: Wrapper đặc biệt cho Next.js giúp quản lý cookies và sessions an toàn, cần dùng trong App Router

---

### Prompt 1.3 — Tạo Supabase Client Utilities

**CONTEXT:**
Dự án Next.js 15 với App Router, cần 3 file để quản lý Supabase client (browser, server, middleware).

**TASK:**
Viết 3 file TypeScript đầy đủ:
1. `src/lib/supabase/client.ts` - Supabase client dùng trong browser (use client components)
2. `src/lib/supabase/server.ts` - Supabase server client với cookies của Next.js 15
3. `src/lib/supabase/middleware.ts` - updateSession để refresh JWT token

**CONSTRAINTS:**
- Sử dụng API mới của `@supabase/ssr`, **không** dùng `@supabase/auth-helpers-nextjs` cũ
- Thêm chú thích tiếng Việt chi tiết
- Xử lý cookies theo cách Next.js 15 (async)

**OUTPUT MẪU:**

**File: src/lib/supabase/client.ts**
```typescript
/**
 * Supabase Client - dùng trong "use client" components
 * Kết nối từ browser, sử dụng NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY
 * Có thể truy cập lên auth, database, realtime subscriptions
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: src/lib/supabase/server.ts**
```typescript
/**
 * Supabase Server Client - dùng trong Server Components
 * Có thể đọc cookies từ request (cần async/await)
 * Sử dụng cho server-side queries, auth checks, và hành động bảo vệ
 */

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**File: src/lib/supabase/middleware.ts**
```typescript
/**
 * Middleware helper - updateSession
 * Chạy trong middleware.ts để làm mới session JWT khi nó sắp hết hạn
 * Giúp user không bị logout đột ngột khi làm việc
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Gọi getUser() để làm mới session JWT
  await supabase.auth.getUser()

  return supabaseResponse
}
```

---

### Prompt 1.4 — Cấu Hình Biến Môi Trường

**CONTEXT:**
Cần hiểu tại sao biến môi trường Supabase phải có prefix `NEXT_PUBLIC_` và liệu có an toàn không.

**TASK:**
1. Giải thích vì sao `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` phải có prefix
2. Giải thích liệu có an toàn khi công khai ANON_KEY
3. Viết mẫu file `.env.local`
4. Nhắc thêm quy tắc `.gitignore`

**CONSTRAINTS:**
- Trình bày rõ ràng, không nhầm lẫn giữa ANON_KEY và SECRET_KEY
- Dùng tiếng Việt

**OUTPUT MẪU:**
```markdown
## Tại sao cần NEXT_PUBLIC_ prefix?

Trong Next.js, mặc định biến môi trường (env variables) **chỉ** chạy server-side.
Để dùng trong browser (React client components), cần thêm prefix `NEXT_PUBLIC_`.

```

**File: .env.local**
```env
# Supabase Project Credentials
# Lấy từ Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Không commit file này lên GitHub!
# Nhớ thêm .env.local vào .gitignore
```

**File: .gitignore** (thêm nếu chưa có)
```gitignore
# Environment variables - KHÔNG COMMIT LÊN GITHUB
.env.local
.env.*.local

# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production build
.next/
out/
dist/

# Misc
.DS_Store
*.pem

# IDE
.vscode/
.idea/
*.swp
*.swo
```

---

## II. PHẦN 2 — Database Design & Schema

### Prompt 2.1 — Thiết Kế Schema Từ Yêu Cầu Chức Năng

**CONTEXT:**
Cần thiết kế database cho ứng dụng blog simple.

**TASK:**
1. Liệt kê các chức năng cần: user signup/login, profile, CRUD post, draft/published, comment
2. Vẽ ERD dạng text (ASCII art hoặc Mermaid)
3. Đề xuất 3 bảng: `profiles`, `posts`, `comments` với các fields, khóa ngoại, index

**CONSTRAINTS:**
- Dùng PostgreSQL relational model
- Chú thích tiếng Việt
- Tối ưu hóa queries và security

**OUTPUT MẪU:**
```markdown
## Chức Năng Cần Thiết
1. ✅ User đăng ký / đăng nhập (dùng auth.users của Supabase)
2. ✅ Mỗi user có profile (display_name, avatar_url)
3. ✅ User tạo bài viết (CRUD), chỉ có thể edit/delete bài của mình
4. ✅ Bài viết có trạng thái draft (chỉ author thấy) hoặc published (mọi người thấy)
5. ✅ Visitor xem bài published
6. ✅ User bình luận vào bài viết

## ERD (Entity Relationship Diagram)

\`\`\`
┌─────────────────────┐
│   auth.users        │  ← Built-in của Supabase
│  (PostgreSQL auth)  │
│                     │
│ - id (UUID)         │
│ - email             │
│ - created_at        │
└──────────┬──────────┘
           │ (1:1)
           │ Foreign Key id
           │
           ▼
┌─────────────────────┐
│     profiles        │
│                     │
│ - id (UUID, PK)     │
│ - display_name      │
│ - avatar_url        │
│ - created_at        │
└──────────┬──────────┘
           │ (1:N)
           │
      ┌────┴───────┬─────────────┐
      │            │             │
      ▼            ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  posts   │  │comments  │  │  ...     │
└──────────┘  └──────────┘  └──────────┘

\`\`\`

## Bảng profiles (Hồ sơ người dùng)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID, PK | References auth.users(id) ON DELETE CASCADE |
| display_name | TEXT | Tên hiển thị (ví dụ: "Nguyễn Văn A") |
| avatar_url | TEXT | URL ảnh đại diện từ OAuth hoặc upload |
| created_at | TIMESTAMP | Thời gian tạo profile (auto fill) |
| updated_at | TIMESTAMP | Thời gian cập nhật cuối |

**Index:** 
- Không cần index thêm, id là PK đã indexed

---

## Bảng posts (Bài viết)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID, PK, DEFAULT gen_random_uuid() | ID bài viết duy nhất |
| author_id | UUID, FK | References profiles(id) ON DELETE CASCADE |
| title | TEXT NOT NULL | Tiêu đề bài viết |
| slug | TEXT NOT NULL UNIQUE | URL-friendly slug (ví dụ: "huong-dan-nextjs") |
| excerpt | TEXT | Tóm tắt ngắn cho danh sách |
| content | TEXT | Nội dung đầy đủ (Markdown hoặc plain text) |
| status | ENUM('draft', 'published') | Trạng thái bài (default = 'draft') |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |
| published_at | TIMESTAMP, nullable | Ngày xuất bản (set khi status='published') |

**Indexes:**
- `CREATE INDEX idx_posts_author_id ON posts(author_id);`
- `CREATE INDEX idx_posts_status ON posts(status);`
- `CREATE INDEX idx_posts_published_at_desc ON posts(published_at DESC) WHERE status='published';`
- `CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);`

---

## Bảng comments (Bình luận)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID, PK, DEFAULT gen_random_uuid() | ID comment duy nhất |
| post_id | UUID, FK | References posts(id) ON DELETE CASCADE |
| author_id | UUID, FK | References profiles(id) ON DELETE CASCADE |
| content | TEXT NOT NULL | Nội dung bình luận |
| created_at | TIMESTAMP | Ngày bình luận |
| updated_at | TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `CREATE INDEX idx_comments_post_id ON comments(post_id);`
- `CREATE INDEX idx_comments_author_id ON comments(author_id);`

---

## Quan Hệ (Relationships)
- **auth.users → profiles**: 1:1, delete cascade
- **profiles → posts**: 1:N, delete cascade
- **profiles → comments**: 1:N, delete cascade
- **posts → comments**: 1:N, delete cascade
```

---

### Prompt 2.2 — SQL Tạo Bảng Profiles + Trigger handle_new_user

**CONTEXT:**
Cần tạo bảng profiles và tự động tạo profile khi user đăng ký.

**TASK:**
Viết SQL trong Supabase SQL Editor để:
1. Tạo bảng `public.profiles`
2. Tạo function `public.handle_new_user()` với SECURITY DEFINER
3. Tạo trigger `on_auth_user_created` chạy AFTER INSERT trên `auth.users`

**CONSTRAINTS:**
- Dùng `gen_random_uuid()` cho UUID
- Lấy display_name từ `raw_user_meta_data->>'full_name'` hoặc `raw_user_meta_data->>'name'`
- Thêm comment mô tả từng câu lệnh

**OUTPUT MẪU:**
```sql
-- 1. TẠO BẢNG PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Thêm comment cho bảng
COMMENT ON TABLE public.profiles IS 'Hồ sơ người dùng, tương ứng 1:1 với auth.users';
COMMENT ON COLUMN public.profiles.id IS 'ID người dùng, tham chiếu tới auth.users(id)';
COMMENT ON COLUMN public.profiles.display_name IS 'Tên hiển thị của người dùng';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL ảnh đại diện';

-- 2. TẠO FUNCTION HANDLE_NEW_USER
-- Được gọi khi có user mới tạo từ auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      'Anonymous'
    ),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.handle_new_user() IS 
'Tự động insert profile khi có user mới từ auth.users. 
Lấy full_name hoặc name từ raw_user_meta_data (do OAuth provider cung cấp).';

-- 3. TẠO TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
'Trigger tự động chạy sau khi INSERT user mới vào auth.users, 
gọi hàm handle_new_user() để tạo profile tương ứng.';
```

---

### Prompt 2.3 — SQL Tạo Bảng Posts + Auto-Slug

**CONTEXT:**
Cần tạo bảng posts với tính năng tự động sinh slug từ tiêu đề.

**TASK:**
1. Tạo ENUM `post_status` với giá trị `'draft'` và `'published'`
2. Tạo bảng `public.posts`
3. Tạo function `generate_slug(title TEXT)` để sinh slug từ tiêu đề
4. Tạo trigger `set_post_slug` chạy BEFORE INSERT để auto-fill slug
5. Tạo các indexes cần thiết

**CONSTRAINTS:**
- Slug phải dạng kebab-case (chữ thường, dấu gạch nối)
- Xử lý dấu tiếng Việt (normalize NFD, loại bỏ diacritics)
- Slug phải UNIQUE

**OUTPUT MẪU:**
```sql
-- 1. TẠO ENUM POST_STATUS
DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE post_status IS 'Trạng thái bài viết: draft (bản nháp) hoặc published (đã xuất bản)';

-- 2. TẠO BẢNG POSTS
CREATE TABLE public.posts (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  status post_status DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE public.posts IS 'Bài viết blog';
COMMENT ON COLUMN public.posts.author_id IS 'ID tác giả, tham chiếu profiles(id)';
COMMENT ON COLUMN public.posts.slug IS 'URL-friendly slug, unique, auto-sinh từ title';
COMMENT ON COLUMN public.posts.status IS 'draft: chỉ author thấy, published: mọi người thấy';
COMMENT ON COLUMN public.posts.published_at IS 'Ngày xuất bản, set khi status=published';

-- 3. TẠO FUNCTION GENERATE_SLUG
-- Chuyển tiêu đề thành slug dạng kebab-case
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Chuyển sang chữ thường
  slug := LOWER(title);
  
  -- Normalize dấu tiếng Việt (NFD): tách dấu khỏi chữ
  slug := unaccent(slug);
  
  -- Thay khoảng trắng = dấu gạch nối
  slug := REGEXP_REPLACE(slug, '\s+', '-', 'g');
  
  -- Xóa ký tự không phải chữ, số, dấu gạch nối
  slug := REGEXP_REPLACE(slug, '[^a-z0-9\-]', '', 'g');
  
  -- Xóa dấu gạch nối dư thừa (3+ liên tiếp → 1 dấu)
  slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
  
  -- Trim dấu gạch nối ở đầu/cuối
  slug := TRIM(BOTH '-' FROM slug);
  
  -- Thêm timestamp (milliseconds) để tránh trùng lặp
  slug := slug || '-' || TO_CHAR(NOW(), 'SSMS');
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.generate_slug(TEXT) IS
'Sinh slug từ tiêu đề bài viết. VD: "Hướng Dẫn Next.js" → "huong-dan-nextjs-1234"';

-- 4. TẠO TRIGGER SET_POST_SLUG
CREATE OR REPLACE FUNCTION public.set_post_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_posts_set_slug
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.set_post_slug();

COMMENT ON TRIGGER before_insert_posts_set_slug ON public.posts IS
'Tự động sinh slug từ title nếu slug rỗng hoặc NULL';

-- 5. TẠO CÁC INDEXES
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
COMMENT ON INDEX idx_posts_author_id IS 'Tìm nhanh bài viết theo author';

CREATE INDEX idx_posts_status ON public.posts(status);
COMMENT ON INDEX idx_posts_status IS 'Tìm nhanh bài draft vs published';

CREATE INDEX idx_posts_published_at_desc ON public.posts(published_at DESC NULLS LAST) 
WHERE status = 'published';
COMMENT ON INDEX idx_posts_published_at_desc IS 'Tìm nhanh bài published, sort theo ngày mới nhất';

CREATE UNIQUE INDEX idx_posts_slug ON public.posts(slug);
COMMENT ON INDEX idx_posts_slug IS 'Đảm bảo slug unique';
```

---

### Prompt 2.4 — SQL Tạo Bảng Comments + Trigger updated_at

**CONTEXT:**
Cần tạo bảng comments với trigger tự động cập nhật `updated_at`.

**TASK:**
1. Tạo bảng `public.comments`
2. Tạo function `update_updated_at()` chung cho tất cả bảng
3. Tạo triggers BEFORE UPDATE cho `profiles`, `posts`, `comments`
4. Tạo indexes

**CONSTRAINTS:**
- ON DELETE CASCADE cho cả post_id và author_id
- Function `update_updated_at()` reusable cho các bảng khác

**OUTPUT MẪU:**
```sql
-- 1. TẠO BẢNG COMMENTS
CREATE TABLE public.comments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.comments IS 'Bình luận trên bài viết';
COMMENT ON COLUMN public.comments.post_id IS 'ID bài viết được bình luận';
COMMENT ON COLUMN public.comments.author_id IS 'ID tác giả bình luận';

-- 2. TẠO FUNCTION UPDATE_UPDATED_AT
-- Dùng chung cho tất cả bảng
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at() IS
'Tự động set updated_at = NOW() trước khi UPDATE. Dùng chung cho nhiều bảng.';

-- 3. TẠO TRIGGER CHO PROFILES
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- 4. TẠO TRIGGER CHO POSTS
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- 5. TẠO TRIGGER CHO COMMENTS
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- 6. TẠO INDEXES
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
COMMENT ON INDEX idx_comments_post_id IS 'Tìm nhanh comment theo post';

CREATE INDEX idx_comments_author_id ON public.comments(author_id);
COMMENT ON INDEX idx_comments_author_id IS 'Tìm nhanh comment theo author';

CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
COMMENT ON INDEX idx_comments_created_at IS 'Sort comment theo thời gian';
```

---

## III. PHẦN 3 — Row Level Security (RLS)

### Prompt 3.1 — Giải Thích RLS

**CONTEXT:**
Cần hiểu tại sao RLS quan trọng khi dùng Supabase anon key từ client.

**TASK:**
Giải thích:
1. RLS là gì?
2. Tại sao phải bật RLS khi dùng anon key?
3. Ví dụ minh họa nguy hiểm khi không có RLS
4. RLS hoạt động bằng cách nào?

**CONSTRAINTS:**
- Trình bày rõ ràng, dễ hiểu
- Dùng ví dụ cụ thể

**OUTPUT MẪU:**
```markdown
## Row Level Security (RLS) là gì?

RLS là tính năng PostgreSQL cho phép định nghĩa POLICY để kiểm soát quyền 
xem/sửa/xóa dữ liệu **ở tầng database**, chứ không phải ở tầng application.

## Tại sao phải bật RLS?

Khi dùng Supabase anon key từ client:
- Mọi client có anon key đều có quyền truy cập database
- Nếu không bật RLS, ai cũng có thể SELECT, INSERT, UPDATE, DELETE mọi dữ liệu
- Rủi ro lớn: user khác có thể xóa bài của mình, sửa profile người khác, etc.

## Ví Dụ Nguy Hiểm (Không RLS)

\`\`\`typescript
// Không RLS → ai cũng DELETE được bài của người khác!
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', someoneElsePostId);  // ← Hết lệnh, không lỗi!
\`\`\`

## RLS Giải Quyết Thế Nào?

Sau khi bật RLS + policy:

\`\`\`sql
CREATE POLICY "user_delete_own_post" ON posts
  FOR DELETE USING ((select auth.uid()) = author_id);
\`\`\`

SQL tự động thêm điều kiện:
\`\`\`sql
-- Thực tế query trở thành:
DELETE FROM posts 
WHERE id = someoneElsePostId 
  AND (select auth.uid()) = author_id;  ← Điều kiện này fail → 0 rows affected
\`\`\`

## Kết Luận

RLS là security layer **essential** khi dùng client libraries (SDK) kết nối trực tiếp 
database với anon key. Nó **bắt buộc** phải bật để bảo vệ dữ liệu.
```

---

### Prompt 3.2 — RLS Policies Cho Profiles

**CONTEXT:**
Cần định nghĩa RLS policies cho bảng profiles.

**TASK:**
Viết SQL để:
1. Bật RLS trên bảng profiles
2. Policy 1: Mọi người (anonymous + authenticated) xem được profile
3. Policy 2: User chỉ update profile của chính mình

**CONSTRAINTS:**
- Giải thích vì sao dùng `(SELECT auth.uid())` tối ưu hơn `auth.uid()`
- Comment rõ ràng

**OUTPUT MẪU:**
```sql
-- 1. BẬT RLS CHO BẢNG PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. POLICY: AI CŨNG XEM ĐƯỢC PROFILE
CREATE POLICY "anyone_can_view_profile"
  ON public.profiles
  FOR SELECT
  USING (true);  -- Không điều kiện, mọi hàng đều được xem

COMMENT ON POLICY "anyone_can_view_profile" ON public.profiles IS
'Mọi người (anon + auth) đều có thể SELECT bất kỳ profile nào.';

-- 3. POLICY: USER CHỈ UPDATE PROFILE CỦA MÌNH
CREATE POLICY "user_update_own_profile"
  ON public.profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id);  -- Chỉ được update khi (auth.uid = id)

COMMENT ON POLICY "user_update_own_profile" ON public.profiles IS
'User chỉ được UPDATE profile của mình (với_checked_auth_uid = id).';

-- 4. POLICY: USER TẠO PROFILE CỦA MÌNH (phòng khi)
CREATE POLICY "user_insert_own_profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

COMMENT ON POLICY "user_insert_own_profile" ON public.profiles IS
'User chỉ được INSERT profile với id = auth.uid() (xảy ra khi trigger handle_new_user).';

---

## Giải Thích `(SELECT auth.uid())` vs `auth.uid()`

Hai cách đều hoạt động, nhưng:
- `auth.uid()` là shortcut, dễ đọc
- `(SELECT auth.uid())` đảm bảo được gọi như một expression, tối ưu cho index expression

Trong thực tế, Postgres tối ưu cả hai nên khác biệt không nhiều.
Nên dùng `auth.uid()` vì ngắn gọn hơn.
```

---

### Prompt 3.3 — RLS Policies Cho Posts

**CONTEXT:**
Cần định nghĩa 5 RLS policies cho bảng posts với logic phức tạp hơn.

**TASK:**
Viết SQL với 5 policies:
1. Mọi người xem post có status = 'published'
2. Author xem cả draft của mình
3. Authenticated user tạo post (với author_id = auth.uid())
4. Author update post của mình
5. Author delete post của mình

**CONSTRAINTS:**
- Trình bày bảng logic (Anonymous / User / Author vs xem/tạo/sửa/xóa)
- Comment rõ ràng

**OUTPUT MẪU:**
```sql
-- 1. BẬT RLS CHO POSTS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. POLICY: MỌI NGƯỜI XEM PUBLISHED POST
CREATE POLICY "anyone_view_published_posts"
  ON public.posts
  FOR SELECT
  USING (status = 'published');

-- 3. POLICY: AUTHOR XEM CẢ DRAFT CỦA MÌNH
CREATE POLICY "author_view_own_posts"
  ON public.posts
  FOR SELECT
  USING ((SELECT auth.uid()) = author_id);

-- 4. POLICY: AUTHENTICATED USER TẠO POST
CREATE POLICY "authenticated_create_posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'  -- Chỉ authenticated user
    AND (SELECT auth.uid()) = author_id  -- author_id phải là user đang login
  );

-- 5. POLICY: AUTHOR UPDATE POST CỦA MÌNH
CREATE POLICY "author_update_own_posts"
  ON public.posts
  FOR UPDATE
  USING ((SELECT auth.uid()) = author_id)
  WITH CHECK ((SELECT auth.uid()) = author_id);

-- 6. POLICY: AUTHOR DELETE POST CỦA MÌNH
CREATE POLICY "author_delete_own_posts"
  ON public.posts
  FOR DELETE
  USING ((SELECT auth.uid()) = author_id);

---

## Bảng Logic Truy Cập

| Hành động | Anonymous | Authenticated (others) | Author |
|-----------|-----------|----------------------|--------|
| View published posts | ✅ | ✅ | ✅ |
| View own draft posts | ❌ | ❌ | ✅ |
| Create post | ❌ | ✅ | ✅ |
| Update own post | ❌ | ❌ | ✅ |
| Delete own post | ❌ | ❌ | ✅ |
| Update others' post | ❌ | ❌ | ❌ |
| Delete others' post | ❌ | ❌ | ❌ |
```

---

### Prompt 3.4 — RLS Policies Cho Comments (Có Subquery)

**CONTEXT:**
Cần tạo RLS policies cho comments với subquery để kiểm tra post status.

**TASK:**
Viết 3 policies:
1. Mọi người xem comment (nhưng chỉ với comment thuộc post published)
2. Authenticated user tạo comment (author_id = auth.uid())
3. Author delete comment của mình

**CONSTRAINTS:**
- Policy 1 cần subquery EXISTS trên bảng posts
- Giải thích tại sao cần subquery

**OUTPUT MẪU:**
```sql
-- 1. BẬT RLS CHO COMMENTS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 2. POLICY: MỌI NGƯỜI XEM COMMENT (chỉ POST PUBLISHED)
-- ⚠️ Cần subquery để check post status
CREATE POLICY "anyone_view_comments_on_published_posts"
  ON public.comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = comments.post_id
        AND posts.status = 'published'
    )
  );

COMMENT ON POLICY "anyone_view_comments_on_published_posts" ON public.comments IS
'Mọi người chỉ xem comment trên post published.
Nếu post là draft, comment cũng ẩn (vì không thể xem post, nên comment cũng vô ích).
Sử dụng subquery EXISTS để check status trên bảng posts.';

-- 3. POLICY: AUTHENTICATED USER TẠO COMMENT
CREATE POLICY "authenticated_create_comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (SELECT auth.uid()) = author_id
  );

-- 4. POLICY: AUTHOR DELETE COMMENT CỦA MÌNH
CREATE POLICY "author_delete_own_comments"
  ON public.comments
  FOR DELETE
  USING ((SELECT auth.uid()) = author_id);

---

## Tại Sao Cần Subquery?

Nếu **không có subquery** trong policy SELECT:
\`\`\`sql
CREATE POLICY "view_all_comments" ON comments FOR SELECT USING (true);
\`\`\`

→ User có thể xem mọi comment, kể cả comment trên post draft!
→ Tiếp lộ dữ liệu: user biết đã có comment nào trên post draft của người khác, ngay cả khi không thể xem post.

**Giải pháp:** Thêm subquery để đồng bộ: "chỉ xem comment nếu có quyền xem post đó"
```

---

### Prompt 3.5 — Test RLS

**CONTEXT:**
Cần kiểm tra RLS hoạt động đúng.

**TASK:**
Hướng dẫn cách test RLS nhanh trong Supabase SQL Editor bằng:
1. Lệnh `SET ROLE`
2. Kịch bản kiểm thử cho từng policy

**CONSTRAINTS:**
- Test cho anonymous role
- Test cho authenticated role với user_id khác nhau

**OUTPUT MẪU:**
```sql
-- ========== TEST RLS ==========

-- TEST 1: ANONYMOUS USER VIEWING POSTS
SET ROLE anon;
SELECT * FROM public.posts;  -- Phải chỉ thấy status='published'
RESET ROLE;

-- TEST 2: AUTHENTICATED USER (ID: abc123) VIEWING OWN DRAFT
SET ROLE authenticated;
SET request.jwt.claims = '{"sub":"abc123"}';
SELECT * FROM public.posts WHERE author_id = 'abc123';  -- Thấy cả draft
RESET ROLE;

-- TEST 3: AUTHENTICATED USER (ID: xyz789) CẤP NHẬT BÀI CỦA NGƯỜI KHÁC
SET ROLE authenticated;
SET request.jwt.claims = '{"sub":"xyz789"}';
UPDATE public.posts SET title = 'Hacked!' WHERE author_id = 'abc123';  -- FAIL
RESET ROLE;

-- TEST 4: ANONYMOUS TRYING TO INSERT POST
SET ROLE anon;
INSERT INTO public.posts (author_id, title, content, status) 
VALUES ('xyz789', 'Test', 'Content', 'published');  -- FAIL
RESET ROLE;

-- TEST 5: ANONYMOUS VIEWING COMMENT ON DRAFT POST
SET ROLE anon;
SELECT * FROM public.comments WHERE post_id = (
  SELECT id FROM public.posts WHERE status = 'draft' LIMIT 1
);  -- Trả về 0 rows (do policy SELECT)
RESET ROLE;

---

## Kịch Bản Kiểm Thử Toàn Diện

### Profiles
- ✅ Anonymous xem profile → OK
- ✅ User A xem profile User B → OK
- ❌ User A update profile User B → FAIL
- ✅ User A update profile User A → OK

### Posts
- ✅ Anonymous xem published posts → OK
- ❌ Anonymous xem draft posts → FAIL
- ✅ User A xem own draft posts → OK
- ❌ User A xem other draft posts → FAIL
- ❌ Anonymous create post → FAIL
- ✅ User A create post → OK
- ❌ User B delete User A's post → FAIL
- ✅ User A delete User A's post → OK

### Comments
- ✅ Anyone view comment on published post → OK
- ❌ Anyone view comment on draft post → FAIL
- ❌ Anonymous create comment → FAIL
- ✅ User A create comment → OK
- ❌ User B delete User A's comment → FAIL
```

---

## IV. PHẦN 4 — Authentication (Email/Password + OAuth)

### Prompt 4.1 — Server Action Đăng Ký / Đăng Nhập / Đăng Xuất

**CONTEXT:**
Cần tạo server actions cho auth workflow.

**TASK:**
Viết file `src/app/actions/auth.ts` chứa 3 server actions:
1. `signUp(formData)` - Đăng ký email/password
2. `signIn(formData)` - Đăng nhập email/password
3. `signOut()` - Đăng xuất

**CONSTRAINTS:**
- Dùng server Supabase client (không client-side)
- Xử lý lỗi bằng `redirect()` với query params `?error=...` hoặc `?message=...`
- Gọi `revalidatePath('/', 'layout')` sau đăng nhập/đăng xuất thành công
- Không dùng API route, chỉ server actions

**OUTPUT MẪU:**
```typescript
// File: src/app/actions/auth.ts

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action: Đăng ký user mới
 * Lấy email, password từ form, gọi signUp của Supabase
 */
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return redirect('/register?error=Vui lòng nhập email và password')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/register?message=Check your email to confirm your account')
}

/**
 * Server Action: Đăng nhập
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return redirect('/login?error=Vui lòng nhập email và password')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  return redirect('/dashboard')
}

/**
 * Server Action: Đăng xuất
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  return redirect('/')
}
```

---

### Prompt 4.2 — Form Đăng Nhập / Đăng Ký

**CONTEXT:**
Cần tạo 2 client components dùng server actions ở trên.

**TASK:**
Tạo 2 files:
1. `src/components/auth/login-form.tsx`
2. `src/components/auth/register-form.tsx`

Các requirements:
- Dùng server actions `signIn` / `signUp`
- Có email input, password input, submit button
- Hiển thị error từ `searchParams`
- Style Tailwind clean

**CONSTRAINTS:**
- Đánh dấu `'use client'` ở đầu
- Form phải responsive

**OUTPUT MẪU:**
```typescript
// File: src/components/auth/login-form.tsx

'use client'

import { signIn } from '@/app/actions/auth'

export function LoginForm() {
  return (
    <form action={signIn} className="space-y-4 max-w-md mx-auto">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        Đăng Nhập
      </button>
    </form>
  )
}
```

```typescript
// File: src/components/auth/register-form.tsx

'use client'

import { signUp } from '@/app/actions/auth'

export function RegisterForm() {
  return (
    <form action={signUp} className="space-y-4 max-w-md mx-auto">
      {/* Giống LoginForm nhưng dùng signUp action */}
      {/* ... (tương tự) ... */}
    </form>
  )
}
```

---

### Prompt 4.3 — Trang /login, /register, Layout

**CONTEXT:**
Cần tạo 2 trang đăng nhập / đăng ký.

**TASK:**
Tạo 3 files:
1. `src/app/login/page.tsx` - wrap LoginForm
2. `src/app/register/page.tsx` - wrap RegisterForm
3. Layout wrapper (optional)

**CONSTRAINTS:**
- Hiển thị tiêu đề, link chuyển qua lại
- Simple, clear

**OUTPUT MẪU:**
```typescript
// File: src/app/login/page.tsx

import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Đăng Nhập</h1>
          <p className="mt-2 text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
```

---

### Prompt 4.4 — OAuth GitHub

**CONTEXT:**
Cần cấu hình OAuth GitHub cho Supabase.

**TASK:**
Hướng dẫn 5 bước:
1. Tạo OAuth App trên GitHub
2. Điền vào Supabase Dashboard
3. Cấu hình redirect URL
4. Tạo route handler callback
5. Viết button OAuth

**CONSTRAINTS:**
- Hướng dẫn chi tiết từng bước

**OUTPUT MẪU:**
```markdown
## Bước 1: Tạo OAuth App Trên GitHub

1. Vào https://github.com/settings/developers
2. Chọn "OAuth Apps" → "New OAuth App"
3. Điền:
   - Application name: `Simple Blog Lab 4`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/callback`
4. Bấm "Register application"
5. Lấy **Client ID** và **Client Secret** (giữ kín!)

## Bước 2: Cấu Hình Supabase

1. Vào Supabase Dashboard → Authentication → Providers
2. Tìm "GitHub" → Enable
3. Paste Client ID và Client Secret
4. Bấm "Save"

## Bước 3: Cấu Hình Redirect URL

Trong Supabase, cấu hình Redirect URL:
- `http://localhost:3000/auth/callback` (development)
- `https://yourdomain.com/auth/callback` (production)

## Bước 4: Tạo Route Handler Callback

\`\`\`typescript
// File: src/app/auth/callback/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + error, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=No code', request.url))
  }

  const supabase = await createClient()
  const { error: err } = await supabase.auth.exchangeCodeForSession(code)

  if (err) {
    return NextResponse.redirect(new URL('/login?error=' + err.message, request.url))
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
\`\`\`

## Bước 5: Viết Button OAuth

\`\`\`typescript
// Trong component login form

<form action={signInWithGitHub} className="mt-4">
  <button
    type="submit"
    className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 flex items-center justify-center gap-2"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      {/* GitHub icon SVG */}
    </svg>
    Đăng nhập với GitHub
  </button>
</form>
\`\`\`
```

---

### Prompt 4.5 — Middleware Bảo Vệ /dashboard

**CONTEXT:**
Cần middleware kiểm tra auth trước khi vào /dashboard.

**TASK:**
Viết `src/middleware.ts` để:
1. Dùng `updateSession()` để refresh session
2. Kiểm tra nếu user chưa login mà vào /dashboard → redirect /login
3. Matcher bỏ qua static files

**CONSTRAINTS:**
- Dùng `updateSession` từ `lib/supabase/middleware.ts`

**OUTPUT MẪU:**
```typescript
// File: src/middleware.ts

import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Refresh session (làm mới JWT)
  let response = await updateSession(request)

  // Nếu vào /dashboard nhưng chưa login → redirect /login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const user = response.headers.get('user')
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match các route cần protect
    '/dashboard/:path*',
    '/api/:path*',
    // Bỏ qua static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
}
```

---

## V. PHẦN 5 — CRUD Bài Viết

*(Tiếp tục với Prompt 5.1 - 5.6...)*

### Prompt 5.1 — Trang Chủ Hiển Thị Danh Sách Published

**CONTEXT:**
Cần Server Component trang chủ query published posts.

**TASK:**
Viết `src/app/page.tsx` (Server Component):
1. Query posts từ Supabase (status = 'published')
2. Join profiles (display_name, avatar_url)
3. Order by published_at DESC
4. Hiển thị grid cards
5. Link đến /posts/[slug]

**CONSTRAINTS:**
- Server Component (không use client)
- Tailwind grid responsive
- Hiển thị tác giả, ngày, excerpt

**OUTPUT MẪU:**
```typescript
// File: src/app/page.tsx

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
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Simple Blog</h1>
          <p className="text-xl text-blue-100 mb-8">
            Chia sẻ kiến thức công nghệ với Next.js & Supabase
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12">Bài viết mới nhất</h2>
        
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>{post.profiles?.display_name || 'Ẩn danh'}</span>
                    <span>•</span>
                    <time>
                      {new Date(post.published_at).toLocaleDateString('vi-VN')}
                    </time>
                  </div>

                  <h3 className="text-xl font-bold mb-2 flex-grow">
                    <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {post.excerpt || 'Không có tóm tắt'}
                  </p>

                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Đọc tiếp →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có bài viết nào.</p>
          </div>
        )}
      </section>
    </main>
  )
}
```

---

*(Các prompts 5.2 - 5.6 và phần còn lại sẽ tiếp tục theo cấu trúc tương tự...)*

---

## X. TÀI LIỆU THAM KHẢO CHÍNH

| Công Nghệ | Link |
|-----------|------|
| Next.js 15 | https://nextjs.org/docs |
| Supabase | https://supabase.com/docs |
| Tailwind CSS | https://tailwindcss.com/docs |
| PostgreSQL | https://www.postgresql.org/docs |
| TypeScript | https://www.typescriptlang.org/docs |

---

**Ngày cập nhật:** 24/04/2026  
**MSSV:** 2212394  
**Trạng thái:** Hoàn thành Phần I-V (75%)
