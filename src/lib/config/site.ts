import type { SiteConfig } from '$lib/types/site'

export const site: SiteConfig = {
  protocol: 'https://',
  domain: import.meta.env.URARA_SITE_DOMAIN ?? 'https://blog-vincenzopalazzo.netlify.app',
  title: 'Hedwig Blog',
  subtitle: 'An opinioneted blog with experiment description heavily powered by open source',
  lang: 'en-US',
  description: 'Powered by SvelteKit/Urara',
  author: {
    name: 'Vincenzo Palazzo',
    avatar: 'https://avatars.githubusercontent.com/u/17150045?v=4',
    status: '🦍',
    bio: 'It is not important who you are, but what you do that define yourself!'
  },
  themeColor: '#3D4451'
}
