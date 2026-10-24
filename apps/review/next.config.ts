import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  logging: {
    browserToTerminal: true,
  },
  transpilePackages: [
    'three',
    '@pascal-app/core',
    '@pascal-app/ifc-converter',
    '@pascal-app/nodes',
    '@pascal-app/viewer',
  ],
  // One copy of each of these across the app and the Pascal packages: a
  // second React or three instance breaks hooks and `instanceof` checks.
  turbopack: {
    resolveAlias: {
      react: './node_modules/react',
      three: './node_modules/three',
      '@react-three/fiber': './node_modules/@react-three/fiber',
      '@react-three/drei': './node_modules/@react-three/drei',
    },
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true }
    return config
  },
}

export default nextConfig
