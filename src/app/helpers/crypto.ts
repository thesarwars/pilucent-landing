export const encryptData = (params: any) => {
  if (typeof window === 'undefined') return '';
  try {
    const serializedObject = encodeURIComponent(JSON.stringify(params));
    return serializedObject;
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
};

export const decryptData = (encoded: any) => {
  if (typeof window === 'undefined') return null;
  try {
    const decodedObject = JSON.parse(decodeURIComponent(encoded));
    return decodedObject;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const getRelativePath = (url: string) => {
  if (url?.includes('https://balanzify-s3-511590151275-us-east-2-an.s3.us-east-2.amazonaws.com')) {
    return url?.slice(
      'https://balanzify-s3-511590151275-us-east-2-an.s3.us-east-2.amazonaws.com'.length
    );
  } else if (url?.includes('https://balanzifyapi.jumatechs.xyz')) {
    return url?.slice('https://balanzifyapi.jumatechs.xyz'.length);
  } else if (url?.startsWith('/')) {
    return url;
  }
  return url || '';
};
