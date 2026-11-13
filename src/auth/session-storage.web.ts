// No navegador a sessão usa um cookie HttpOnly emitido pela API.
export const loadToken = async (): Promise<string | null> => null;
export const storeToken = async (_token: string): Promise<void> => {};
export const removeToken = async (): Promise<void> => {};
