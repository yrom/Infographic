export type Palette =
  | string[]
  | ((ratio: number, index: number, count: number) => string);
