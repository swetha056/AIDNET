import { InstitutionView } from '../../screens/InstitutionView';
import { useUser } from '../../UserContext';
import { View, Text } from 'react-native';

export default function InstitutionScreen() {
  const { user, isLoading } = useUser();
  if (isLoading) return <View><Text>Loading...</Text></View>;
  if (user?.role !== 'Institution') return null;
  return <InstitutionView />;
}
