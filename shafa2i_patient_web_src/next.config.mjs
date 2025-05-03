/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Optional: Add basePath if needed for serving from subdirectories like /patient
  // basePath: '/patient',
  // Optional: Disable image optimization if not using Next.js server
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
