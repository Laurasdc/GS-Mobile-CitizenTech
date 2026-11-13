import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { appFont, useAppTheme } from '../theme/app-theme';
import { useAuth } from '../auth/auth-context';
import { ThemeButton } from './theme-button';
export function AccountButton() {
  const router = useRouter(); const { user, ready } = useAuth(); const { colors } = useAppTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Pressable disabled={!ready} accessibilityRole="button" accessibilityLabel={user ? 'Abrir minha conta' : 'Entrar na minha conta'}
      onPress={() => router.push(user ? '/conta' : '/entrar')}
      style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', opacity: pressed || !ready ? 0.6 : 1 })}>
      <Text style={{ fontFamily: appFont, color: colors.primary, fontSize: 13, fontWeight: '700' }}>{user ? 'Conta' : 'Entrar'}</Text>
    </Pressable><ThemeButton />
  </View>;
}
