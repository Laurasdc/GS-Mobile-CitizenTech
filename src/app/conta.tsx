import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth/auth-context';
import { authStyles } from '../auth/auth-styles';
import { useAppTheme } from '../theme/app-theme';
export default function AccountScreen() {
  const { user, ready, error: sessionError, restore, signOut } = useAuth();
  const { colors } = useAppTheme(); const styles = authStyles(colors); const router = useRouter();
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  async function leave() {
    if (busy) return; setBusy(true); setError(null);
    try { await signOut(); router.replace('/'); }
    catch { setError('Não foi possível concluir a saída. Confira a conexão e tente novamente.'); }
    finally { setBusy(false); }
  }
  return <ScrollView style={styles.page} contentContainerStyle={styles.scroll}>
    <View style={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>Minha conta</Text>
      {!ready ? <ActivityIndicator color={colors.primary} /> : user ? <View style={styles.card}>
        <Text style={styles.title}>{user.nome}</Text><Text style={styles.body}>{user.email}</Text>
        <Text style={styles.body}>Perfil: {user.perfil === 'Gestor' ? 'Gestor' : 'Morador'}</Text>
        {user.perfil === 'Gestor' && <Pressable accessibilityRole="button" onPress={() => router.push('/gestao')} style={styles.button}><Text style={styles.buttonText}>Gerenciar ocorrências</Text></Pressable>}
        <Text style={styles.body}>Você está conectado. Já pode registrar problemas e confirmar os relatos que também afetam você.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/meus')} style={styles.button}><Text style={styles.buttonText}>Meus relatos</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/registrar')} style={styles.button}><Text style={styles.buttonText}>Registrar problema</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/explore')} style={styles.button}><Text style={styles.buttonText}>Explorar ocorrências</Text></Pressable>
        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => void leave()} style={styles.linkButton}><Text style={styles.link}>{busy ? 'Saindo…' : 'Sair da conta'}</Text></Pressable>
      </View> : <View style={styles.card}>
        <Text style={styles.body}>Entre para participar. Você pode continuar consultando as ocorrências sem criar uma conta.</Text>
        {sessionError && <><Text accessibilityRole="alert" style={styles.error}>{sessionError}</Text><Pressable accessibilityRole="button" onPress={() => void restore()} style={styles.linkButton}><Text style={styles.link}>Verificar sessão novamente</Text></Pressable></>}
        <Pressable accessibilityRole="button" onPress={() => router.replace('/entrar')} style={styles.button}><Text style={styles.buttonText}>Entrar ou criar conta</Text></Pressable>
      </View>}
    </View>
  </ScrollView>;
}
