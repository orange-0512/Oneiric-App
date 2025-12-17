import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function StarIcon({ size = 24, color = "#FFFFFF", style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
        fill={color}
      />
    </Svg>
  );
}
