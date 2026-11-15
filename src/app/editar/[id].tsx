import { useLocalSearchParams } from 'expo-router';
import OccurrenceFormScreen from '../../forms/occurrence-screen';
export default function EditOccurrenceScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <OccurrenceFormScreen occurrenceId={(Array.isArray(id) ? id[0] : id) ?? ''} />;
}
