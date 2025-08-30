export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return new Date(payload.exp * 1000); // Convert to milliseconds and return as Date object
  } catch (error) {
    console.error('Error getting token expiration time:', error);
    return null;
  }
};
