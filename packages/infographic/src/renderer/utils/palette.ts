import { getItemIndexes } from '../../utils';
import { getPalette, type Palette } from '../palettes';

export const getPaletteColor = (
  args: string | Palette = [],
  id: string,
  total?: number,
) => {
  const indexes = getItemIndexes(id);

  const palette = typeof args === 'string' ? getPalette(args) || [] : args;
  if (palette.length === 0) return;

  // TODO 待完善取色逻辑
  const index = indexes[1] || indexes[0] || 0;

  if (Array.isArray(palette)) {
    return palette[index % palette.length] as string;
  }
  if (typeof palette === 'function') {
    const ratio = total ? index / total : 0;
    return palette(ratio, index, total ?? 0);
  }
};
