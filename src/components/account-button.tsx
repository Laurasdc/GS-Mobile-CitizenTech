import { useRouter } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { appFont, useAppTheme } from '../theme/app-theme';
import { useAuth } from '../auth/auth-context';
import { ThemeButton } from './theme-button';
export function AccountButton() {
  const router = useRouter(); const { user, ready } = useAuth(); const { colors } = useAppTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    {Platform.OS === 'web' && ready && user?.perfil === 'Gestor' && <Pressable accessibilityRole="button" accessibilityLabel="Abrir gestão de ocorrências" onPress={() => router.push('/gestao')}
      style={{ minHeight: 44, paddingHorizontal: 10, justifyContent: 'center' }}><Text style={{ fontFamily: appFont, color: colors.primary, fontSize: 13, fontWeight: '700' }}>Gestão</Text></Pressable>}
    <Pressable disabled={!ready} accessibilityRole="button" accessibilityLabel={user ? 'Abrir minha conta' : 'Entrar na minha conta'}
      onPress={() => router.push(user ? '/conta' : '/entrar')}
      style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', opacity: pressed || !ready ? 0.6 : 1 })}>
      <Text style={{ fontFamily: appFont, color: colors.primary, fontSize: 13, fontWeight: '700' }}>{user ? 'Conta' : 'Entrar'}</Text>
    </Pressable>{Platform.OS === 'web' ? <ThemeButton /> : <Pressable accessibilityRole="button" accessibilityLabel="Escolher aparência" onPress={() => router.push('/appearance')} style={{ minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20, color: colors.primary }}>◐</Text></Pressable>}
  </View>;
}
