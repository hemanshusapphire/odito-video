export interface SocialPlatformAsset {
  imagePath: string;
  logoBg: string;
  logoBorder: string;
}

export const SOCIAL_PLATFORM_ASSETS: Record<string, SocialPlatformAsset> = {
  facebook:  { imagePath: 'socia- icons/facebook.png',  logoBg: '#0d1a3a', logoBorder: '#1a3060' },
  instagram: { imagePath: 'socia- icons/instagram.png', logoBg: '#2a0e1a', logoBorder: '#4a1a30' },
  linkedin:  { imagePath: 'socia- icons/linkedin.png',  logoBg: '#0a1e3a', logoBorder: '#0f3060' },
  twitter:   { imagePath: 'socia- icons/twitter.png',   logoBg: '#0a1e2e', logoBorder: '#0f3050' },
  youtube:   { imagePath: 'socia- icons/youtube.png',   logoBg: '#2a0808', logoBorder: '#4a1010' },
};
