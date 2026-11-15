import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth/auth-context';
import { useAppTheme } from '../theme/app-theme';
import { managementStyles } from './styles';
export function GestorGate({ children, returnTo = '/gestao' }: { children: ReactNode; returnTo?: string }) {
  const { user, ready, error, restore } = useAuth();
  const { colors } = useAppTheme(); const s = managementStyles(colors); const router = useRouter();
  if (ready && user?.perfil === 'Gestor') return children;
  return <ScrollView style={s.page} contentContainerStyle={s.scroll}><View style={s.content}>
    {!ready ? <ActivityIndicator color={colors.primary} accessibilityLabel="Verificando acesso" /> : <View style={s.card}>
      <Text accessibilityRole="header" style={s.heading}>{user ? 'Área exclusiva para gestores' : 'Entre com uma conta de gestor'}</Text>
      <Text style={s.body}>{user ? 'Sua conta tem perfil de morador. Você pode registrar problemas, acompanhar seus relatos e confirmar os de outros moradores.' : 'É necessário entrar para gerenciar as situações e publicar atualizações das ocorrências.'}</Text>
      {error && <><Text accessibilityRole="alert" style={s.error}>{error}</Text><Pressable accessibilityRole="button" onPress={() => void restore()} style={s.secondary}><Text style={s.link}>Verificar sessão novamente</Text></Pressable></>}
      {!user && <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/entrar', params: { returnTo } })} style={s.button}><Text style={s.buttonText}>Entrar para gerenciar</Text></Pressable>}
      <Pressable accessibilityRole="button" onPress={() => router.replace('/explore')} style={s.secondary}><Text style={s.link}>Explorar ocorrências</Text></Pressable>
    </View>}
  </View></ScrollView>;
}
