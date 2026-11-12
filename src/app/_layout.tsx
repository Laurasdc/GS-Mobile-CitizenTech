import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppThemeProvider, appFont, useAppTheme } from '../theme/app-theme';
import { ThemeButton } from '../components/theme-button';

function Navigation() {
  const { colors, isDark } = useAppTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  return <ThemeProvider value={{ ...base, colors: { ...base.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary } }}>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '700', fontFamily: appFont }, headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background }, headerRight: () => <ThemeButton /> }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ocorrencias/[id]" options={{ title: 'Detalhes da ocorrência' }} />
      <Stack.Screen name="appearance" options={{ title: 'Aparência', headerRight: () => null }} />
    </Stack>
  </ThemeProvider>;
}
export default function RootLayout() {
  return <SafeAreaProvider><AppThemeProvider><Navigation /></AppThemeProvider></SafeAreaProvider>;
}
