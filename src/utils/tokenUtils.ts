import { jwtDecode, JwtPayload } from 'jwt-decode';
export const isTokenExpired = (
  token: string | null,
  dT: number = 600
): boolean => {
  if (token === null) {
    return true;
  }
  try {
    const decoded: JwtPayload = jwtDecode(token);

    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp) {
      return decoded.exp < currentTime - dT;
    }

    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    return true;
  }
};

export const getMSAccessToken = (
  options?: OfficeRuntime.AuthOptions
): Promise<string> => {
  return OfficeRuntime.auth.getAccessToken({
    ...options,
    allowSignInPrompt: options?.allowSignInPrompt ?? true,
    allowConsentPrompt: options?.allowConsentPrompt ?? true,
    forMSGraphAccess: options?.forMSGraphAccess ?? true,
  });
};
