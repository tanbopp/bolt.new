import { useStore } from '@nanostores/react';
import { json, type LoaderFunctionArgs, type LinksFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { ToastProvider } from './components/ui/Toast';
import { isPublicRoute, requireSession } from './lib/supabase/middleware';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <ToastProvider>
        {children}
        <ScrollRestoration />
        <Scripts />
      </ToastProvider>
    </>
  );
}

export default function App() {
  useEffect(() => {
    /**
     * Penanda hidrasi untuk E2E (Playwright).
     *
     * Halaman di-render server, jadi elemen form sudah ada di DOM sebelum React
     * ter-hidrasi. Bila test men-submit form sebelum hidrasi selesai, browser
     * melakukan submit native (GET dengan query string). Test menunggu atribut
     * ini dulu supaya interaksi selalu terjadi setelah hidrasi.
     */
    document.documentElement.dataset.hydrated = 'true';
  }, []);

  return <Outlet />;
}

/**
 * Proteksi route (setara middleware).
 *
 * Remix tidak punya middleware global, jadi guard dijalankan di loader root —
 * loader ini dieksekusi sebelum render untuk semua route, baik SSR maupun
 * navigasi client. Route publik dikecualikan (lihat `PUBLIC_ROUTES`).
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  if (isPublicRoute(url.pathname)) {
    return json({});
  }

  const { headers } = await requireSession(request, context.cloudflare.env);

  return json({}, { headers });
}
