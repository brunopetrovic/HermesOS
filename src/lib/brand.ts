/**
 * Central brand configuration.
 *
 * This is the single source of truth for the product's name and copy.
 * Self-hosters can rebrand the entire app by editing the values below
 * (or by setting the matching NEXT_PUBLIC_* environment variables).
 */
export const BRAND = {
  /** Product name shown in the sidebar, command bar, and metadata. */
  name: process.env.NEXT_PUBLIC_APP_NAME || 'UNOX',
  /** Short tagline shown under the logo. */
  tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'Agent Command Center',
  /** Long description used for metadata / PWA manifest. */
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'A unified command center for running, monitoring, and orchestrating your local AI agents.',
} as const;
