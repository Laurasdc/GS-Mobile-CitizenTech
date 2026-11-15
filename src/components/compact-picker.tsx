import { Picker as NativePicker } from '@react-native-picker/picker';
import { Children, useState, type ComponentProps } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/app-theme';
type Props = Omit<ComponentProps<typeof NativePicker>, 'onValueChange'> & { onValueChange?: (value: string, index: number) => void };
function CompactPicker(props: Props) {
  const [open, setOpen] = useState(false); const { colors } = useAppTheme(); const insets = useSafeAreaInsets();
  if (Platform.OS === 'web') return <NativePicker {...props} onValueChange={(value, index) => props.onValueChange?.(String(value), index)} />;
  const options = Children.toArray(props.children) as React.ReactElement<{ label: string; value: string; enabled?: boolean }>[];
  const selected = options.find(o => o.props.value === props.selectedValue);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={props.accessibilityLabel} accessibilityValue={{ text: selected?.props.label }} accessibilityState={{ expanded: open, disabled: props.enabled === false }} disabled={props.enabled === false} onPress={() => setOpen(true)} style={{ minHeight: 50, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text numberOfLines={2} style={{ color: colors.text, fontSize: 16, flex: 1 }}>{selected?.props.label ?? 'Selecione'}</Text><Text style={{ color: colors.primary }}> ▾</Text>
    </Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' }}>
        <Pressable accessibilityLabel="Fechar seleção" onPress={() => setOpen(false)} style={{ flex: 1 }} />
        <View accessibilityViewIsModal style={{ maxHeight: '70%', backgroundColor: colors.surface, padding: 20, paddingBottom: Math.max(insets.bottom, 20), borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>{props.accessibilityLabel ?? 'Selecione uma opção'}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">{options.map((o, index) => <Pressable key={String(o.props.value)} accessibilityRole="radio" accessibilityState={{ checked: o.props.value === props.selectedValue, disabled: o.props.enabled === false }} disabled={o.props.enabled === false} onPress={() => { props.onValueChange?.(o.props.value, index); setOpen(false); }} style={{ minHeight: 48, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.border }}><Text style={{ color: o.props.value === props.selectedValue ? colors.primary : colors.text, fontSize: 16 }}>{o.props.label}{o.props.value === props.selectedValue ? ' ✓' : ''}</Text></Pressable>)}</ScrollView>
          <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Concluir</Text></Pressable>
        </View>
      </View>
    </Modal>
  </>;
}
export const Picker = Object.assign(CompactPicker, { Item: NativePicker.Item });
