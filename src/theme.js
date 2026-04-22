import { Platform, Dimensions } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const C = {
  bgDeep:     '#06060f',
  bgCard:     '#0d0d1e',
  bgElevated: '#141428',
  bgHover:    '#1a1a35',
  cyan:       '#00d4ff',
  cyanDim:    'rgba(0,212,255,0.15)',
  cyanBorder: 'rgba(0,212,255,0.25)',
  purple:     '#7c3aed',
  purpleDim:  'rgba(124,58,237,0.15)',
  purpleBorder:'rgba(124,58,237,0.3)',
  green:      '#10b981',
  greenDim:   'rgba(16,185,129,0.15)',
  greenBorder:'rgba(16,185,129,0.3)',
  amber:      '#f59e0b',
  amberDim:   'rgba(245,158,11,0.15)',
  amberBorder:'rgba(245,158,11,0.3)',
  red:        '#ef4444',
  redDim:     'rgba(239,68,68,0.15)',
  redBorder:  'rgba(239,68,68,0.3)',
  pink:       '#ec4899',
  textPrimary:'#e2e8f0',
  textSec:    '#94a3b8',
  textDim:    '#475569',
  border:     'rgba(0,212,255,0.1)',
  borderSub:  'rgba(255,255,255,0.06)',
};

export const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const S = {
  card: {
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textDim,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  h1: { fontSize: 26, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700', color: C.textPrimary },
  h3: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  body: { fontSize: 15, color: C.textPrimary, lineHeight: 24 },
  bodySec: { fontSize: 14, color: C.textSec, lineHeight: 22 },
};

export const DOMAIN_COLORS = [
  { accent: C.cyan,   dim: C.cyanDim,   border: C.cyanBorder },
  { accent: C.purple, dim: C.purpleDim, border: C.purpleBorder },
  { accent: C.green,  dim: C.greenDim,  border: C.greenBorder },
  { accent: C.amber,  dim: C.amberDim,  border: C.amberBorder },
  { accent: C.pink,   dim: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)' },
];

export const XP_PER_LEVEL = 500;
export const getLevel = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getLevelProgress = (xp) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
export const getLevelXP = (xp) => xp % XP_PER_LEVEL;
