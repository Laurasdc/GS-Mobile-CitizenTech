import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/auth-context';
import { listarMinhasOcorrencias } from '../../services/ocorrencias';
import { categoriasLabel, statusLabel, type OcorrenciaResumo } from '../../types/ocorrencia';
import { appFont, useAppTheme, type AppColors } from '../../theme/app-theme';

type Result = { owner: string; state: 'loading' | 'success' | 'error'; items: OcorrenciaResumo[]; error?: string };
export default function MyReportsScreen() {
  const { colors } = useAppTheme(); const s = styles(colors); const router = useRouter();
  const { user, ready } = useAuth(); const owner = user?.id;
  const [result, setResult] = useState<Result | null>(null); const [attempt, setAttempt] = useState(0);
  const current = result?.owner === owner ? result : null;
  useFocusEffect(useCallback(() => {
    if (!owner) return;
    const controller = new AbortController();
    setResult({ owner, state: 'loading', items: [] });
    listarMinhasOcorrencias(controller.signal).then(items => {
      if (!controller.signal.aborted) setResult({ owner, state: 'success', items });
    }).catch(cause => {
      if (!controller.signal.aborted) setResult({ owner, state: 'error', items: [], error: cause instanceof TypeError ? 'Não foi possível carregar seus relatos. Confira a conexão e tente novamente.' : cause instanceof Error ? cause.message : 'Não foi possível carregar seus relatos.' });
    });
    return () => controller.abort();
    // O contador atualiza a lista mantendo a mesma conta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, attempt]));
  return <ScrollView style={s.page} contentContainerStyle={s.scroll}>
    <View style={s.content}>
      <Text style={s.title} accessibilityRole="header">Meus relatos</Text>
      <Text style={s.body}>Veja o que você registrou e acompanhe as atualizações. Você pode corrigir as informações enquanto o relato não estiver encerrado.</Text>
      {!ready ? <ActivityIndicator color={colors.primary} /> : !user ? <View style={s.card}>
        <Text style={s.cardTitle}>Seus relatos ficam ligados à sua conta</Text>
        <Text style={s.body}>Entre para encontrar os problemas que você registrou. A consulta da comunidade continua disponível sem login.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/entrar', params: { returnTo: '/meus' } })} style={s.button}><Text style={s.buttonText}>Entrar para ver meus relatos</Text></Pressable>
        <Link href="/explore" style={s.link}>Consultar relatos da comunidade</Link>
      </View> : <>
        <View style={s.actions}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/registrar')} style={s.button}><Text style={s.buttonText}>Registrar problema</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={current?.state === 'loading'} onPress={() => setAttempt(v => v + 1)} style={s.linkButton}><Text style={s.link}>Atualizar meus relatos</Text></Pressable>
        </View>
        {!current || current.state === 'loading' ? <View style={s.card}><ActivityIndicator color={colors.primary} /><Text style={s.body}>Buscando seus relatos…</Text></View>
          : current.state === 'error' ? <View style={s.card}><Text style={s.error} accessibilityRole="alert">{current.error}</Text><Pressable accessibilityRole="button" onPress={() => setAttempt(v => v + 1)} style={s.linkButton}><Text style={s.link}>Tentar novamente</Text></Pressable></View>
          : current.items.length === 0 ? <View style={s.card}><Text style={s.cardTitle}>Você ainda não registrou um problema</Text><Text style={s.body}>Quando enviar seu primeiro relato, ele aparecerá aqui.</Text></View>
          : <>
            <Text style={s.body}>{current.items.length} {current.items.length === 1 ? 'relato seu' : 'relatos seus'}</Text>
            {current.items.map(item => <View key={item.id} style={s.card}>
              <View style={s.actions}><View style={s.badge}><Text style={s.badgeText}>{categoriasLabel[item.categoria]}</Text></View><View style={s.badge}><Text style={s.badgeText}>{statusLabel[item.status]}</Text></View></View>
              <Text style={s.cardTitle} accessibilityRole="header">{item.titulo}</Text>
              <Text style={s.body}>{item.bairro} · {item.cidade} / {item.uf}</Text>
              <Text style={s.helper}>Atualizado em {date(item.atualizadoEm)}</Text>
              <View style={s.actions}>
                <Link href={{ pathname: '/ocorrencias/[id]', params: { id: item.id } }} asChild><Pressable accessibilityLabel={`Ver detalhes: ${item.titulo}`} style={s.linkButton}><Text style={s.link}>Ver detalhes →</Text></Pressable></Link>
                {item.status !== 'Encerrada' ? <Link href={{ pathname: '/editar/[id]', params: { id: item.id } }} asChild><Pressable accessibilityLabel={`Editar relato: ${item.titulo}`} style={s.secondaryButton}><Text style={s.link}>Editar relato</Text></Pressable></Link>
                  : <Text style={s.helper}>Edição indisponível para relato encerrado.</Text>}
              </View>
            </View>)}
          </>}
      </>}
    </View>
  </ScrollView>;
}
function date(value: string) {
  const parsed = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`);
  return Number.isNaN(parsed.getTime()) ? 'data indisponível' : parsed.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
const styles = (c: AppColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background }, scroll: { alignItems: 'center', padding: 24, paddingBottom: 48 },
  content: { width: '100%', maxWidth: 1000, gap: 20 },
  title: { fontFamily: appFont, color: c.text, fontSize: 30, lineHeight: 38, fontWeight: '700' },
  body: { fontFamily: appFont, color: c.muted, fontSize: 15, lineHeight: 24 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 22, gap: 14 },
  cardTitle: { fontFamily: appFont, color: c.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  badge: { backgroundColor: c.tint, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 10 },
  badgeText: { fontFamily: appFont, color: c.tintText, fontSize: 12, fontWeight: '600' },
  button: { backgroundColor: c.primary, borderRadius: 12, minHeight: 48, padding: 14, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' },
  buttonText: { fontFamily: appFont, color: c.onPrimary, fontSize: 15, fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: c.inputBorder, borderRadius: 10, minHeight: 44, padding: 12, justifyContent: 'center' },
  linkButton: { minHeight: 44, justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 6 },
  link: { fontFamily: appFont, color: c.primary, fontSize: 14, lineHeight: 22, fontWeight: '600' },
  helper: { fontFamily: appFont, color: c.subtle, fontSize: 12, lineHeight: 20 },
  error: { fontFamily: appFont, color: c.danger, fontSize: 15, lineHeight: 24 },
});
