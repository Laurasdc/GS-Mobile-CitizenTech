import { Tabs } from 'expo-router';
import { appFont, useAppTheme } from '../../theme/app-theme';
import { ThemeButton } from '../../components/theme-button';
export default function TabLayout() {
  const { colors } = useAppTheme();
  return <Tabs screenOptions={{
    headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700', fontFamily: appFont }, headerShadowVisible: false,
    headerRight: () => <ThemeButton />,
    tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    tabBarLabelStyle: { fontSize: 13, fontWeight: '600', fontFamily: appFont },
    tabBarIcon: () => null, tabBarIconStyle: { display: 'none' },
    sceneStyle: { backgroundColor: colors.background },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Bairro em Dia', tabBarLabel: 'Início', tabBarAccessibilityLabel: 'Abrir início' }} />
    <Tabs.Screen name="explore" options={{ title: 'Ocorrências', tabBarLabel: 'Buscar ocorrências', tabBarAccessibilityLabel: 'Buscar ocorrências' }} />
  </Tabs>;
}
