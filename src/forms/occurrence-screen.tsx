import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useAuth } from '../auth/auth-context';
import { useOccurrenceDraft } from '../forms/occurrence-draft';
import { validateOccurrence, type FieldErrors } from '../forms/occurrence-validation';
import { unidadesFederativas } from '../constants/localidades';
import { ApiError } from '../services/api';
import { criarOcorrencia, editarOcorrencia, obterOcorrencia } from '../services/ocorrencias';
import { categoriasLabel, type OcorrenciaDetalhe } from '../types/ocorrencia';
import { appFont, useAppTheme, type AppColors } from '../theme/app-theme';

type TextField = 'titulo' | 'descricao' | 'cidade' | 'bairro' | 'localizacao';
export default function OccurrenceFormScreen({ occurrenceId }: { occurrenceId?: string }) {
  const editing = occurrenceId !== undefined;
  const { colors } = useAppTheme(); const s = styles(colors); const router = useRouter();
  const { user, ready, error: sessionError, restore } = useAuth();
  const { fields, update, initialize, clear } = useOccurrenceDraft(editing ? `editar:${occurrenceId}` : 'novo');
  const [load, setLoad] = useState<{ key: string; status: 'loading' | 'ready' | 'forbidden' | 'closed' | 'error'; message?: string } | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const userId = user?.id;
  const loadKey = `${userId}:${occurrenceId}`;
  const currentLoad = load?.key === loadKey ? load : null;
  const { width, fontScale } = useWindowDimensions(); const wide = width >= 800 && fontScale < 1.5;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const scroll = useRef<{ scrollTo: (options: { y: number; animated: boolean }) => void } | null>(null);
  const inputs = useRef<Partial<Record<TextField, { focus: () => void } | null>>>({});
  useFocusEffect(useCallback(() => {
    if (user) { setMessage(null); setUncertain(false); }
  }, [user]));
  useFocusEffect(useCallback(() => {
    if (!occurrenceId || !userId) return;
    const controller = new AbortController();
    const key = `${userId}:${occurrenceId}`;
    setLoad({ key, status: 'loading' });
    obterOcorrencia(occurrenceId, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (data.usuarioId !== userId) { setLoad({ key, status: 'forbidden' }); return; }
      if (data.status === 'Encerrada') { setLoad({ key, status: 'closed' }); return; }
      initialize({ titulo: data.titulo, descricao: data.descricao, categoria: data.categoria,
        uf: data.uf, cidade: data.cidade, bairro: data.bairro, localizacao: data.localizacao });
      setLoad({ key, status: 'ready' });
    }).catch(cause => {
      if (!controller.signal.aborted) setLoad({ key, status: 'error', message: cause instanceof TypeError ? 'Não foi possível carregar este relato. Confira a conexão e tente novamente.' : cause instanceof Error ? cause.message : 'Não foi possível carregar o relato.' });
    });
    return () => controller.abort();
    // O contador permite repetir a consulta sem trocar de relato ou conta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occurrenceId, userId, initialize, loadAttempt]));
  function details(updated = false) {
    if (occurrenceId) router.dismissTo({ pathname: '/ocorrencias/[id]', params: { id: occurrenceId, editado: updated ? '1' : '0', registrado: '0' } });
  }
  function change(key: keyof typeof fields, value: string) {
    update(key, value); setErrors(current => ({ ...current, [key]: undefined }));
    setMessage(null);
  }
  function login() { router.push({ pathname: '/entrar', params: { returnTo: editing ? `/editar/${occurrenceId}` : '/registrar' } }); }
  async function submit() {
    if (pending.current || !ready) return;
    if (!user) { login(); return; }
    if (editing && currentLoad?.status !== 'ready') return;
    const invalid = validateOccurrence(fields); setErrors(invalid); setMessage(null); setUncertain(false);
    if (Object.keys(invalid).length || !fields.categoria) {
      setMessage('Confira os campos indicados antes de enviar.');
      scroll.current?.scrollTo({ y: 0, animated: true });
      const first = (['titulo', 'descricao', 'cidade', 'bairro', 'localizacao'] as const).find(key => invalid[key]);
      if (first) inputs.current[first]?.focus();
      return;
    }
    pending.current = true; setSaving(true);
    try {
      const request = {
        titulo: fields.titulo.trim(), categoria: fields.categoria, descricao: fields.descricao.trim(),
        uf: fields.uf, cidade: fields.cidade.trim(), bairro: fields.bairro.trim(), localizacao: fields.localizacao.trim(),
      };
      const result: OcorrenciaDetalhe = editing && occurrenceId
        ? await editarOcorrencia(occurrenceId, request) : await criarOcorrencia(request);
      clear(); setErrors({});
      if (editing) details(true);
      else router.replace({ pathname: '/ocorrencias/[id]', params: { id: result.id, registrado: '1' } });
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setMessage('Sua sessão terminou. Entre novamente para continuar. Os campos foram mantidos.');
        login();
      } else if (!(cause instanceof ApiError) || cause.status >= 500) {
        setUncertain(true);
        setMessage(editing ? 'Não foi possível confirmar o salvamento. Confira os detalhes antes de tentar novamente. Seus campos foram mantidos.' : 'Não foi possível confirmar o envio. Confira a lista antes de tentar novamente, para evitar um relato repetido. Seus campos foram mantidos nesta aba.');
      } else setMessage(cause.message);
    } finally { pending.current = false; setSaving(false); }
  }
  function input(key: TextField, label: string, placeholder: string, max: number, multiline = false) {
    return <View style={s.field} key={key}>
      <Text style={s.label}>{label}</Text>
      <TextInput ref={node => { inputs.current[key] = node; }} accessibilityLabel={label} accessibilityHint={errors[key]} value={fields[key]}
        onChangeText={value => change(key, value)} placeholder={placeholder} placeholderTextColor={colors.subtle}
        maxLength={max} multiline={multiline} numberOfLines={multiline ? 4 : 1} editable={!saving}
        autoCapitalize="sentences" style={[s.input, multiline && s.multiline, !!errors[key] && s.invalid]} />
      {errors[key] && <Text style={s.error}>{errors[key]}</Text>}
      {(key === 'titulo' || key === 'descricao') && <Text style={s.helper}>{fields[key].length}/{max} caracteres</Text>}
    </View>;
  }
  return <KeyboardAvoidingView style={s.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={node => { scroll.current = node; }} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
      <View style={s.content}>
        <Text accessibilityRole="header" style={s.title}>{editing ? 'Editar seu relato' : 'Vamos cuidar do seu bairro?'}</Text>
        <Text style={s.body}>{editing ? 'Corrija as informações do problema. Todos os campos são obrigatórios.' : 'Conte o que aconteceu e onde. Todos os campos são obrigatórios.'}</Text>
        {!ready ? <ActivityIndicator color={colors.primary} accessibilityLabel="Verificando sua sessão" /> : !user ? <View style={s.card}>
          <Text accessibilityRole="header" style={s.sectionTitle}>{editing ? 'Entre para editar seu relato' : 'Entre para registrar um problema'}</Text>
          <Text style={s.body}>O relato fica vinculado à sua conta. Depois de entrar, você volta para este formulário.</Text>
          {sessionError && <><Text style={s.error} accessibilityRole="alert">{sessionError}</Text>
            <Pressable accessibilityRole="button" onPress={() => void restore()} style={s.linkButton}><Text style={s.link}>Verificar sessão novamente</Text></Pressable></>}
          <Pressable accessibilityRole="button" onPress={login} style={s.button}><Text style={s.buttonText}>Entrar ou criar conta</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/explore')} style={s.linkButton}><Text style={s.link}>Consultar ocorrências sem entrar</Text></Pressable>
        </View> : editing && currentLoad?.status !== 'ready' ? <View style={s.card}>
          {!currentLoad || currentLoad.status === 'loading' ? <><ActivityIndicator color={colors.primary} /><Text style={s.body}>Carregando seu relato…</Text></>
            : <>
              <Text accessibilityRole="alert" style={s.sectionTitle}>{currentLoad.status === 'forbidden' ? 'Este relato pertence a outra conta' : currentLoad.status === 'closed' ? 'Este relato está encerrado' : 'Não foi possível abrir o relato'}</Text>
              <Text style={s.body}>{currentLoad.status === 'forbidden' ? 'Você pode editar somente os relatos que registrou com esta conta.' : currentLoad.status === 'closed' ? 'Ocorrências encerradas não podem ser editadas. Os dados e o histórico continuam disponíveis nos detalhes.' : currentLoad.message}</Text>
              {currentLoad.status === 'error' && <Pressable accessibilityRole="button" onPress={() => setLoadAttempt(v => v + 1)} style={s.button}><Text style={s.buttonText}>Tentar novamente</Text></Pressable>}
              <Pressable accessibilityRole="button" onPress={() => details()} style={s.linkButton}><Text style={s.link}>Ver detalhes da ocorrência</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => router.replace('/meus')} style={s.linkButton}><Text style={s.link}>Ir para meus relatos</Text></Pressable>
            </>}
        </View> : <>
          <View style={s.account}><Text style={s.body}>{editing ? 'Editando como ' : 'Registrando como '}<Text style={s.accountName}>{user.nome}</Text></Text></View>
          <View style={s.card}>
            <Text accessibilityRole="header" style={s.sectionTitle}>1. Sobre o problema</Text>
            {input('titulo', 'Título do problema', 'Ex.: poste apagado perto do ponto de ônibus', 120)}
            <View style={s.field}>
              <Text style={s.label}>Tipo de problema</Text>
              <View style={[s.pickerBox, !!errors.categoria && s.invalid]}>
                <Picker accessibilityLabel="Tipo de problema" enabled={!saving} selectedValue={fields.categoria}
                  onValueChange={value => change('categoria', String(value))} style={s.picker} dropdownIconColor={colors.text} itemStyle={s.pickerItem}>
                  <Picker.Item label="Selecione uma categoria" value="" />
                  {Object.entries(categoriasLabel).map(([value, label]) => <Picker.Item key={value} value={value} label={label} />)}
                </Picker>
              </View>
              {errors.categoria && <Text style={s.error}>{errors.categoria}</Text>}
            </View>
            {input('descricao', 'O que está acontecendo?', 'Descreva o problema e como ele afeta o local.', 2000, true)}
          </View>
          <View style={s.card}>
            <Text accessibilityRole="header" style={s.sectionTitle}>2. Onde aconteceu?</Text>
            <View style={[s.row, { flexDirection: wide ? 'row' : 'column' }]}>
              <View style={s.field}>
                <Text style={s.label}>Estado</Text>
                <View style={[s.pickerBox, !!errors.uf && s.invalid]}>
                  <Picker accessibilityLabel="Estado da ocorrência" enabled={!saving} selectedValue={fields.uf}
                    onValueChange={value => change('uf', String(value))} style={s.picker} dropdownIconColor={colors.text} itemStyle={s.pickerItem}>
                    <Picker.Item label="Selecione o estado" value="" />
                    {unidadesFederativas.map(uf => <Picker.Item key={uf.sigla} label={`${uf.nome} (${uf.sigla})`} value={uf.sigla} />)}
                  </Picker>
                </View>
                {errors.uf && <Text style={s.error}>{errors.uf}</Text>}
              </View>
              {input('cidade', 'Cidade', 'Ex.: São Paulo', 100)}
              {input('bairro', 'Bairro', 'Ex.: Chácara Klabin', 100)}
            </View>
            {input('localizacao', 'Endereço ou ponto de referência', 'Ex.: Rua das Flores, em frente ao número 100', 250, true)}
            <Text style={s.helper}>Informe o local do problema. Evite incluir dados pessoais na descrição ou no endereço.</Text>
          </View>
          <View style={s.card}>
            <Text style={s.body}>{editing ? 'A edição corrige os dados do relato. A situação, as confirmações e o histórico de acompanhamento são mantidos.' : 'Ao enviar, o relato aparece na lista com a situação “Registrada”. Você poderá acompanhar as atualizações nos detalhes.'}</Text>
            {message && <Text style={s.error} accessibilityRole="alert">{message}</Text>}
            {uncertain && <Pressable accessibilityRole="button" onPress={() => editing ? details() : router.push('/explore')} style={s.linkButton}><Text style={s.link}>{editing ? 'Conferir os detalhes antes de salvar novamente' : 'Conferir ocorrências antes de reenviar'}</Text></Pressable>}
            <Pressable accessibilityRole="button" disabled={saving} accessibilityState={{ disabled: saving, busy: saving }}
              onPress={() => void submit()} style={({ pressed }) => [s.button, (saving || pressed) && s.pressed]}>
              {saving ? <ActivityIndicator color={colors.onPrimary} accessibilityLabel="Enviando relato" /> : <Text style={s.buttonText}>{editing ? 'Salvar alterações' : 'Enviar relato'}</Text>}
            </Pressable>
            <Pressable accessibilityRole="button" disabled={saving} onPress={() => { if (editing) { clear(); details(); } else router.replace('/explore'); }} style={s.linkButton}><Text style={s.link}>{editing ? 'Cancelar e voltar aos detalhes' : 'Voltar à lista'}</Text></Pressable>
          </View>
        </>}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = (c: AppColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background },
  scroll: { alignItems: 'center', padding: 20, paddingBottom: 48 },
  content: { width: '100%', maxWidth: 900, gap: 20, paddingVertical: 12 },
  title: { fontFamily: appFont, color: c.text, fontWeight: '700', fontSize: 30, lineHeight: 38 },
  body: { fontFamily: appFont, color: c.muted, fontSize: 15, lineHeight: 24 },
  sectionTitle: { fontFamily: appFont, color: c.text, fontWeight: '700', fontSize: 20, lineHeight: 28 },
  card: { padding: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, gap: 20 },
  account: { backgroundColor: c.tint, borderRadius: 10, padding: 14 },
  accountName: { fontWeight: '700', color: c.text },
  row: { gap: 16 }, field: { flexGrow: 1, flexShrink: 1, minWidth: 0, flexBasis: 'auto', gap: 8 },
  label: { fontFamily: appFont, color: c.text, fontSize: 14, fontWeight: '600' },
  input: { fontFamily: appFont, fontSize: 16, color: c.text, backgroundColor: c.input, minHeight: 50, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 10, padding: 13 },
  multiline: { minHeight: 112, textAlignVertical: 'top' },
  pickerBox: { backgroundColor: c.input, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 10, overflow: 'hidden' },
  picker: { fontFamily: appFont, fontSize: 16, color: c.text, backgroundColor: c.input, minHeight: 50, width: '100%', borderWidth: 0 },
  pickerItem: { color: c.text, fontFamily: appFont },
  invalid: { borderColor: c.danger },
  helper: { fontFamily: appFont, color: c.subtle, fontSize: 12, lineHeight: 20 },
  error: { fontFamily: appFont, color: c.danger, fontSize: 14, lineHeight: 22 },
  button: { minHeight: 52, padding: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary, borderRadius: 12 },
  buttonText: { fontFamily: appFont, fontSize: 16, fontWeight: '700', color: c.onPrimary, textAlign: 'center' },
  linkButton: { minHeight: 44, justifyContent: 'center', paddingVertical: 10 },
  link: { fontFamily: appFont, color: c.primary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.6 },
});
