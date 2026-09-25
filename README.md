[![Bolt.new: AI-Powered Full-Stack Web Development in the Browser](./public/social_preview_index.jpg)](https://bolt.new)

# Bolt.new: AI-Powered Full-Stack Web Development in the Browser

Bolt.new is an AI-powered web development agent that allows you to prompt, run, edit, and deploy full-stack applications directly from your browser—no local setup required. If you're here to build your own AI-powered web dev agent using the Bolt open source codebase, [click here to get started!](./CONTRIBUTING.md)

## What Makes Bolt.new Different

Claude, v0, etc are incredible- but you can't install packages, run backends or edit code. That’s where Bolt.new stands out:

- **Full-Stack in the Browser**: Bolt.new integrates cutting-edge AI models with an in-browser development environment powered by **StackBlitz’s WebContainers**. This allows you to:
  - Install and run npm tools and libraries (like Vite, Next.js, and more)
  - Run Node.js servers
  - Interact with third-party APIs
  - Deploy to production from chat
  - Share your work via a URL

- **AI with Environment Control**: Unlike traditional dev environments where the AI can only assist in code generation, Bolt.new gives AI models **complete control** over the entire  environment including the filesystem, node server, package manager, terminal, and browser console. This empowers AI agents to handle the entire app lifecycle—from creation to deployment.

Whether you’re an experienced developer, a PM or designer, Bolt.new allows you to build production-grade full-stack applications with ease.

For developers interested in building their own AI-powered development tools with WebContainers, check out the open-source Bolt codebase in this repo!

## Tips and Tricks

Here are some tips to get the most out of Bolt.new:

- **Be specific about your stack**: If you want to use specific frameworks or libraries (like Astro, Tailwind, ShadCN, or any other popular JavaScript framework), mention them in your initial prompt to ensure Bolt scaffolds the project accordingly.

- **Use the enhance prompt icon**: Before sending your prompt, try clicking the 'enhance' icon to have the AI model help you refine your prompt, then edit the results before submitting.

- **Scaffold the basics first, then add features**: Make sure the basic structure of your application is in place before diving into more advanced functionality. This helps Bolt understand the foundation of your project and ensure everything is wired up right before building out more advanced functionality.

- **Batch simple instructions**: Save time by combining simple instructions into one message. For example, you can ask Bolt to change the color scheme, add mobile responsiveness, and restart the dev server, all in one go saving you time and reducing API credit consumption significantly.

## FAQs

**Where do I sign up for a paid plan?**  
Bolt.new is free to get started. If you need more AI tokens or want private projects, you can purchase a paid subscription in your [Bolt.new](https://bolt.new) settings, in the lower-left hand corner of the application. 

**What happens if I hit the free usage limit?**  
Once your free daily token limit is reached, AI interactions are paused until the next day or until you upgrade your plan.

**Is Bolt in beta?**  
Yes, Bolt.new is in beta, and we are actively improving it based on feedback.

**How can I report Bolt.new issues?**  
Check out the [Issues section](https://github.com/stackblitz/bolt.new/issues) to report an issue or request a new feature. Please use the search feature to check if someone else has already submitted the same issue/request.

**What frameworks/libraries currently work on Bolt?**  
Bolt.new supports most popular JavaScript frameworks and libraries. If it runs on StackBlitz, it will run on Bolt.new as well.

**How can I add make sure my framework/project works well in bolt?**  
We are excited to work with the JavaScript ecosystem to improve functionality in Bolt. Reach out to us via [hello@stackblitz.com](mailto:hello@stackblitz.com) to discuss how we can partner!

---

# Setup Auth & User Layer (Tahapan 1 — Tanecode)

Bagian ini khusus untuk fork Tanecode (`tanbopp/bolt.new`). Tahapan 1 mengganti
lapisan identitas dengan **Supabase Auth** (Google, GitHub, Email/Password) dan
menambahkan tabel profil `public.users`.

## 1. Env

Salin `.env` (disediakan user) menjadi `.env.local` — Remix Vite membaca
`.env.local` untuk `process.env`, sedangkan browser membaca `SUPABASE_URL` dan
`SUPABASE_ANON_KEY` lewat `envPrefix` di `vite.config.ts`.

```bash
cp .env .env.local   # Windows: Copy-Item .env .env.local -Force
```

`SUPABASE_SERVICE_ROLE_KEY` dan `SUPABASE_JWT_SECRET` tidak pernah diakses kode
aplikasi (hanya test runner yang membaca service role key dari `.env.local`).

## 2. Jalankan migrasi tabel `users`

Buka **Supabase Dashboard → SQL Editor**, tempel isi
[`supabase/migrations/0001_users.sql`](./supabase/migrations/0001_users.sql),
lalu **Run**. Alternatif via CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Migrasi membuat tabel `public.users`, index email, RLS (`users_select_own`,
`users_update_own`), dan trigger `on_auth_user_created` yang otomatis mengisi
profil setiap kali user baru signup.

> Belum dijalankan? Aplikasi tetap jalan, tapi test yang memeriksa tabel akan
> di-skip dan halaman `/account` menampilkan catatan bahwa tabel belum ada.

## 3. Aktifkan provider auth

Supabase Dashboard → **Authentication → Providers**:

1. **Email** — sudah aktif secara default. Untuk development, matikan
   "Confirm email" bila ingin langsung login setelah signup.
2. **Google** — butuh Client ID & Secret dari Google Cloud Console
   (OAuth 2.0 Client, redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`).
3. **GitHub** — Client ID & Secret sudah tersedia di `.env`
   (`GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`), callback URL
   `https://<project-ref>.supabase.co/auth/v1/callback`.

Lalu di **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:5173` (development) / domain produksi.
- **Redirect URLs**: `http://localhost:5173/auth/callback` dan
  `https://<domain-produksi>/auth/callback`.

Tanpa langkah ini, tombol OAuth akan gagal dengan pesan
"Provider OAuth ini belum diaktifkan di project Supabase." (bukan error pada
kode aplikasi).

## 4. Test

```bash
pnpm exec playwright test
```

Test membaca kredensial dari `.env.local` (termasuk service role key untuk
membuat/menghapus user test), jadi file itu wajib ada.

