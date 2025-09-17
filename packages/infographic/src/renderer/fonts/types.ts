export type FontWeightName =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black'
  | 'extrablack';

export interface Font {
  font: string;
  name: string;
  baseUrl: string;
  fontWeight: {
    [keys in FontWeightName]?: string;
  };
}
