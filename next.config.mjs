/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'images.squarespace-cdn.com', // Previous domain
        'backend.pilucent.com' // the Pilucent API's media
      ],
    },
    publicRuntimeConfig: {
      hostname: "https://backend.pilucent.com",
    },
  };
  
  export default nextConfig;