/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'images.squarespace-cdn.com', // Previous domain
        'balanzifyapi.jumatechs.xyz' // New domain
      ],
    },
    publicRuntimeConfig: {
      hostname: "http://balanzifyapi.jumatechs.xyz",
    },
  };
  
  export default nextConfig;