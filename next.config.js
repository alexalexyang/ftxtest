/** @type {import('next').NextConfig} */
module.exports = {
  publicRuntimeConfig: {
    ftxPublicKey: process.env.FTX_PUBLIC_KEY,
    ftxSecretKey: process.env.FTX_SECRET_KEY,
  },
  serverRuntimeConfig: {},
  reactStrictMode: true,
};
