/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'utfs.io',
          port: '',
          pathname: '/**'
        }
      ]
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      PANEL_API_URL: process.env.PANEL_API_URL,
      MONGODB_URL: process.env.MONGODB_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN
    },
  };
  
  export default nextConfig;
  