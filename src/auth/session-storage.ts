import * as SecureStore from 'expo-secure-store';
const key = 'bairro-em-dia.auth-token';
export const loadToken = () => SecureStore.getItemAsync(key);
export const storeToken = (token: string) => SecureStore.setItemAsync(key, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
export const removeToken = () => SecureStore.deleteItemAsync(key);
