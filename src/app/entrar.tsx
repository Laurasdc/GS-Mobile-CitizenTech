import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/auth-context';
import { authStyles } from '../auth/auth-styles';
import { returnPath } from '../auth/return-path';
import { solicitarApi } from '../services/api';
import { useAppTheme } from '../theme/app-theme';

export default function LoginScreen() {
  const { colors } = useAppTheme(); const styles = authStyles(colors);
  const { user, signIn, ready } = useAuth(); const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const retorno = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  const loginMessage = retorno === '/registrar' ? 'Entre para registrar um problema. Depois você volta ao formulário para preencher ou revisar seu relato.'
    : retorno?.startsWith('/gestao') ? 'Entre com uma conta de gestor para acompanhar e atualizar as ocorrências.'
    : retorno === '/meus' ? 'Entre para consultar os relatos que você registrou com sua conta.'
    : retorno?.startsWith('/editar/') ? 'Entre para editar seu relato. Depois você volta ao formulário com os campos mantidos.'
    : retorno ? 'Entre para participar. Depois você volta ao relato e pode confirmar que também é afetado.'
    : 'Consultar é livre. Entre para registrar problemas e participar da sua comunidade.';
  const [creating, setCreating] = useState(false); const [nome, setNome] = useState('');
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState(''); const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit() {
    if (busy || !ready) return;
    setError(null);
    if (!email.trim() || !senha || (creating && !nome.trim())) { setError('Preencha os campos para continuar.'); return; }
    if (creating && senha !== confirmacao) { setError('As senhas precisam ser iguais.'); return; }
    if (creating && (senha.length < 8 || senha.length > 128)) { setError('Use uma senha entre 8 e 128 caracteres.'); return; }
    setBusy(true);
    try {
      if (creating) {
        await solicitarApi('/auth/registrar', { method: 'POST', body: { nome: nome.trim(), email: email.trim(), senha } });
        setCreating(false);
      }
      await signIn(email, senha);
      setSenha(''); setConfirmacao('');
      router.dismissTo(returnPath(returnTo));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível entrar. Tente novamente.'); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header">{creating ? 'Crie sua conta' : 'Que bom ter você aqui'}</Text>
        <Text style={styles.body}>{loginMessage}</Text>
        {user ? <View style={styles.card}>
          <Text style={styles.body}>Você já está conectado como {user.nome}.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.dismissTo(returnPath(returnTo))} style={styles.button}><Text style={styles.buttonText}>Continuar</Text></Pressable>
        </View> : <View style={styles.card}>
          {creating && <View style={styles.field}><Text style={styles.label}>Seu nome</Text>
            <TextInput accessibilityLabel="Seu nome" value={nome} onChangeText={setNome} maxLength={100} autoComplete="name" textContentType="name" editable={!busy} style={styles.input} />
          </View>}
          <View style={styles.field}><Text style={styles.label}>E-mail</Text>
            <TextInput accessibilityLabel="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" maxLength={254} editable={!busy} style={styles.input} />
          </View>
          <View style={styles.field}><Text style={styles.label}>Senha</Text>
            <TextInput accessibilityLabel="Senha" value={senha} onChangeText={setSenha} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} autoComplete={creating ? 'new-password' : 'current-password'} textContentType={creating ? 'newPassword' : 'password'} maxLength={128} editable={!busy} style={styles.input} onSubmitEditing={creating ? undefined : () => void submit()} />
            {creating && <Text style={styles.body}>Pelo menos 8 caracteres.</Text>}
          </View>
          {creating && <View style={styles.field}><Text style={styles.label}>Repita a senha</Text>
            <TextInput accessibilityLabel="Repita a senha" value={confirmacao} onChangeText={value => { setConfirmacao(value); setError(null); }} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!busy} style={styles.input} onSubmitEditing={() => void submit()} />
          </View>}
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: visible }} accessibilityHint={creating ? "Mostra ou oculta os dois campos de senha" : "Mostra ou oculta sua senha"} onPress={() => setVisible(v => !v)} style={styles.linkButton}><Text style={styles.link}>{creating ? (visible ? 'Ocultar senhas' : 'Mostrar senhas') : (visible ? 'Ocultar senha' : 'Mostrar senha')}</Text></Pressable>
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Pressable accessibilityRole="button" disabled={busy || !ready} accessibilityState={{ disabled: busy || !ready, busy }}
            onPress={() => void submit()} style={({ pressed }) => [styles.button, (pressed || busy || !ready) && styles.disabled]}>
            {busy ? <ActivityIndicator color={colors.onPrimary} accessibilityLabel="Aguarde" /> : <Text style={styles.buttonText}>{creating ? 'Criar conta e entrar' : 'Entrar'}</Text>}
          </Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setCreating(v => !v); setError(null); setConfirmacao(''); }} style={styles.linkButton}>
            <Text style={styles.link}>{creating ? 'Já tenho conta. Quero entrar' : 'Ainda não tenho conta. Criar conta'}</Text>
          </Pressable>
        </View>}
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => router.replace('/explore')} style={styles.linkButton}><Text style={styles.link}>Continuar consultando sem entrar</Text></Pressable>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
