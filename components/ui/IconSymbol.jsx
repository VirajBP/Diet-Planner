import { Image } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

export function IconSymbol({ name, size = 24, color, style }) {
  const tintColor = useThemeColor({ light: color, dark: color }, 'text');
  
  return (
    <Image
      source={{ uri: `https://symbols.expo.dev/icons/${name}.png` }}
      style={[
        {
          width: size,
          height: size,
          tintColor,
        },
        style,
      ]}
    />
  );
} 