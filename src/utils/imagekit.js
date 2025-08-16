/**
 * ImageKit server-side helper for generating upload signatures
 * 
 * Environment Variables:
 * - IMAGEKIT_PUBLIC_KEY: ImageKit public key
 * - IMAGEKIT_PRIVATE_KEY: ImageKit private key
 * - IMAGEKIT_URL_ENDPOINT: ImageKit URL endpoint
 */

import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Generate authentication parameters for client-side upload
 * @returns {Object} Authentication parameters
 */
export const getAuthParams = () => {
  return imagekit.getAuthenticationParameters();
};

export default imagekit;