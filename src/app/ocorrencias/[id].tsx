import { appFont, useAppTheme, type AppColors } from "../../theme/app-theme";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

import { obterOcorrencia } from "../../services/ocorrencias";
import {
    categoriasLabel,
    statusLabel,
    type OcorrenciaDetalhe,
} from "../../types/ocorrencia";

function formatarData(valor: string): string {
  // O backend grava UTC, mas o SQLite pode devolver datas sem o Z.
  const possuiFuso = /(?:Z|[+-]\d{2}:\d{2})$/i.test(valor);
  const data = new Date(possuiFuso ? valor : `${valor}Z`);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DetalheOcorrenciaScreen() {
  const { colors } = useAppTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const ampla = width >= 960 && fontScale < 1.5;
  const parametros = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const id = Array.isArray(parametros.id) ? parametros.id[0] : parametros.id;

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhe | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();

      async function carregar() {
        setCarregando(true);
        setErro(null);
        setOcorrencia(null);

        try {
          if (!id) {
            throw new Error("O identificador da ocorrência está ausente.");
          }

          const dados = await obterOcorrencia(id, controller.signal);

          if (!controller.signal.aborted) {
            setOcorrencia(dados);
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            setErro(
              error instanceof TypeError
                ? "Não foi possível conectar à API."
                : error instanceof Error
                  ? error.message
                  : "Não foi possível consultar a ocorrência.",
            );
          }
        } finally {
          if (!controller.signal.aborted) {
            setCarregando(false);
          }
        }
      }

      void carregar();

      return () => controller.abort();
    // O contador recria a consulta quando o usuário solicita uma nova tentativa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, tentativa]),
  );

  const historico = [...(ocorrencia?.historico ?? [])].sort(
    (a, b) => instante(b.criadoEm) - instante(a.criadoEm),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.content, ampla && styles.contentWide]}>
        {carregando ? (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.body}>Carregando a ocorrência…</Text>
          </View>
        ) : erro ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle} accessibilityRole="alert">Não conseguimos abrir a ocorrência</Text>
            <Text style={styles.body}>{erro}</Text>
            <Pressable accessibilityRole="button" onPress={() => setTentativa(v => v + 1)}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.buttonText}>Tentar novamente</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.replace("/explore")} style={styles.backButton}>
              <Text style={styles.linkText}>Voltar às ocorrências</Text>
            </Pressable>
          </View>
        ) : ocorrencia ? (
          <>
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>RELATO DA COMUNIDADE</Text>
              <Text style={[styles.title, ampla && styles.titleWide]} accessibilityRole="header">{ocorrencia.titulo}</Text>
              <Text style={styles.location}>{ocorrencia.bairro} · {ocorrencia.cidade} / {ocorrencia.uf}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{categoriasLabel[ocorrencia.categoria]}</Text>
              </View>
            </View>

            <View style={[styles.columns, ampla && styles.columnsWide]}>
              <View style={styles.mainColumn}>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle} accessibilityRole="header">O que está acontecendo?</Text>
                  <Text style={styles.body}>{ocorrencia.descricao}</Text>
                  <View style={styles.addressBox}>
                    <Text style={styles.label}>LOCAL INFORMADO</Text>
                    <Text style={styles.address}>{ocorrencia.localizacao}</Text>
                    <Text style={styles.metadata}>{ocorrencia.bairro} · {ocorrencia.cidade} / {ocorrencia.uf}</Text>
                  </View>
                </View>

                <View style={styles.card}>
                  <View style={styles.historyHeading}>
                    <Text style={styles.sectionTitle} accessibilityRole="header">Acompanhamento</Text>
                    <Text style={styles.count}>{historico.length} {historico.length === 1 ? "atualização" : "atualizações"}</Text>
                  </View>
                  <Text style={styles.metadata}>Da atualização mais recente para a mais antiga.</Text>
                  {historico.length === 0 ? (
                    <Text style={styles.body}>O relato foi registrado. As próximas mudanças de situação aparecerão aqui.</Text>
                  ) : historico.map((item, index) => (
                    <View key={item.id} style={styles.timelineRow}>
                      <View style={styles.timelineRail}>
                        <View style={[styles.dot, index === 0 && styles.dotLatest]} />
                        {index < historico.length - 1 && <View style={styles.line} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.eventHeading}>
                          <Text style={styles.eventTitle}>{statusLabel[item.novoStatus]}</Text>
                          {index === 0 && <Text style={styles.latest}>Mais recente</Text>}
                        </View>
                        <Text style={styles.metadata}>{formatarData(item.criadoEm)} · Antes: {statusLabel[item.statusAnterior]}</Text>
                        <Text style={styles.body}>{item.justificativa}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.summaryColumn, ampla && styles.summaryWide]}>
                <View style={styles.statusCard}>
                  <Text style={styles.label}>SITUAÇÃO ATUAL</Text>
                  <Text style={styles.currentStatus}>{statusLabel[ocorrencia.status]}</Text>
                  <Text style={styles.statusDescription}>{explicacaoStatus[ocorrencia.status]}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.metadata}>Última atualização</Text>
                  <Text style={styles.date}>{formatarData(ocorrencia.atualizadoEm)}</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.label}>NA COMUNIDADE</Text>
                  <View style={styles.confirmationRow}>
                    <Text style={styles.confirmationNumber}>{ocorrencia.totalConfirmacoes}</Text>
                    <Text style={styles.confirmationLabel}>{ocorrencia.totalConfirmacoes === 1 ? "confirmação" : "confirmações"}</Text>
                  </View>
                  <Text style={styles.body}>{ocorrencia.totalConfirmacoes === 0
                    ? "Nenhum outro morador confirmou ser afetado até agora."
                    : ocorrencia.totalConfirmacoes === 1
                      ? "Outro morador confirmou que também é afetado."
                      : "Outros moradores confirmaram que também são afetados."}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.metadata}>Relato registrado em</Text>
                  <Text style={styles.date}>{formatarData(ocorrencia.criadoEm)}</Text>
                </View>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function instante(valor: string) {
  const data = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(valor) ? valor : `${valor}Z`);
  return Number.isNaN(data.getTime()) ? 0 : data.getTime();
}

