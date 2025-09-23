import {
  Infographic,
  loadSVGResource,
  registerResourceLoader,
} from '@antv/infographic';
import { getAsset } from './get-asset';

registerResourceLoader(async (config) => {
  const { data } = config;
  const str = await getAsset('icon', data);
  return loadSVGResource(str);
});

export interface RenderOptions {
  structure?: string;
  item?: string;
  background?: string;
}

export function render({
  structure = 'list-column',
  item = 'pyramid',
  background,
}: RenderOptions) {
  const container = document.getElementById('root');

  const infographic = new Infographic({
    container,
    width: 800,
    height: 600,
    padding: 20,
    design: {
      structure: { type: structure, gap: 5 },
      title: 'default',
      item: { type: item },
    },
    data: {
      title: 'AntV Infographic',
      desc: 'AntV Infographic is an AI-powered infographic recommendation and generation tool',
      items: [
        {
          icon: '0-001_v1_lineal',
          label: 'AntV G',
          desc: 'Flexible visualization rendering engine',
        },
        {
          icon: '0-013_v1_lineal',
          label: 'AntV G2',
          desc: 'Progressive visualization grammar',
        },
        {
          icon: '10-036_v1_lineal',
          label: 'AntV G6',
          desc: 'Simple, easy-to-use, and comprehensive graph visualization engine',
        },
      ],
    },
    themeConfig: {
      background,
      palette: [
        '#1783FF',
        '#00C9C9',
        '#F0884D',
        '#D580FF',
        '#7863FF',
        '#60C42D',
        '#BD8F24',
        '#FF80CA',
        '#2491B3',
        '#17C76F',
        '#70CAF8',
      ],
    },
  });

  infographic.render();
}
