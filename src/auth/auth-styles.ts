import { StyleSheet } from 'react-native';
import { appFont, type AppColors } from '../theme/app-theme';
export const authStyles = (c: AppColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background },
  scroll: { flexGrow: 1, alignItems: 'center', padding: 20 },
  content: { width: '100%', maxWidth: 480, paddingVertical: 20, gap: 20 },
  title: { fontFamily: appFont, color: c.text, fontSize: 30, lineHeight: 38, fontWeight: '700' },
  body: { fontFamily: appFont, color: c.muted, fontSize: 15, lineHeight: 24 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 22, gap: 18 },
  field: { gap: 8 }, label: { fontFamily: appFont, color: c.text, fontSize: 14, fontWeight: '600' },
  input: { fontFamily: appFont, minHeight: 50, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 10, backgroundColor: c.input, color: c.text, paddingHorizontal: 14, fontSize: 16 },
  button: { minHeight: 50, padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary },
  buttonText: { fontFamily: appFont, color: c.onPrimary, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  linkButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  link: { fontFamily: appFont, color: c.primary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  error: { fontFamily: appFont, color: c.danger, fontSize: 14, lineHeight: 22 },
  disabled: { opacity: 0.6 },
});
