import { View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export function ThemedView(props) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
} 