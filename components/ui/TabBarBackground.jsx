import { View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

export function TabBarBackground() {
  const backgroundColor = useThemeColor({}, 'background');
  return <View style={{ flex: 1, backgroundColor }} />;
} 