/**
 * Runtime environment for analytics and feature flags.
 * Uses Vite/Astro build-time env (import.meta.env) so values are inlined in the client bundle.
 */
export type Environment = 'local' | 'staging' | 'production';

export function getEnvironment(): Environment {
  if (import.meta.env.MODE === 'development') {
    return 'local';
  }
  if (import.meta.env.PUBLIC_APP_ENV === 'staging') {
    return 'staging';
  }
  return 'production';
}
