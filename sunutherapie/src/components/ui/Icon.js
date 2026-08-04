import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../config/theme';

export default function Icon({ name, size = 22, color = colors.text, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
