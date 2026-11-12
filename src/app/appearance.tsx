import { ScrollView, View, Text, Pressable } from 'react-native';
import { appFont, useAppTheme, type ThemePreference } from '../theme/app-theme';

const options: { value: ThemePreference; label: string; description: string }[] = [
  { value: 'system', label: 'Igual ao dispositivo', description: 'Acompanha automaticamente o tema do seu celular ou computador.' },
  { value: 'light', label: 'Claro', description: 'Fundo claro, com detalhes em verde.' },
  { value: 'dark', label: 'Escuro', description: 'Fundo escuro, com contraste suave para leitura.' },
];
export default function AppearanceScreen() {
  const { colors: c, preference, setPreference, ready, storageError } = useAppTheme();
  return <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ alignItems: 'center', padding: 24 }}>
    <View style={{ width: '100%', maxWidth: 620, gap: 16, paddingVertical: 16 }}>
      <Text accessibilityRole="header" style={{ fontFamily: appFont, color: c.text, fontSize: 30, fontWeight: '700' }}>Do seu jeito</Text>
      <Text style={{ fontFamily: appFont, color: c.muted, fontSize: 16, lineHeight: 25 }}>Escolha como você prefere ver o Bairro em Dia. A mudança vale para todas as telas e fica salva neste dispositivo.</Text>
      {options.map(option => {
        const selected = preference === option.value;
        return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: selected, disabled: !ready }}
          disabled={!ready} onPress={() => setPreference(option.value)}
          style={({ pressed }) => ({ minHeight: 90, borderRadius: 16, padding: 20, flexDirection: 'row', gap: 16, alignItems: 'center', borderWidth: 2, borderColor: selected ? c.primary : c.border, backgroundColor: selected ? c.tint : c.surface, opacity: pressed ? 0.75 : 1 })}>
          <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selected ? c.primary : c.muted, alignItems: 'center', justifyContent: 'center' }}>
            {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary }} />}
          </View>
          <View style={{ flex: 1, gap: 6 }}><Text style={{ fontFamily: appFont, color: c.text, fontSize: 17, fontWeight: '700' }}>{option.label}</Text>
            <Text style={{ fontFamily: appFont, color: c.muted, fontSize: 14, lineHeight: 22 }}>{option.description}</Text></View>
        </Pressable>;
      })}
      <Text accessibilityLiveRegion="polite" style={{ fontFamily: appFont, color: storageError ? c.danger : c.muted, fontSize: 13 }}>{storageError ?? (ready ? 'A alteração é aplicada automaticamente.' : 'Carregando preferência…')}</Text>
    </View>
  </ScrollView>;
}
