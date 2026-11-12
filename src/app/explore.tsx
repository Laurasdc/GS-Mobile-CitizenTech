import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { unidadesFederativas } from "../constants/localidades";
import {
  listarOcorrencias,
  type FiltrosOcorrencias,
} from "../services/ocorrencias";
import {
  categoriasLabel,
  statusLabel,
  type OcorrenciaResumo,
} from "../types/ocorrencia";

export default function OcorrenciasScreen() {
  const { width, fontScale } = useWindowDimensions();
  const telaAmpla = width >= 900 && fontScale < 1.5;

  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [categoria, setCategoria] = useState("");
  const [status, setStatus] = useState("");

  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosOcorrencias>(
    {},
  );

  const [ocorrencias, setOcorrencias] = useState<OcorrenciaResumo[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();

      async function carregar() {
        setCarregando(true);
        setErro(null);

        try {
          const dados = await listarOcorrencias(
            controller.signal,
            filtrosAplicados,
          );

          if (!controller.signal.aborted) {
            setOcorrencias(dados);
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            setErro(
              error instanceof TypeError
                ? "Não foi possível conectar à API. Confira se o backend está executando."
                : error instanceof Error
                  ? error.message
                  : "Não foi possível carregar as ocorrências.",
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
    }, [tentativa, filtrosAplicados]),
  );

  function aplicarFiltros() {
    setFiltrosAplicados({
      uf,
      cidade: cidade.trim(),
      bairro: bairro.trim(),
      categoria,
      status,
    });
  }

  function limparFiltros() {
    setUf("");
    setCidade("");
    setBairro("");
    setCategoria("");
    setStatus("");
    setFiltrosAplicados({});
  }

  function alterarUf(valor: string) {
    setUf(valor);
    setCidade("");
    setBairro("");
  }

  const possuiFiltroDeLocalidade = Boolean(
    filtrosAplicados.uf || filtrosAplicados.cidade || filtrosAplicados.bairro,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>RELATOS DA COMUNIDADE</Text>

          <Text style={styles.title} accessibilityRole="header">
            De olho na sua região
          </Text>

          <Text style={styles.description}>
            Encontre ocorrências em bairros de qualquer cidade do Brasil.
            Escolha uma região ou consulte todos os registros.
          </Text>
        </View>

        <View style={styles.filtersCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Onde você quer acompanhar?
          </Text>

          <View style={[styles.fields, telaAmpla && styles.fieldsAmplo]}>
            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  accessibilityLabel="Filtrar por estado"
                  selectedValue={uf}
                  onValueChange={(valor) => alterarUf(String(valor))}
                  style={styles.picker}
                >
                  <Picker.Item label="Todos os estados" value="" />

                  {unidadesFederativas.map((estado) => (
                    <Picker.Item
                      key={estado.sigla}
                      label={`${estado.nome} (${estado.sigla})`}
                      value={estado.sigla}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Cidade</Text>

              <TextInput
                accessibilityLabel="Filtrar por cidade"
                placeholder="Ex.: Campinas"
                placeholderTextColor="#63756B"
                value={cidade}
                onChangeText={(valor) => {
                  setCidade(valor);
                  setBairro("");
                }}
                onSubmitEditing={aplicarFiltros}
                returnKeyType="search"
                maxLength={100}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Bairro</Text>

              <TextInput
                accessibilityLabel="Filtrar por bairro"
                placeholder="Ex.: Centro"
                placeholderTextColor="#63756B"
                value={bairro}
                onChangeText={setBairro}
                onSubmitEditing={aplicarFiltros}
                returnKeyType="search"
                maxLength={100}
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.helpText}>
            Os campos são opcionais. Para diferenciar bairros com o mesmo nome,
            informe também a cidade e o estado. Digite os nomes completos, com
            os acentos do cadastro.
          </Text>

          <View style={[styles.fields, telaAmpla && styles.fieldsAmplo]}>
            <View style={styles.field}>
              <Text style={styles.label}>Categoria</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  accessibilityLabel="Filtrar por categoria"
                  selectedValue={categoria}
                  onValueChange={(valor) => setCategoria(String(valor))}
                  style={styles.picker}
                >
                  <Picker.Item label="Todas as categorias" value="" />
                  <Picker.Item label="Iluminação" value="1" />
                  <Picker.Item label="Lixo acumulado" value="2" />
                  <Picker.Item label="Buraco" value="3" />
                  <Picker.Item label="Calçada danificada" value="4" />
                </Picker>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Status</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  accessibilityLabel="Filtrar por status"
                  selectedValue={status}
                  onValueChange={(valor) => setStatus(String(valor))}
                  style={styles.picker}
                >
                  <Picker.Item label="Todos os status" value="" />
                  <Picker.Item label="Registrada" value="1" />
                  <Picker.Item label="Em análise" value="2" />
                  <Picker.Item label="Em acompanhamento" value="3" />
                  <Picker.Item label="Encerrada" value="4" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aplicar filtros de ocorrências"
              onPress={aplicarFiltros}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Aplicar filtros</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar todos os filtros"
              onPress={limparFiltros}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Limpar filtros</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.resultsHeader}>
          <View style={styles.resultsHeading}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Ocorrências
            </Text>

            <Text style={styles.helpText}>
              {possuiFiltroDeLocalidade
                ? [
                    filtrosAplicados.bairro,
                    filtrosAplicados.cidade,
                    filtrosAplicados.uf,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Todas as localidades"}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atualizar resultados com os filtros aplicados"
            disabled={carregando}
            onPress={() => setTentativa((valor) => valor + 1)}
            style={({ pressed }) => [
              styles.refreshButton,
              carregando && styles.buttonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              {carregando ? "Carregando..." : "Atualizar"}
            </Text>
          </Pressable>
        </View>

        {carregando ? (
          <View style={styles.messageCard}>
            <ActivityIndicator
              size="large"
              color="#176B52"
              accessibilityLabel="Carregando ocorrências"
            />

            <Text style={styles.description}>Buscando os registros...</Text>
          </View>
        ) : erro ? (
          <View style={styles.messageCard}>
            <Text style={styles.errorTitle} accessibilityRole="alert">
              Não conseguimos carregar a lista
            </Text>

            <Text style={styles.description}>{erro}</Text>

            <Text style={styles.description}>
              Use “Atualizar” para tentar novamente.
            </Text>
          </View>
        ) : ocorrencias.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.cardTitle}>Nenhuma ocorrência encontrada</Text>

            <Text style={styles.description}>
              Não há registros para os filtros escolhidos. Tente outra região ou
              limpe os filtros.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.resultCount} accessibilityLiveRegion="polite">
              {ocorrencias.length}{" "}
              {ocorrencias.length === 1
                ? "ocorrência encontrada"
                : "ocorrências encontradas"}
            </Text>

            {ocorrencias.map((ocorrencia) => (
              <View key={ocorrencia.id} style={styles.card}>
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

                <Text style={styles.cardTitle} accessibilityRole="header">
                  {ocorrencia.titulo}
                </Text>

                <Text style={styles.location}>
                  {ocorrencia.bairro} · {ocorrencia.cidade}
                  {" / "}
                  {ocorrencia.uf}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    maxWidth: 1100,
    padding: 24,
    paddingBottom: 40,
    gap: 24,
  },
  heading: {
    gap: 14,
  },
  eyebrow: {
    color: "#176B52",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    color: "#183D35",
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
  },
  description: {
    color: "#52625D",
    fontSize: 16,
    lineHeight: 25,
  },
  filtersCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5DF",
    borderRadius: 20,
    padding: 20,
    gap: 20,
  },
  sectionTitle: {
    color: "#183D35",
    fontSize: 20,
    fontWeight: "700",
  },
  fields: {
    gap: 16,
  },
  fieldsAmplo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  field: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    gap: 8,
  },
  label: {
    color: "#183D35",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 52,
    backgroundColor: "#F8FAF8",
    borderWidth: 1,
    borderColor: "#B8C9BE",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#183D35",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#F8FAF8",
    borderWidth: 1,
    borderColor: "#B8C9BE",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    minHeight: 52,
    color: "#183D35",
    backgroundColor: "#F8FAF8",
  },
  helpText: {
    color: "#52625D",
    fontSize: 13,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#176B52",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B8C9BE",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#176B52",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  resultsHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  resultsHeading: {
    flexShrink: 1,
    gap: 6,
  },
  refreshButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  messageCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5DF",
    gap: 16,
  },
  errorTitle: {
    color: "#9B2929",
    fontSize: 18,
    fontWeight: "700",
  },
  list: {
    gap: 16,
  },
  resultCount: {
    color: "#52625D",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5DF",
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#E3EEE6",
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    paddingVertical: 7,
    borderRadius: 10,
  },
  statusText: {
    color: "#3E5066",
    fontSize: 13,
    fontWeight: "600",
  },
  cardTitle: {
    color: "#183D35",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  location: {
    color: "#52625D",
    fontSize: 15,
    lineHeight: 24,
  },
});
