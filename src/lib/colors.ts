import type { NodeColor } from '../types';

type ColorClasses = {
  bg: string;
  border: string;
  text: string;
  accent: string;
  ring: string;
  swatch: string;
  miniMap: string;
};

export const COLOR_MAP: Record<NodeColor, ColorClasses> = {
  yellow:  { bg: 'bg-yellow-100 dark:bg-yellow-900/40',     border: 'border-yellow-400 dark:border-yellow-600',     text: 'text-yellow-900 dark:text-yellow-100',     accent: 'text-yellow-700 dark:text-yellow-300',     ring: 'ring-yellow-500',  swatch: 'bg-yellow-400',  miniMap: '#facc15' },
  blue:    { bg: 'bg-blue-100 dark:bg-blue-900/40',         border: 'border-blue-400 dark:border-blue-600',         text: 'text-blue-900 dark:text-blue-100',         accent: 'text-blue-700 dark:text-blue-300',         ring: 'ring-blue-500',    swatch: 'bg-blue-400',    miniMap: '#60a5fa' },
  green:   { bg: 'bg-green-100 dark:bg-green-900/40',       border: 'border-green-400 dark:border-green-600',       text: 'text-green-900 dark:text-green-100',       accent: 'text-green-700 dark:text-green-300',       ring: 'ring-green-500',   swatch: 'bg-green-400',   miniMap: '#4ade80' },
  red:     { bg: 'bg-red-100 dark:bg-red-900/40',           border: 'border-red-400 dark:border-red-600',           text: 'text-red-900 dark:text-red-100',           accent: 'text-red-700 dark:text-red-300',           ring: 'ring-red-500',     swatch: 'bg-red-400',     miniMap: '#f87171' },
  purple:  { bg: 'bg-purple-100 dark:bg-purple-900/40',     border: 'border-purple-400 dark:border-purple-600',     text: 'text-purple-900 dark:text-purple-100',     accent: 'text-purple-700 dark:text-purple-300',     ring: 'ring-purple-500',  swatch: 'bg-purple-400',  miniMap: '#c084fc' },
  pink:    { bg: 'bg-pink-100 dark:bg-pink-900/40',         border: 'border-pink-400 dark:border-pink-600',         text: 'text-pink-900 dark:text-pink-100',         accent: 'text-pink-700 dark:text-pink-300',         ring: 'ring-pink-500',    swatch: 'bg-pink-400',    miniMap: '#f472b6' },
  orange:  { bg: 'bg-orange-100 dark:bg-orange-900/40',     border: 'border-orange-400 dark:border-orange-600',     text: 'text-orange-900 dark:text-orange-100',     accent: 'text-orange-700 dark:text-orange-300',     ring: 'ring-orange-500',  swatch: 'bg-orange-400',  miniMap: '#fb923c' },
  slate:   { bg: 'bg-slate-100 dark:bg-slate-800',          border: 'border-slate-400 dark:border-slate-600',       text: 'text-slate-900 dark:text-slate-100',       accent: 'text-slate-700 dark:text-slate-300',       ring: 'ring-slate-500',   swatch: 'bg-slate-400',   miniMap: '#94a3b8' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/40',   border: 'border-emerald-400 dark:border-emerald-600',   text: 'text-emerald-900 dark:text-emerald-100',   accent: 'text-emerald-700 dark:text-emerald-300',   ring: 'ring-emerald-500', swatch: 'bg-emerald-400', miniMap: '#34d399' },
  indigo:  { bg: 'bg-indigo-100 dark:bg-indigo-900/40',     border: 'border-indigo-400 dark:border-indigo-600',     text: 'text-indigo-900 dark:text-indigo-100',     accent: 'text-indigo-700 dark:text-indigo-300',     ring: 'ring-indigo-500',  swatch: 'bg-indigo-400',  miniMap: '#818cf8' },
  teal:    { bg: 'bg-teal-100 dark:bg-teal-900/40',         border: 'border-teal-400 dark:border-teal-600',         text: 'text-teal-900 dark:text-teal-100',         accent: 'text-teal-700 dark:text-teal-300',         ring: 'ring-teal-500',    swatch: 'bg-teal-400',    miniMap: '#2dd4bf' },
  rose:    { bg: 'bg-rose-100 dark:bg-rose-900/40',         border: 'border-rose-400 dark:border-rose-600',         text: 'text-rose-900 dark:text-rose-100',         accent: 'text-rose-700 dark:text-rose-300',         ring: 'ring-rose-500',    swatch: 'bg-rose-400',    miniMap: '#fb7185' },
};
