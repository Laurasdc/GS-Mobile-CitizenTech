import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppThemeProvider, appFont, useAppTheme } from '../theme/app-theme';
import { AccountButton } from '../components/account-button';
import { AuthProvider } from '../auth/auth-context';
import { OccurrenceDraftProvider } from '../forms/occurrence-draft';

function Navigation() {
  const { colors, isDark } = useAppTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  return <ThemeProvider value={{ ...base, colors: { ...base.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary } }}>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '700', fontFamily: appFont }, headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal',
      contentStyle: { backgroundColor: colors.background }, headerRight: () => <AccountButton /> }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ocorrencias/[id]" options={{ title: Platform.OS === 'web' ? 'Detalhes da ocorrência' : 'Detalhes' }} />
      <Stack.Screen name="editar/[id]" options={{ title: 'Editar relato' }} />
      <Stack.Screen name="gestao/index" options={{ title: Platform.OS === 'web' ? 'Gestão de ocorrências' : 'Gestão' }} />
      <Stack.Screen name="gestao/[id]" options={{ title: 'Atualizar situação' }} />
      <Stack.Screen name="registrar" options={{ title: Platform.OS === 'web' ? 'Registrar problema' : 'Registrar' }} />
      <Stack.Screen name="entrar" options={{ title: 'Entrar', headerRight: () => null }} />
      <Stack.Screen name="conta" options={{ title: 'Minha conta', headerRight: () => null }} />
      <Stack.Screen name="appearance" options={{ title: 'Aparência', headerRight: () => null }} />
    </Stack>
  </ThemeProvider>;
}
export default function RootLayout() {
  return <SafeAreaProvider><AppThemeProvider><AuthProvider><OccurrenceDraftProvider><Navigation /></OccurrenceDraftProvider></AuthProvider></AppThemeProvider></SafeAreaProvider>;
}
