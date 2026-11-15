import { Picker } from "../../components/compact-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../auth/auth-context";
import { GestorGate } from "../../management/gestor-gate";
import { managementStyles } from "../../management/styles";
import { ApiError } from "../../services/api";
import { alterarSituacao, obterOcorrencia } from "../../services/ocorrencias";
import { useAppTheme } from "../../theme/app-theme";
import {
  categoriasLabel,
  statusLabel,
  type OcorrenciaDetalhe,
  type StatusOcorrencia,
} from "../../types/ocorrencia";
type Draft = { key: string; status: StatusOcorrencia | ""; text: string };
export default function UpdateStatusScreen() {
  const { id: param } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(param) ? param[0] : param;
  const { user, restore } = useAuth();
  const { colors } = useAppTheme();
  const s = managementStyles(colors);
  const router = useRouter();
  const managerId = user?.perfil === "Gestor" ? user.id : null;
  const key = `${managerId}:${id}`;
  const [result, setResult] = useState<{
    key: string;
    revision: number;
    data?: OcorrenciaDetalhe;
    error?: string;
  } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState<{
    key: string;
    text: string;
    success?: boolean;
    uncertain?: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const data =
    result?.key === key && result.revision === attempt
      ? result.data
      : undefined;
  const currentDraft =
    draft?.key === key ? draft : { key, status: "" as const, text: "" };
  const notice = message?.key === key ? message : null;
  const allowed = (Object.keys(statusLabel) as StatusOcorrencia[]).filter(
    (v) =>
      data &&
      v !== data.status &&
      (data.status !== "Encerrada" || v === "EmAnalise"),
  );
  const selection = allowed.includes(currentDraft.status as StatusOcorrencia)
    ? currentDraft.status
    : "";
  useFocusEffect(
    useCallback(() => {
      if (!managerId || !id) return;
      const controller = new AbortController();
      obterOcorrencia(id, controller.signal)
        .then((record) => {
          if (!controller.signal.aborted)
            setResult({ key, revision: attempt, data: record });
        })
        .catch((error) => {
          if (!controller.signal.aborted)
            setResult({
              key,
              revision: attempt,
              error:
                error instanceof ApiError && error.status === 404
                  ? "Este relato não foi encontrado."
                  : "Não foi possível carregar o relato. Confira a conexão e tente novamente.",
            });
        });
      return () => controller.abort();
    }, [managerId, id, key, attempt]),
  );
  function reload() {
    setResult(null);
    setAttempt((v) => v + 1);
  }
  async function save() {
    if (pending.current || !data || !managerId) return;
    const text = currentDraft.text.trim();
    if (!selection || !text) {
      setMessage({
        key,
        text: !selection
          ? "Escolha a nova situação."
          : "Explique a mudança para os moradores.",
      });
      return;
    }
    if (text.length > 1000) {
      setMessage({ key, text: "Use até 1.000 caracteres na justificativa." });
      return;
    }
    pending.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const latest = await obterOcorrencia(id);
      if (latest.status !== data.status) {
        setResult({ key, revision: attempt, data: latest });
        setDraft({ key, status: "", text: currentDraft.text });
        setMessage({
          key,
          text: "A situação mudou enquanto você estava nesta página. Confira a situação atual e selecione a próxima antes de salvar.",
        });
        return;
      }
      const saved = await alterarSituacao(id, selection, text);
      setResult({ key, revision: attempt, data: saved });
      setDraft(null);
      setMessage({
        key,
        text: "Atualização publicada. Os moradores já podem ver a nova situação e a justificativa no histórico.",
        success: true,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setMessage({
          key,
          text: "Sua conta não tem mais permissão para atualizar relatos.",
        });
        void restore();
      } else
        setMessage({
          key,
          text:
            error instanceof ApiError
              ? error.message
              : "Não foi possível confirmar a publicação. Confira o histórico antes de tentar novamente; a atualização pode ter sido recebida.",
          uncertain: !(error instanceof ApiError),
        });
      if (error instanceof ApiError && error.status === 401)
        router.push({
          pathname: "/entrar",
          params: { returnTo: `/gestao/${id}` },
        });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <GestorGate returnTo={`/gestao/${id}`}>
      <ScrollView
        style={s.page}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.content}>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => {
              setDraft(null);
              setMessage(null);
              router.dismissTo("/gestao");
            }}
            style={s.secondary}
          >
            <Text style={s.link}>← Voltar à gestão</Text>
          </Pressable>
          {!result || result.key !== key || result.revision !== attempt ? (
            <ActivityIndicator
              color={colors.primary}
              accessibilityLabel="Carregando relato"
            />
          ) : !data ? (
            <View style={s.card}>
              <Text accessibilityRole="alert" style={s.error}>
                {result.error}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={reload}
                style={s.button}
              >
                <Text style={s.buttonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={s.eyebrow}>ACOMPANHAMENTO DO RELATO</Text>
              <Text accessibilityRole="header" style={s.title}>
                {data.titulo}
              </Text>
              <Text style={s.body}>
                {data.bairro} · {data.cidade} / {data.uf} ·{" "}
                {categoriasLabel[data.categoria]}
              </Text>
              {notice && (
                <View style={s.notice}>
                  <Text
                    accessibilityRole={notice.success ? undefined : "alert"}
                    accessibilityLiveRegion="polite"
                    style={notice.success ? s.label : s.error}
                  >
                    {notice.text}
                  </Text>
                  {notice.uncertain && (
                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={reload}
                      style={s.secondary}
                    >
                      <Text style={s.link}>Conferir situação e histórico</Text>
                    </Pressable>
                  )}
                </View>
              )}
              <View style={s.card}>
                <Text style={s.label}>Situação atual</Text>
                <Text accessibilityRole="header" style={s.heading}>
                  {statusLabel[data.status]}
                </Text>
                <Text style={s.body}>{data.descricao}</Text>
                <Text style={s.small}>Local informado: {data.localizacao}</Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() =>
                    router.push({
                      pathname: "/ocorrencias/[id]",
                      params: { id },
                    })
                  }
                  style={s.secondary}
                >
                  <Text style={s.link}>Ver relato completo →</Text>
                </Pressable>
              </View>
              <View style={s.card}>
                <Text accessibilityRole="header" style={s.heading}>
                  {data.status === "Encerrada"
                    ? "Reabrir para análise"
                    : "Publicar uma atualização"}
                </Text>
                <Text style={s.body}>
                  {data.status === "Encerrada"
                    ? "Se o problema continuar, reabra o relato como Em análise e explique o motivo."
                    : "Informe a nova situação e uma justificativa clara. Essa mensagem será pública."}
                </Text>
                <Text style={s.label}>Nova situação</Text>
                <View style={[s.input, { padding: 0 }]}>
                  <Picker
                    accessibilityLabel="Nova situação"
                    enabled={!busy}
                    selectedValue={selection}
                    onValueChange={(value) => {
                      setDraft({ ...currentDraft, status: value as StatusOcorrencia });
                      setMessage(null);
                    }}
                    style={{
                      color: colors.text,
                      backgroundColor: colors.input,
                      fontSize: 16,
                      borderWidth: 0,
                      minHeight: 48,
                      borderRadius: 10,
                    }}
                  >
                    <Picker.Item label="Selecione a nova situação" value="" />
                    {allowed.map((v) => (
                      <Picker.Item key={v} label={statusLabel[v]} value={v} />
                    ))}
                  </Picker>
                </View>
                <Text style={s.label}>Justificativa para os moradores</Text>
                <TextInput
                  accessibilityLabel="Justificativa para os moradores"
                  value={currentDraft.text}
                  onChangeText={(text) => {
                    setDraft({ ...currentDraft, text });
                    setMessage(null);
                  }}
                  editable={!busy}
                  multiline
                  maxLength={1000}
                  placeholder="Explique o que foi verificado, a ação realizada ou o próximo passo."
                  placeholderTextColor={colors.subtle}
                  style={[s.input, s.textarea]}
                />
                <Text style={s.small}>
                  {currentDraft.text.length}/1.000 caracteres · Não inclua dados
                  pessoais.
                </Text>
                {selection !== "" && (
                  <View style={s.notice}>
                    <Text style={s.label}>
                      Será publicado: {statusLabel[data.status]} →{" "}
                      {statusLabel[selection]}
                    </Text>
                    {selection === "Encerrada" && (
                      <Text style={s.body}>
                        Encerrar o relato bloqueia a edição do morador. Explique
                        o motivo do encerramento.
                      </Text>
                    )}
                  </View>
                )}
                <View style={s.row}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    accessibilityState={{ disabled: busy, busy }}
                    onPress={() => void save()}
                    style={[s.button, busy && s.disabled]}
                  >
                    <Text style={s.buttonText}>
                      {busy ? "Publicando…" : "Publicar atualização"}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => {
                      setDraft(null);
                      setMessage(null);
                      router.dismissTo("/gestao");
                    }}
                    style={s.secondary}
                  >
                    <Text style={s.link}>Cancelar</Text>
                  </Pressable>
                </View>
              </View>
              <View style={s.card}>
                <Text accessibilityRole="header" style={s.heading}>
                  Histórico público
                </Text>
                <Text style={s.small}>
                  Da atualização mais recente para a mais antiga.
                </Text>
                {!data.historico.length && (
                  <Text style={s.body}>Ainda não há mudanças de situação.</Text>
                )}
                {[...data.historico]
                  .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
                  .map((h) => (
                    <View
                      key={h.id}
                      style={{
                        gap: 8,
                        borderTopWidth: 1,
                        borderColor: colors.border,
                        paddingTop: 16,
                      }}
                    >
                      <Text style={s.label}>
                        {statusLabel[h.statusAnterior]} →{" "}
                        {statusLabel[h.novoStatus]}
                      </Text>
                      <Text style={s.body}>{h.justificativa}</Text>
                      <Text style={s.small}>
                        {new Date(
                          h.criadoEm.endsWith("Z")
                            ? h.criadoEm
                            : `${h.criadoEm}Z`,
                        ).toLocaleString("pt-BR")}
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </GestorGate>
  );
}
