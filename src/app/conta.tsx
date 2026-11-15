import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/auth-context';
import { authStyles } from '../auth/auth-styles';
import { appFont, useAppTheme, type AppColors } from '../theme/app-theme';
export default function AccountScreen() {
  const { user, ready, error: sessionError, restore, signOut } = useAuth();
  const { colors } = useAppTheme(); const s = styles(colors); const auth = authStyles(colors); const router = useRouter();
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  async function leave() {
    if (busy) return; setBusy(true); setError(null);
    try { await signOut(); router.replace('/'); }
    catch { setError('Não foi possível concluir a saída. Confira a conexão e tente novamente.'); }
    finally { setBusy(false); }
  }
  function action(path: Href, title: string, description: string, primary = false) {
    return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={busy} onPress={() => router.push(path)} style={({ pressed }) => [s.option, primary && s.primary, pressed && { opacity: 0.7 }]}>
      <Text style={[s.optionTitle, primary && s.onPrimary]}>{title} →</Text><Text style={[s.description, primary && s.onPrimary]}>{description}</Text>
    </Pressable>;
  }
  return <ScrollView style={auth.page} contentContainerStyle={auth.scroll}><View style={s.content}>
    <Text accessibilityRole="header" style={auth.title}>Minha conta</Text>
    {!ready ? <ActivityIndicator color={colors.primary} /> : user ? <>
      <View style={s.profile}><Text style={s.name}>{user.nome}</Text><Text style={auth.body}>{user.email}</Text><Text style={s.badge}>Perfil: {user.perfil === 'Gestor' ? 'Gestor' : 'Morador'}</Text></View>
      <Text accessibilityRole="header" style={s.heading}>O que você quer fazer?</Text>
      {user.perfil === 'Gestor' && action('/gestao', 'Gerenciar ocorrências', 'Consulte os relatos e publique atualizações de situação.', true)}
      {action('/registrar', 'Registrar problema', 'Conte o que aconteceu e onde o problema está.', user.perfil !== 'Gestor')}
      {action('/meus', 'Meus relatos', 'Acompanhe e edite os problemas registrados por você.')}
      {action('/explore', 'Buscar ocorrências', 'Encontre relatos da comunidade por região.')}
      {error && <Text accessibilityRole="alert" style={auth.error}>{error}</Text>}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => void leave()} style={auth.linkButton}><Text style={auth.link}>{busy ? 'Saindo…' : 'Sair da conta'}</Text></Pressable>
    </> : <View style={auth.card}>
      <Text style={auth.body}>Entre para registrar problemas e participar da comunidade. A consulta é livre.</Text>
      {sessionError && <><Text accessibilityRole="alert" style={auth.error}>{sessionError}</Text><Pressable accessibilityRole="button" onPress={() => void restore()} style={auth.linkButton}><Text style={auth.link}>Verificar sessão novamente</Text></Pressable></>}
      <Pressable accessibilityRole="button" onPress={() => router.replace('/entrar')} style={auth.button}><Text style={auth.buttonText}>Entrar ou criar conta</Text></Pressable>
    </View>}
  </View></ScrollView>;
}
const styles = (c: AppColors) => StyleSheet.create({
  content: { width: '100%', maxWidth: 760, gap: 14, paddingVertical: 12 },
  profile: { padding: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, gap: 8 },
  name: { fontFamily: appFont, color: c.text, fontSize: 24, lineHeight: 32, fontWeight: '700' },
  badge: { fontFamily: appFont, color: c.muted, fontSize: 13 },
  heading: { fontFamily: appFont, color: c.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
  option: { padding: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 12, minHeight: 76, gap: 6, justifyContent: 'center' },
  optionTitle: { fontFamily: appFont, color: c.primary, fontSize: 16, fontWeight: '700' },
  description: { fontFamily: appFont, color: c.muted, fontSize: 14, lineHeight: 22 },
  primary: { backgroundColor: c.primary, borderColor: c.primary }, onPrimary: { color: c.onPrimary },
});
