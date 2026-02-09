/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  /** Set to "staging" for staging deployments; otherwise production is assumed when MODE is production. */
  readonly PUBLIC_APP_ENV?: string;
  /** PostHog project API key (required for analytics). Set in .env for local; use Cloudflare Pages env for deploy. */
  readonly PUBLIC_POSTHOG_KEY?: string;
  /** PostHog API host (default: https://us.i.posthog.com). */
  readonly PUBLIC_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
