import { getEnvironment } from '../env';

export const POSTHOG_SERVICE_ID = 'sumi' as const;

export function getPostHogCommonProperties() {
  return {
    service_id: POSTHOG_SERVICE_ID,
    environment: getEnvironment(),
  };
}
