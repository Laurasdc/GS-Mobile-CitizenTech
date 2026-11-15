import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { appFont, useAppTheme, type AppColors } from '../../theme/app-theme';
const steps = [
  ['01', 'Registre um problema', 'Informe o que aconteceu e onde o problema está.'],
  ['02', 'Participe da comunidade', 'Encontre relatos da sua região e confirme os que também afetam você.'],
  ['03', 'Acompanhe as mudanças', 'Consulte a situação e o histórico com as justificativas da gestão.'],
];
export default function HomeScreen() {
  const router = useRouter(); const { colors } = useAppTheme(); const s = styles(colors);
  const { width, fontScale } = useWindowDimensions(); const wide = width >= 900 && fontScale < 1.5;
  return <ScrollView style={s.page} contentContainerStyle={s.scroll}><View style={s.content}>
    <View style={[s.hero, Platform.OS !== 'web' && { padding: 18, gap: 12 }]}>
      <Text style={s.eyebrow}>CUIDADO QUE COMEÇA PERTO</Text>
      <Text accessibilityRole="header" style={[s.title, wide && s.titleWide]}>Seu bairro merece atenção.</Text>
      <Text style={s.description}>{Platform.OS === 'web' ? 'Registre problemas de iluminação, calçadas, buracos e lixo acumulado. Participe dos relatos e acompanhe as atualizações em qualquer cidade do Brasil.' : 'Registre problemas e acompanhe os relatos da comunidade, em qualquer cidade do Brasil.'}</Text>
      <View style={s.actions}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/registrar')} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={s.buttonText}>Registrar problema</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar ocorrências por região" onPress={() => router.push('/explore')} style={({ pressed }) => [s.button, s.secondary, pressed && s.pressed]}><Text style={[s.buttonText, s.link]}>Buscar ocorrências →</Text></Pressable>
      </View>
    </View>
    <Text accessibilityRole="header" style={s.sectionTitle}>Como funciona</Text>
    <View style={s.steps}>{steps.map(([number, title, description]) => <View key={number} style={s.step}>
      <Text style={s.number}>{number}</Text><Text accessibilityRole="header" style={s.stepTitle}>{title}</Text><Text style={s.body}>{description}</Text>
    </View>)}</View>
  </View></ScrollView>;
}
const styles = (c: AppColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background }, scroll: { alignItems: 'center', flexGrow: 1 },
  content: { width: '100%', maxWidth: 1100, padding: 24, paddingBottom: 40, gap: 20 },
  hero: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 24, gap: 16 },
  eyebrow: { fontFamily: appFont, color: c.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  title: { fontFamily: appFont, color: c.text, fontSize: 32, lineHeight: 40, fontWeight: '700' },
  titleWide: { fontSize: 38, lineHeight: 46 },
  description: { fontFamily: appFont, color: c.muted, maxWidth: 850, fontSize: 16, lineHeight: 25 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  button: { backgroundColor: c.primary, minHeight: 48, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontFamily: appFont, color: c.onPrimary, fontSize: 15, fontWeight: '700' },
  secondary: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.inputBorder }, link: { color: c.primary },
  sectionTitle: { fontFamily: appFont, color: c.text, fontSize: 23, fontWeight: '700' },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  step: { flexGrow: 1, flexBasis: 260, minWidth: 0, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 20, gap: 10 },
  number: { fontFamily: appFont, color: c.primary, fontSize: 24, fontWeight: '700' },
  stepTitle: { fontFamily: appFont, color: c.text, fontSize: 18, fontWeight: '700' },
  body: { fontFamily: appFont, color: c.muted, fontSize: 15, lineHeight: 23 }, pressed: { opacity: 0.7 },
});
