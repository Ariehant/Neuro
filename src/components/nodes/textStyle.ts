import type { CSSProperties } from 'react';
import type { TextStyle } from '../../types';

export function applyTextStyle(style?: TextStyle): CSSProperties {
  if (!style) return {};
  return {
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style.bold ? 700 : undefined,
    fontStyle: style.italic ? 'italic' : undefined,
    textAlign: style.align,
  };
}
