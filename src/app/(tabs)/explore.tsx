import { appFont, useAppTheme, type AppColors } from "../../theme/app-theme";
import { Picker } from "@react-native-picker/picker";
import { Link, useFocusEffect } from "expo-router";
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

import { unidadesFederativas } from "../../constants/localidades";
import {
  listarOcorrencias,
  type FiltrosOcorrencias,
} from "../../services/ocorrencias";
import {
  categoriasLabel,
  statusLabel,
  type OcorrenciaResumo,
} from "../../types/ocorrencia";

export default function OcorrenciasScreen() {
  const { colors } = useAppTheme();
  const styles = makeStyles(colors);
  const { width, fontScale } = useWindowDimensions();
  const telaAmpla = width >= 900 && fontScale < 1.5;

  const [moreFilters, setMoreFilters] = useState(false);
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
    // O contador permite atualizar os resultados mantendo os mesmos filtros.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            O que acontece perto de você?
          </Text>

          <Text style={styles.description}>
            Busque sua região ou explore os relatos abaixo. Abra uma ocorrência para ver os detalhes e as atualizações.
          </Text>
        </View>

        <View style={styles.filtersCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Buscar por região
          </Text>

          <View style={[styles.fields, telaAmpla && styles.fieldsAmplo]}>
            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  dropdownIconColor={colors.text}
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
                placeholderTextColor={colors.subtle}
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
                placeholderTextColor={colors.subtle}
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
            Preencha apenas o que quiser filtrar. Use os nomes completos de cidade e bairro, com os acentos do cadastro.
          </Text>

          <Pressable accessibilityRole="button" accessibilityState={{ expanded: moreFilters }}
            onPress={() => setMoreFilters(value => !value)} style={styles.refreshButton}>
            <Text style={styles.secondaryButtonText}>{moreFilters ? '− Ocultar filtros adicionais' : '+ Mais filtros'}{categoria || status ? ' · ativos' : ''}</Text>
          </Pressable>
          {moreFilters && (
          <View style={[styles.fields, telaAmpla && styles.fieldsAmplo]}>
            <View style={styles.field}>
              <Text style={styles.label}>Categoria</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  dropdownIconColor={colors.text}
                  accessibilityLabel="Filtrar por categoria"
                  selectedValue={categoria}
                  onValueChange={(valor) => setCategoria(String(valor))}
                  style={styles.picker}
                >
                  <Picker.Item label="Qualquer categoria" value="" />
                  <Picker.Item label="Iluminação" value="1" />
                  <Picker.Item label="Lixo acumulado" value="2" />
                  <Picker.Item label="Buraco" value="3" />
                  <Picker.Item label="Calçada danificada" value="4" />
                </Picker>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Situação</Text>

              <View style={styles.pickerContainer}>
                <Picker
                  dropdownIconColor={colors.text}
                  accessibilityLabel="Filtrar por status"
                  selectedValue={status}
                  onValueChange={(valor) => setStatus(String(valor))}
                  style={styles.picker}
                >
                  <Picker.Item label="Qualquer situação" value="" />
                  <Picker.Item label="Registrada" value="1" />
                  <Picker.Item label="Em análise" value="2" />
                  <Picker.Item label="Em acompanhamento" value="3" />
                  <Picker.Item label="Encerrada" value="4" />
                </Picker>
              </View>
            </View>
          </View>

          )}

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
              <Text style={styles.primaryButtonText}>Buscar ocorrências</Text>
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
              <Text style={styles.secondaryButtonText}>Ver todas</Text>
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
              color={colors.primary}
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

                <Link
                  href={{ pathname: "/ocorrencias/[id]", params: { id: ocorrencia.id } }}
                  asChild
                >
                  <Pressable
                    accessibilityLabel={`Ver detalhes: ${ocorrencia.titulo}`}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.secondaryButtonText}>Ver detalhes e atualizações →</Text>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.primary,
    fontFamily: appFont, fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontFamily: appFont, fontSize: 30,
    lineHeight: 38,
    fontWeight: "700",
  },
  description: {
    color: colors.muted,
    fontFamily: appFont, fontSize: 16,
    lineHeight: 25,
  },
  filtersCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: appFont, fontSize: 20,
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
    color: colors.text,
    fontFamily: appFont, fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: appFont, fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    fontFamily: appFont, fontSize: 16,
    borderWidth: 0,
    width: "100%",
    minHeight: 48,
    color: colors.text,
    backgroundColor: colors.input,
  },
  helpText: {
    color: colors.muted,
    fontFamily: appFont, fontSize: 13,
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
    backgroundColor: colors.primary,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontFamily: appFont, fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontFamily: appFont, fontSize: 15,
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
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  errorTitle: {
    color: colors.danger,
    fontFamily: appFont, fontSize: 18,
    fontWeight: "700",
  },
  list: {
    gap: 16,
  },
  resultCount: {
    color: colors.muted,
    fontFamily: appFont, fontSize: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 24,
    gap: 14,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: colors.tint,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  categoryText: {
    color: colors.tintText,
    fontFamily: appFont, fontSize: 13,
    fontWeight: "600",
  },
  statusBadge: {
    backgroundColor: colors.blue,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  statusText: {
    color: colors.blueText,
    fontFamily: appFont, fontSize: 13,
    fontWeight: "600",
  },
  cardTitle: {
    color: colors.text,
    fontFamily: appFont, fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  location: {
    color: colors.muted,
    fontFamily: appFont, fontSize: 15,
    lineHeight: 24,
  },
});
