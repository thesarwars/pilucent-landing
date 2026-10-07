/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.squarespace-cdn.com' },
      { protocol: 'https', hostname: 'balanzifyapi.jumatechs.xyz' },
      { protocol: 'https', hostname: 'plaid-merchant-logos.plaid.com' },
      { protocol: 'https', hostname: '145.223.75.199' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'payroll.jumatechs.xyz' },
      { protocol: 'https', hostname: 'ideas.darden.virginia.edu' },
      { protocol: 'https', hostname: 'media.discordapp.net' },
      { protocol: 'https', hostname: 'i.ibb.co.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'balanzifyapi.jumatechs.xyz' },
      { protocol: 'http', hostname: 'balanzifyapi.jumatechs.xyz' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'balanzify-s3-511590151275-us-east-2-an.s3.us-east-2.amazonaws.com' },
    ],
  },
};

export default nextConfig;
