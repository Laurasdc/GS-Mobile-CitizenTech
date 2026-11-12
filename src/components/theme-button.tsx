import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { appFont, useAppTheme } from '../theme/app-theme';

export function ThemeButton() {
  const router = useRouter();
  const { colors } = useAppTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel="Alterar aparência do app"
    onPress={() => router.push('/appearance')}
    style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 14, marginRight: 8, justifyContent: 'center', borderRadius: 10, backgroundColor: colors.input, opacity: pressed ? 0.7 : 1 })}>
    <Text style={{ fontFamily: appFont, color: colors.text, fontSize: 13, fontWeight: '600' }}>Tema ▾</Text>
  </Pressable>;
}
