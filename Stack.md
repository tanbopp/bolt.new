Fitur Bawaan (stackblitz/bolt.new) — Fondasi 80%

- WebContainers Engine: Menjalankan runtime Node.js, terminal, dan instalasi npm package sepenuhnya di dalam browser klien tanpa server backend terpisah.
- Conversational AI Chat Interface: Antarmuka obrolan sisi kiri untuk memberikan instruksi teks kepada AI (streaming response dengan Vercel AI SDK).
- Multi-File Code Editor: Editor kode berbasis Monaco Editor untuk melihat dan mengedit struktur folder serta berkas proyek secara langsung.
- Live Preview Panel: Tampilan pratinjau aplikasi secara real-time yang mendukung hot-reloading dari kode yang dihasilkan atau diubah oleh AI.
- Terminal Interaktif: Jendela terminal terintegrasi untuk melihat proses eksekusi perintah shell, build output, atau log error dari aplikasi.
- Basic Version Control & Checkpoints: Mekanisme penyimpanan status proyek per langkah iterasi obrolan agar bisa kembali ke titik sebelumnya.
- Multi-Step Agent Reasoning: AI dapat merencanakan, menulis, dan memperbaiki kode secara iteratif dalam beberapa langkah.
- Frontend Framework Options: Mendukung React, Vite, Next.js, Vue, Svelte, dll. melalui boilerplate atau inisialisasi AI.
- GitHub Integration: Tersedia opsi untuk export atau sinkronisasi ke repositori GitHub.
- Code Export & No Lock-in: Dapat mengunduh seluruh proyek dalam format file ZIP.
- Environment Variable Secret Management: Tersedia mekanisme pengelolaan variabel lingkungan untuk konfigurasi rahasia.
- Template & Starter Kits Gallery: Menyediakan pilihan templat awal saat membuat proyek baru.


Fitur Tambahan (Dioptimalkan untuk Integrasi Mudah & Efisien)

- Visual Element Selector (Click-to-Edit): Menggunakan lightweight DOM inspection script (terinspirasi dari onlook-dev/onlook) yang disuntikkan langsung ke dalam iframe preview, di mana klik elemen diterjemahkan otomatis menjadi teks prompt instruksi ke AI.
- Prompt to Image / Asset Generation: Diintegrasikan secara instan melalui API Client ringan di sisi frontend (memanggil Stable Diffusion API) yang langsung mengunduh hasil gambarnya ke direktori public proyek WebContainer.
- Frontend Framework Options: Diperluas dengan menambahkan folder starter templates Astro atau SolidJS secara manual ke dalam repositori boilerplate Bolt tanpa mengubah core engine.
- Auto-Database Integration: Menggunakan client SDK dan manajemen skema terpusat Supabase (supabase/supabase) melalui instruksi kode otomatis (code generation) yang disuntikkan langsung oleh AI Agent ke dalam berkas konfigurasi proyek.
- Authentication Engine: Dihadirkan dalam bentuk modul code snippets siap pakai dari Auth.js / Lucia (nextauthjs/next-auth atau lucia-auth/lucia) yang otomatis dipasang oleh AI ke dalam struktur file proyek saat diminta.
- API Connector & Webhook Handling: Memanfaatkan layanan ringan pihak ketiga (seperti hookdeck/hookdeck Cloud API) via konfigurasi HTTP sederhana di backend/frontend tanpa perlu memasang daemon proxy yang berat.
- One-Click Deploy: Menggunakan API publik dari platform hosting instan (seperti Vercel/Netlify API atau coollabsio/coolify REST API) yang mengirimkan snapshot kode proyek langsung via HTTP request saat tombol deploy ditekan.
- Custom Domain Management: Dihandle secara otomatis melalui pemanggilan API penyedia DNS/Domain publik (seperti Cloudflare API atau caddyserver/caddy REST API) yang dikoordinasikan langsung dari server backend platform.
- Multi-user Workspaces & RBAC: Menggunakan sistem autentikasi dan manajemen peran berbasis database yang sudah ada (seperti tabel RBAC bawaan Supabase atau modul manajemen sesi ringan) sebagai pengganti server identity provider mandiri yang kompleks.
- Real-time Co-building / Multiplayer: Menggunakan sinkronisasi state berbasis event chat atau sinkronisasi file periodik yang lebih sederhana di atas lapisan penyimpanan dokumen, menghindari kompleksitas penuh CRDT tingkat rendah pada file system lokal.
- Credit & Token Usage Analytics: Diintegrasikan secara instan menggunakan satu baris konfigurasi SDK analitik LLM (seperti langfuse/langfuse) langsung pada fungsi pemanggilan Vercel AI SDK di backend/frontend platform.
- Pembayaran untuk upgrade paket: Pakasir


stack untuk platform:
- Frontend UI: bawaan stackblitz/bolt.new (Tailwind CSS, Radix UI, Lucide React, Vite/React, Monaco Editor).
- model agent ai: deepseek v4 flash - low effort
- Database & Auth: Supabase (Free Tier) untuk menyimpan data internal platform (tabel users untuk akun, tabel projects untuk daftar proyek user, dan tabel riwayat chat/metadata).
- Authentication (Login): Supabase Auth yang mendukung Google, GitHub, dan Email/Password.
- Pembayaran Otomatis: Pakasir (QRIS/VA via Webhook).
- Deployment Engine: Vercel (Free Tier)