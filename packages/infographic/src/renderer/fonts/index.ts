export { getFontURLs, getWoff2BaseURL, loadFont } from './loader';
export {
  DEFAULT_FONT,
  getFont,
  getFonts,
  registerFont,
  setDefaultFont,
} from './registration';
export type * from './types';
export { decodeFontFamily, encodeFontFamily } from './utils';

import { BUILT_IN_FONTS } from './built-in';
import { registerFont } from './registration';

BUILT_IN_FONTS.forEach(registerFont);
