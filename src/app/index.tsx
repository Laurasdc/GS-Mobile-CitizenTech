import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const etapas = [
  {
    numero: "01",
    titulo: "Registre",
    descricao:
      "Informe o problema, o estado, a cidade, o bairro e a localização.",
  },
  {
    numero: "02",
    titulo: "Participe",
    descricao:
      "Confirme os relatos de outros moradores que também afetam você.",
  },
  {
    numero: "03",
    titulo: "Acompanhe",
    descricao:
      "Consulte as mudanças de status e as justificativas registradas no histórico.",
  },
];

export default function InicioScreen() {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();

  const telaAmpla = width >= 900 && fontScale < 1.5;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.content, telaAmpla && styles.contentAmplo]}>
        <View style={[styles.hero, telaAmpla && styles.heroAmplo]}>
          <View style={styles.introduction}>
            <Text style={styles.eyebrow}>CUIDADO QUE COMEÇA PERTO</Text>

            <Text
              accessibilityRole="header"
              style={[styles.title, telaAmpla && styles.titleAmplo]}
            >
              Sua cidade, seu bairro, nossa atenção.
            </Text>

            <Text style={styles.description}>
              Registre problemas nos espaços públicos e acompanhe as
              atualizações junto com outros moradores. De qualquer bairro, em
              qualquer cidade do Brasil.
            </Text>
          </View>

          <View style={[styles.actions, telaAmpla && styles.actionsAmplo]}>
            <View style={styles.regionCard}>
              <Text style={styles.cardLabel}>ESCOLHA SUA REGIÃO</Text>

              <Text style={styles.regionTitle} accessibilityRole="header">
                Mais perto do que importa
              </Text>

              <Text style={styles.cardDescription}>
                Busque por estado, cidade e bairro ou consulte todos os
                registros da comunidade.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Consultar ocorrências por região"
              accessibilityHint="Abre a lista com filtros de estado, cidade e bairro"
              onPress={() => router.push("/explore")}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Explorar ocorrências</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Como funciona
          </Text>

          <View style={[styles.steps, telaAmpla && styles.stepsAmplo]}>
            {etapas.map((etapa) => (
              <View
                key={etapa.numero}
                style={[styles.stepCard, telaAmpla && styles.stepCardAmplo]}
              >
                <Text style={styles.stepNumber}>{etapa.numero}</Text>

                <Text style={styles.stepTitle}>{etapa.titulo}</Text>

                <Text style={styles.stepDescription}>{etapa.descricao}</Text>
              </View>
            ))}
          </View>
        </View>
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
    maxWidth: 1120,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 40,
  },
  contentAmplo: {
    paddingHorizontal: 40,
    paddingTop: 64,
    paddingBottom: 64,
    gap: 56,
  },
  hero: {
    gap: 28,
  },
  heroAmplo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 48,
  },
  introduction: {
    flex: 1,
    minWidth: 0,
    gap: 20,
  },
  eyebrow: {
    color: "#176B52",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    color: "#183D35",
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
  },
  titleAmplo: {
    fontSize: 46,
    lineHeight: 55,
  },
  description: {
    color: "#52625D",
    fontSize: 16,
    lineHeight: 26,
  },
  actions: {
    gap: 16,
  },
  actionsAmplo: {
    width: 340,
  },
  regionCard: {
    backgroundColor: "#E3EEE6",
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  cardLabel: {
    color: "#365B4C",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  regionTitle: {
    color: "#183D35",
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "700",
  },
  cardDescription: {
    color: "#365B4C",
    fontSize: 14,
    lineHeight: 23,
  },
  primaryButton: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#176B52",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  section: {
    gap: 20,
  },
  sectionTitle: {
    color: "#183D35",
    fontSize: 24,
    fontWeight: "700",
  },
  steps: {
    gap: 16,
  },
  stepsAmplo: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: "#DCE5DF",
  },
  stepCardAmplo: {
    flex: 1,
    minWidth: 0,
  },
  stepNumber: {
    color: "#176B52",
    fontSize: 25,
    fontWeight: "800",
  },
  stepTitle: {
    color: "#183D35",
    fontSize: 18,
    fontWeight: "700",
  },
  stepDescription: {
    color: "#52625D",
    fontSize: 15,
    lineHeight: 24,
  },
});
