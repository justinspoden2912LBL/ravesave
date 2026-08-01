import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { Nav, Footer } from "../components/Nav";
import { EmergencyButton } from "../components/EmergencyButton";
import { AiAskButton } from "../components/AiAskButton";
import { WelcomeOnboarding } from "../components/WelcomeOnboarding";
import { BottomNav } from "../components/BottomNav";
import { trackPageView, trackEvent } from "@/lib/analytics";
import { initI18n, refreshI18n } from "@/lib/i18n";
import { initSubstanceOverrides, refreshSubstanceOverrides } from "@/lib/substancesRuntime";
import { initFeatureFlags, refreshFeatureFlags } from "@/lib/featureFlags";
import { PathFeatureGate } from "@/components/FeatureGate";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Rave Safe, have Fun — Wissen statt Bauchgefühl - ohne Drama" },
      { name: "description", content: "Konsum-Protokoll, Mischkonsum-Risiko-Check und evidenzbasierte Substanz-Infos. Ohne Drama, nur Fakten" },
      { name: "author", content: "Rave Safe, have Fun" },
      { name: "theme-color", content: "#0c0a1c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Rave Safe" },
      { name: "mobile-web-app-capable", content: "yes" },
      { property: "og:site_name", content: "Rave Safe, have Fun" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/549e0f68-4709-4dfe-86d2-63618f64ad0b" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/549e0f68-4709-4dfe-86d2-63618f64ad0b" },
      { property: "og:title", content: "Rave Safe, have Fun — Wissen statt Bauchgefühl - ohne Drama" },
      { name: "twitter:title", content: "Rave Safe, have Fun — Wissen statt Bauchgefühl - ohne Drama" },
      { property: "og:description", content: "Konsum-Protokoll, Mischkonsum-Risiko-Check und evidenzbasierte Substanz-Infos. Ohne Drama, nur Fakten" },
      { name: "twitter:description", content: "Konsum-Protokoll, Mischkonsum-Risiko-Check und evidenzbasierte Substanz-Infos. Ohne Drama, nur Fakten" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: "Rave Safe, have Fun",
              url: "https://ravesave.fun",
              inLanguage: "de",
              description:
                "Harm-Reduction-Begleiter: Konsum protokollieren, Mischkonsum prüfen, Substanzen verstehen — alles lokal im Browser.",
            },
            {
              "@type": "Organization",
              name: "Rave Safe, have Fun",
              url: "https://ravesave.fun",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Boot: hydrate i18n + flag caches and refresh from server.
  useEffect(() => {
    initI18n();
    initSubstanceOverrides();
    initFeatureFlags();
    void refreshI18n();
    void refreshSubstanceOverrides();
    void refreshFeatureFlags();
  }, []);

  // PWA install tracking
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Schon installiert (Standalone-Modus)?
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    try {
      const KEY = "rs_pwa_standalone_reported";
      if (isStandalone && !localStorage.getItem(KEY)) {
        trackEvent("pwa_standalone_open");
        localStorage.setItem(KEY, "1");
      }
    } catch { /* ignore */ }

    const onBeforeInstall = () => trackEvent("pwa_install_prompt_shown");
    const onInstalled = () => trackEvent("pwa_installed");
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Page-view tracking.
  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1 pb-bottomnav">
          <PathFeatureGate pathname={pathname}>
            <Outlet />
          </PathFeatureGate>
        </main>
        <Footer />
        <EmergencyButton />
        <AiAskButton />
        <BottomNav />
        <WelcomeOnboarding />
      </div>
    </QueryClientProvider>
  );
}

