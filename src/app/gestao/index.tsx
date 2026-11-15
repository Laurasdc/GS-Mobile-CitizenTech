import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../auth/auth-context';
import { GestorGate } from '../../management/gestor-gate';
import { managementStyles } from '../../management/styles';
import { listarOcorrencias } from '../../services/ocorrencias';
import { useAppTheme } from '../../theme/app-theme';
import { categoriasLabel, statusLabel, type OcorrenciaResumo, type StatusOcorrencia } from '../../types/ocorrencia';
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function ManagementScreen() {
  const { user } = useAuth(); const { colors } = useAppTheme(); const s = managementStyles(colors);
  const [result, setResult] = useState<{ owner: string; revision: number; items: OcorrenciaResumo[]; error?: string } | null>(null);
  const [refresh, setRefresh] = useState(0); const [filter, setFilter] = useState<StatusOcorrencia | ''>(''); const [search, setSearch] = useState('');
  const managerId = user?.perfil === 'Gestor' ? user.id : null;
  useFocusEffect(useCallback(() => {
    if (!managerId) return;
    const controller = new AbortController();
    listarOcorrencias(controller.signal).then(items => {
      if (!controller.signal.aborted) setResult({ owner: managerId, revision: refresh, items: [...items].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm)) });
    }).catch(() => { if (!controller.signal.aborted) setResult({ owner: managerId, revision: refresh, items: [], error: 'Não foi possível carregar os relatos. Confira a conexão e tente novamente.' }); });
    return () => controller.abort();
  }, [managerId, refresh]));
  const current = result?.owner === managerId && result.revision === refresh ? result : null;
  const items = current?.items ?? [];
  const matching = items.filter(o => (!filter || o.status === filter) && normalize(`${o.titulo} ${o.uf} ${o.cidade} ${o.bairro}`).includes(normalize(search.trim())));
  function reload() { setResult(null); setRefresh(v => v + 1); }
  return <GestorGate><ScrollView style={s.page} contentContainerStyle={s.scroll}><View style={s.content}>
    <Text style={s.eyebrow}>ÁREA DE GESTÃO</Text>
    <Text accessibilityRole="header" style={s.title}>Acompanhe os relatos da comunidade</Text>
    <Text style={s.body}>Escolha um relato, atualize a situação e explique o que mudou. A justificativa ficará visível no histórico para os moradores.</Text>
    <View style={s.card}>
      <Text accessibilityRole="header" style={s.heading}>Encontre o que precisa de atenção</Text>
      <View style={s.row}>
        {(['', ...Object.keys(statusLabel)] as (StatusOcorrencia | '')[]).map(status => <Pressable key={status} accessibilityRole="button" accessibilityState={{ selected: filter === status }}
          onPress={() => setFilter(status)} style={[s.chip, filter === status && s.selected]}>
          <Text style={s.label}>{status ? statusLabel[status] : 'Todas'} ({status ? items.filter(o => o.status === status).length : items.length})</Text>
        </Pressable>)}
      </View>
      <Text style={s.label}>Buscar por título ou região</Text>
      <TextInput accessibilityLabel="Buscar por título ou região" value={search} onChangeText={setSearch} placeholder="Ex.: poste, Campinas ou Centro" placeholderTextColor={colors.subtle} style={s.input} maxLength={150} />
    </View>
    <View style={s.spread}><Text accessibilityRole="header" style={s.heading}>Relatos para acompanhar</Text>
      <Pressable accessibilityRole="button" onPress={reload} style={s.secondary}><Text style={s.link}>Atualizar lista</Text></Pressable></View>
    {!current ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando relatos" /> : current.error ? <View style={s.card}><Text accessibilityRole="alert" style={s.error}>{current.error}</Text><Pressable accessibilityRole="button" onPress={reload} style={s.button}><Text style={s.buttonText}>Tentar novamente</Text></Pressable></View> : <>
      <Text accessibilityLiveRegion="polite" style={s.small}>{matching.length} {matching.length === 1 ? 'relato encontrado' : 'relatos encontrados'} · Atualizados mais recentemente primeiro</Text>
      {!matching.length && <View style={s.card}><Text style={s.body}>{items.length ? 'Nenhum relato corresponde à busca. Tente outra região ou situação.' : 'Ainda não há relatos cadastrados para acompanhar.'}</Text></View>}
      {matching.map(o => <View key={o.id} style={s.card}>
        <View style={s.row}><View style={s.badge}><Text style={s.badgeText}>{statusLabel[o.status]}</Text></View><Text style={s.small}>{categoriasLabel[o.categoria]}</Text></View>
        <Text accessibilityRole="header" style={s.heading}>{o.titulo}</Text><Text style={s.body}>{o.bairro} · {o.cidade} / {o.uf}</Text>
        <View style={s.row}><Link href={{ pathname: '/gestao/[id]', params: { id: o.id } }} asChild><Pressable accessibilityLabel={`Atualizar situação: ${o.titulo}`} style={s.button}><Text style={s.buttonText}>{o.status === 'Encerrada' ? 'Consultar ou reabrir' : 'Atualizar situação'}</Text></Pressable></Link>
          <Link href={{ pathname: '/ocorrencias/[id]', params: { id: o.id } }} asChild><Pressable style={s.secondary}><Text style={s.link}>Ver relato completo →</Text></Pressable></Link></View>
      </View>)}
    </>}
  </View></ScrollView></GestorGate>;
}
