import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
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
  const router = useRouter();
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
    }, [id, tentativa]),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar à lista de ocorrências"
          onPress={() => router.navigate("/explore")}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.linkText}>Voltar às ocorrências</Text>
        </Pressable>

        {carregando ? (
          <View style={styles.card}>
            <ActivityIndicator
              size="large"
              color="#176B52"
              accessibilityLabel="Carregando detalhes"
            />
            <Text style={styles.body}>
              Buscando os detalhes da ocorrência...
            </Text>
          </View>
        ) : erro ? (
          <View style={styles.card}>
            <Text style={styles.errorTitle} accessibilityRole="alert">
              Não conseguimos abrir a ocorrência
            </Text>

            <Text style={styles.body}>{erro}</Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => setTentativa((valor) => valor + 1)}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : ocorrencia ? (
          <>
            <View style={styles.heading}>
              <View style={styles.badges}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    {categoriasLabel[ocorrencia.categoria]}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {statusLabel[ocorrencia.status]}
                  </Text>
                </View>
              </View>

              <Text style={styles.title} accessibilityRole="header">
                {ocorrencia.titulo}
              </Text>

              <Text style={styles.body}>{ocorrencia.bairro}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Sobre o problema
              </Text>

              <Text style={styles.body}>{ocorrencia.descricao}</Text>

              <Text style={styles.label}>Localização</Text>
              <Text style={styles.body}>{ocorrencia.localizacao}</Text>

              <View style={styles.divider} />

              <Text style={styles.metadata}>
                Registrada em {formatarData(ocorrencia.criadoEm)}
              </Text>

              <Text style={styles.metadata}>
                Atualizada em {formatarData(ocorrencia.atualizadoEm)}
              </Text>
            </View>

            <View style={styles.confirmationCard}>
              <Text style={styles.confirmationNumber}>
                {ocorrencia.totalConfirmacoes}
              </Text>

              <Text style={styles.confirmationText}>
                {ocorrencia.totalConfirmacoes === 1
                  ? "morador confirmou que também é afetado"
                  : "moradores confirmaram que também são afetados"}
              </Text>
            </View>

            <View style={styles.historySection}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Histórico de acompanhamento
              </Text>

              {ocorrencia.historico.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.body}>
                    Ainda não há mudanças de status registradas.
                  </Text>
                </View>
              ) : (
                ocorrencia.historico.map((atualizacao) => (
                  <View key={atualizacao.id} style={styles.card}>
                    <Text style={styles.historyStatus}>
                      {statusLabel[atualizacao.statusAnterior]}
                      {" → "}
                      {statusLabel[atualizacao.novoStatus]}
                    </Text>

                    <Text style={styles.body}>{atualizacao.justificativa}</Text>

                    <Text style={styles.metadata}>
                      {formatarData(atualizacao.criadoEm)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F4",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 960,
    padding: 24,
    paddingBottom: 40,
    gap: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: 12,
  },
  linkText: {
    color: "#176B52",
    fontSize: 15,
    fontWeight: "700",
  },
  heading: {
    gap: 16,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#E3EEE6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  categoryText: {
    color: "#24513F",
    fontSize: 13,
    fontWeight: "600",
  },
  statusBadge: {
    backgroundColor: "#EDF1F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusText: {
    color: "#3E5066",
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    color: "#183D35",
    fontSize: 30,
    lineHeight: 39,
    fontWeight: "800",
  },
  card: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5DF",
    borderRadius: 20,
    gap: 14,
  },
  sectionTitle: {
    color: "#183D35",
    fontSize: 21,
    fontWeight: "700",
  },
  body: {
    color: "#52625D",
    fontSize: 16,
    lineHeight: 26,
  },
  label: {
    color: "#183D35",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },
  metadata: {
    color: "#52625D",
    fontSize: 13,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: "#DCE5DF",
    marginVertical: 4,
  },
  confirmationCard: {
    backgroundColor: "#E3EEE6",
    padding: 24,
    borderRadius: 20,
    gap: 8,
  },
  confirmationNumber: {
    color: "#176B52",
    fontSize: 36,
    fontWeight: "800",
  },
  confirmationText: {
    color: "#24513F",
    fontSize: 16,
    lineHeight: 25,
  },
  historySection: {
    gap: 16,
  },
  historyStatus: {
    color: "#176B52",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 25,
  },
  errorTitle: {
    color: "#9B2929",
    fontSize: 20,
    fontWeight: "700",
  },
  button: {
    alignSelf: "flex-start",
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#176B52",
    borderRadius: 14,
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
});
