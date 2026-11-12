import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
const light = {
  background: '#F3F6F5', surface: '#FFFFFF', input: '#F5F8F7',
  text: '#172D29', muted: '#526760', subtle: '#5D716A', border: '#DCE6E1',
  inputBorder: '#B6C9BF', primary: '#146C53', onPrimary: '#FFFFFF',
  tint: '#E3F1E9', tintText: '#265E49', blue: '#EAF0FA', blueText: '#365578',
  danger: '#AB3038',
};
export type AppColors = typeof light;
const dark: AppColors = {
  background: '#121212', surface: '#1E1E1E', input: '#171717',
  text: '#F2F2F2', muted: '#C2C2C2', subtle: '#AAAAAA', border: '#383838',
  inputBorder: '#606060', primary: '#83DCB0', onPrimary: '#102D21',
  tint: '#282828', tintText: '#DEDEDE', blue: '#282828', blueText: '#D0D0D0',
  danger: '#FFADB0',
};
const ThemeContext = createContext<{
  colors: AppColors; isDark: boolean; preference: ThemePreference;
  setPreference: (value: ThemePreference) => void; ready: boolean; storageError: string | null;
} | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setValue] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('bairro-em-dia:appearance').then(value => {
      if (active && (value === 'light' || value === 'dark' || value === 'system')) setValue(value);
    }).catch(() => {
      if (active) setStorageError('Não foi possível recuperar sua preferência de aparência.');
    }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  function setPreference(value: ThemePreference) {
    if (!ready) return;
    setValue(value);
    setStorageError(null);
    writes.current = writes.current.then(() => AsyncStorage.setItem('bairro-em-dia:appearance', value))
      .catch(() => setStorageError('O tema foi aplicado, mas não pôde ser salvo neste dispositivo.'));
  }
  const isDark = ready && (preference === 'dark' || (preference === 'system' && system === 'dark'));
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      document.documentElement.style.backgroundColor = isDark ? dark.background : light.background;
    }
  }, [isDark]);
  return <ThemeContext.Provider value={{ colors: isDark ? dark : light, isDark, preference, setPreference, ready, storageError }}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('AppThemeProvider ausente.');
  return value;
}

export const appFont = Platform.select({ web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', ios: 'System', default: 'sans-serif' });
