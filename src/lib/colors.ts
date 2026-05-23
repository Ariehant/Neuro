import type { NodeColor } from '../types';

type ColorClasses = {
  bg: string;
  border: string;
  text: string;
  accent: string;
  ring: string;
  swatch: string;
};

export const COLOR_MAP: Record<NodeColor, ColorClasses> = {
  yellow:   { bg: 'bg-yellow-100',   border: 'border-yellow-400',   text: 'text-yellow-900',   accent: 'text-yellow-700',   ring: 'ring-yellow-500',   swatch: 'bg-yellow-400' },
  blue:     { bg: 'bg-blue-100',     border: 'border-blue-400',     text: 'text-blue-900',     accent: 'text-blue-700',     ring: 'ring-blue-500',     swatch: 'bg-blue-400' },
  green:    { bg: 'bg-green-100',    border: 'border-green-400',    text: 'text-green-900',    accent: 'text-green-700',    ring: 'ring-green-500',    swatch: 'bg-green-400' },
  red:      { bg: 'bg-red-100',      border: 'border-red-400',      text: 'text-red-900',      accent: 'text-red-700',      ring: 'ring-red-500',      swatch: 'bg-red-400' },
  purple:   { bg: 'bg-purple-100',   border: 'border-purple-400',   text: 'text-purple-900',   accent: 'text-purple-700',   ring: 'ring-purple-500',   swatch: 'bg-purple-400' },
  pink:     { bg: 'bg-pink-100',     border: 'border-pink-400',     text: 'text-pink-900',     accent: 'text-pink-700',     ring: 'ring-pink-500',     swatch: 'bg-pink-400' },
  orange:   { bg: 'bg-orange-100',   border: 'border-orange-400',   text: 'text-orange-900',   accent: 'text-orange-700',   ring: 'ring-orange-500',   swatch: 'bg-orange-400' },
  slate:    { bg: 'bg-slate-100',    border: 'border-slate-400',    text: 'text-slate-900',    accent: 'text-slate-700',    ring: 'ring-slate-500',    swatch: 'bg-slate-400' },
  emerald:  { bg: 'bg-emerald-100',  border: 'border-emerald-400',  text: 'text-emerald-900',  accent: 'text-emerald-700',  ring: 'ring-emerald-500',  swatch: 'bg-emerald-400' },
  indigo:   { bg: 'bg-indigo-100',   border: 'border-indigo-400',   text: 'text-indigo-900',   accent: 'text-indigo-700',   ring: 'ring-indigo-500',   swatch: 'bg-indigo-400' },
};
