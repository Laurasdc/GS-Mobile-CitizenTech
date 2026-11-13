import { appFont, useAppTheme, type AppColors } from "../../theme/app-theme";
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
    titulo: "Registre um problema",
    descricao:
      "Escolha o tipo de problema e informe onde ele acontece.",
  },
  {
    numero: "02",
    titulo: "Participe da comunidade",
    descricao:
      "Consulte os relatos e confirme os que também afetam você.",
  },
  {
    numero: "03",
    titulo: "Acompanhe",
    descricao:
      "Veja as atualizações em ordem, com a data e o motivo de cada mudança.",
  },
];

export default function InicioScreen() {
  const { colors } = useAppTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();

  const telaAmpla = width >= 900 && fontScale < 1.5;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.content, telaAmpla && styles.contentAmplo]}>
        <View style={styles.hero}>
          <View style={styles.introduction}>
            <Text style={styles.eyebrow}>CUIDADO QUE COMEÇA PERTO</Text>

            <Text
              accessibilityRole="header"
              style={[styles.title, telaAmpla && styles.titleAmplo]}
            >
              Seu bairro merece atenção.
            </Text>

            <Text style={styles.description}>
              Registre um problema, participe dos relatos da comunidade e acompanhe o que acontece na sua região.
            </Text>
            <View style={styles.homeActions}>
              <Pressable accessibilityRole="button" onPress={() => router.push('/registrar')}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Registrar problema</Text>
              </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Consultar ocorrências por região"
              accessibilityHint="Abre a lista com filtros de estado, cidade e bairro"
              onPress={() => router.push("/explore")}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.primary }]}>Buscar ocorrências →</Text>
            </Pressable>
            </View>
          </View>

          <View style={styles.actions}>
            <View style={styles.regionCard}>
              <Text style={styles.cardLabel}>UM OLHAR PARA A COMUNIDADE</Text>

              <Text style={styles.regionTitle} accessibilityRole="header">
                Da sua rua à sua cidade
              </Text>

              <Text style={styles.cardDescription}>
                Iluminação, calçadas, buracos e lixo acumulado. Os relatos ficam reunidos em um só lugar.
              </Text>
            </View>


          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Como funciona
          </Text>

          <View style={styles.steps}>
            {etapas.map((etapa) => (
              <View
                key={etapa.numero}
                style={styles.stepCard}
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
    maxWidth: 1120,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 40,
  },
  contentAmplo: {
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 64,
    gap: 36,
  },
  hero: {
    padding: 28,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 28,
  },
  heroAmplo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 48,
  },
  introduction: {
    minWidth: 0,
    gap: 20,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: appFont, fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontFamily: appFont, fontSize: 34,
    lineHeight: 42,
    fontWeight: "700",
  },
  titleAmplo: {
    fontFamily: appFont, fontSize: 44,
    lineHeight: 55,
  },
  description: {
    color: colors.muted,
    fontFamily: appFont, fontSize: 16,
    lineHeight: 26,
  },
  homeActions: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actions: {
    gap: 16,
  },
  actionsAmplo: {
    width: 340,
  },
  regionCard: {
    backgroundColor: colors.tint,
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  cardLabel: {
    color: colors.tintText,
    fontFamily: appFont, fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  regionTitle: {
    color: colors.text,
    fontFamily: appFont, fontSize: 26,
    lineHeight: 34,
    fontWeight: "700",
  },
  cardDescription: {
    color: colors.tintText,
    fontFamily: appFont, fontSize: 14,
    lineHeight: 23,
  },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontFamily: appFont, fontSize: 16,
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
    color: colors.text,
    fontFamily: appFont, fontSize: 24,
    fontWeight: "700",
  },
  steps: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  stepsAmplo: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  stepCard: {
    flexGrow: 1,
    flexBasis: 260,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepCardAmplo: {
    flex: 1,
    minWidth: 0,
  },
  stepNumber: {
    color: colors.primary,
    fontFamily: appFont, fontSize: 25,
    fontWeight: "700",
  },
  stepTitle: {
    color: colors.text,
    fontFamily: appFont, fontSize: 18,
    fontWeight: "700",
  },
  stepDescription: {
    color: colors.muted,
    fontFamily: appFont, fontSize: 15,
    lineHeight: 24,
  },
});
