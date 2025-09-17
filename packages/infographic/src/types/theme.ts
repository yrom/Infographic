import { Palette, StylizeConfig } from '../renderer';
import { IconAttributes, ShapeAttributes, TextAttributes } from './attrs';

export type DynamicAttributes<T extends object, R extends any[] = []> = {
  [key in keyof T]?: T[key] | ((value: T[key], ...args: R) => T[key]);
};

export type DynamicItemAttribute<T extends object> = DynamicAttributes<
  T,
  [string | null] // paletteColor
>;

export interface ThemeConfig {
  base?: {
    shape?: TextAttributes;
    text?: TextAttributes;
  };
  background?: string;
  palette?: Palette;
  title?: TextAttributes;
  desc?: TextAttributes;
  shape?: TextAttributes;
  item?: {
    icon?: DynamicItemAttribute<IconAttributes>;
    label?: DynamicItemAttribute<TextAttributes>;
    desc?: DynamicItemAttribute<TextAttributes>;
    value?: DynamicItemAttribute<TextAttributes>;
    shape?: DynamicItemAttribute<ShapeAttributes>;
  };
  stylize?: StylizeConfig | null;
  elements?: Record<string, ShapeAttributes | TextAttributes>;
}