const explicacaoStatus = {
  Registrada: "O relato foi recebido e aguarda análise.",
  EmAnalise: "O problema está em análise. Veja o histórico de acompanhamento.",
  EmAcompanhamento: "A ocorrência está sendo acompanhada. Veja o histórico de acompanhamento.",
  Encerrada: "O acompanhamento foi encerrado. Veja o motivo no histórico.",
};

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { alignItems: "center", flexGrow: 1 },
  content: { width: "100%", maxWidth: 1180, padding: 20, paddingBottom: 40, gap: 24 },
  contentWide: { padding: 40, paddingBottom: 56, gap: 28 },
  heading: { gap: 12 },
  eyebrow: { color: colors.primary, fontFamily: appFont, fontSize: 12, fontWeight: "700", letterSpacing: 1.5 },
  title: { color: colors.text, fontFamily: appFont, fontSize: 28, lineHeight: 36, fontWeight: "700" },
  titleWide: { fontFamily: appFont, fontSize: 36, lineHeight: 44, maxWidth: 920 },
  location: { color: colors.muted, fontFamily: appFont, fontSize: 16, lineHeight: 25 },
  categoryBadge: { alignSelf: "flex-start", backgroundColor: colors.tint, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  categoryText: { color: colors.tintText, fontFamily: appFont, fontSize: 13, fontWeight: "600" },
  columns: { gap: 20, flexDirection: "column-reverse" },
  columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: 24 },
  mainColumn: { flex: 1, minWidth: 0, gap: 20 },
  summaryColumn: { gap: 20 },
  summaryWide: { width: 300 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 24, gap: 14 },
  sectionTitle: { color: colors.text, fontFamily: appFont, fontSize: 20, lineHeight: 28, fontWeight: "700", flexShrink: 1 },
  body: { color: colors.muted, fontFamily: appFont, fontSize: 16, lineHeight: 25 },
  addressBox: { backgroundColor: colors.background, borderRadius: 12, padding: 16, gap: 8, marginTop: 6 },
  label: { color: colors.subtle, fontFamily: appFont, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  address: { color: colors.text, fontFamily: appFont, fontSize: 16, lineHeight: 25, fontWeight: "600" },
  metadata: { color: colors.subtle, fontFamily: appFont, fontSize: 13, lineHeight: 21 },
  historyHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  count: { color: colors.subtle, fontFamily: appFont, fontSize: 12 },
  timelineRow: { flexDirection: "row", gap: 14 },
  timelineRail: { width: 14, alignItems: "center", paddingTop: 7 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.inputBorder },
  dotLatest: { backgroundColor: colors.primary },
  line: { width: 2, flex: 1, minHeight: 30, backgroundColor: colors.border, marginTop: 6 },
  timelineContent: { flex: 1, gap: 7, paddingBottom: 16, minWidth: 0 },
  eventHeading: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  eventTitle: { color: colors.text, fontFamily: appFont, fontSize: 16, fontWeight: "700" },
  latest: { color: colors.primary, backgroundColor: colors.tint, fontFamily: appFont, fontSize: 11, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  statusCard: { borderRadius: 18, padding: 24, gap: 12, backgroundColor: colors.tint, borderWidth: 1, borderColor: colors.border },
  currentStatus: { color: colors.text, fontWeight: "700", fontFamily: appFont, fontSize: 26, lineHeight: 34 },
  statusDescription: { color: colors.tintText, fontFamily: appFont, fontSize: 15, lineHeight: 24 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 3 },
  date: { color: colors.text, fontFamily: appFont, fontSize: 14, lineHeight: 22, fontWeight: "600" },
  confirmationRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", gap: 10 },
  confirmationNumber: { color: colors.primary, fontWeight: "700", fontFamily: appFont, fontSize: 36 },
  confirmationLabel: { color: colors.text, fontFamily: appFont, fontSize: 15, fontWeight: "600" },
  button: { alignSelf: "flex-start", minHeight: 48, borderRadius: 12, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 14, justifyContent: "center" },
  buttonText: { color: colors.onPrimary, fontFamily: appFont, fontSize: 15, fontWeight: "700" },
  backButton: { minHeight: 48, justifyContent: "center" },
  linkText: { color: colors.primary, fontFamily: appFont, fontSize: 15, fontWeight: "600" },
  pressed: { opacity: 0.75 },
});
