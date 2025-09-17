import { ElementTypeEnum } from '../constants';
import type { ParsedInfographicOptions } from '../options';
import {
  getDatumByIndexes,
  getItemIndexes,
  getSizeBaseVal,
  isBtnsGroup,
  isDesc,
  isIllus,
  isItemDesc,
  isItemElement,
  isItemIcon,
  isItemIconGroup,
  isItemIllus,
  isItemLabel,
  isItemShape,
  isItemShapesGroup,
  isItemValue,
  isShape,
  isShapeGroup,
  isText,
  isTitle,
  parsePadding,
} from '../utils';
import {
  renderBackground,
  renderButtonsGroup,
  renderIllus,
  renderItemIcon,
  renderItemShape,
  renderItemText,
  renderShape,
  renderStaticShape,
  renderStaticText,
  renderSVG,
  renderText,
} from './composites';
import type { IRenderer } from './types';
import { getPaletteColor } from './utils';

const upsert = (original: SVGElement, modified: SVGElement | null) => {
  if (original === modified) return;
  if (!modified) original.remove();
  else original.replaceWith(modified);
};

export class Renderer implements IRenderer {
  private rendered = false;

  constructor(
    private options: ParsedInfographicOptions,
    private template: SVGSVGElement,
  ) {}

  public getOptions(): ParsedInfographicOptions {
    return this.options;
  }

  public getSVG(): SVGSVGElement {
    return this.template;
  }

  render(): SVGSVGElement {
    const svg = this.getSVG();
    if (this.rendered) return svg;

    renderTemplate(svg, this.options);
    this.rendered = true;
    return svg;
  }

  postRender() {
    this.rendered = false;
    setView(this.template, this.options);
  }
}

function renderTemplate(svg: SVGSVGElement, options: ParsedInfographicOptions) {
  fill(svg, options);

  const { themeConfig } = options;
  renderBackground(svg, themeConfig?.background);
}

function fill(svg: SVGSVGElement, options: ParsedInfographicOptions) {
  const { themeConfig, data } = options;
  const topLevelItemKeys = collectTopLevelItemKeys(svg);

  const traverse = (element: SVGElement) => {
    if (element instanceof SVGSVGElement) {
      renderSVG(svg, options);

      return Array.from(element.children).forEach((child) => {
        traverse(child as SVGElement);
      });
    }

    const id = element.id || '';

    if (isTitle(element)) {
      const modified = renderText(
        element,
        data.title || '',
        Object.assign({}, themeConfig.base?.text, themeConfig.title),
      );
      return upsert(element, modified);
    }

    if (isDesc(element)) {
      const modified = renderText(
        element,
        data.desc || '',
        Object.assign({}, themeConfig.base?.text, themeConfig.desc),
      );
      return upsert(element, modified);
    }

    if (isIllus(element)) {
      const modified = renderIllus(svg, element, data.illus?.[id]);
      return upsert(element, modified);
    }

    if (isShapeGroup(element)) {
      return Array.from(element.children).forEach((child) => {
        renderShape(svg, child as SVGElement, options);
      });
    }

    if (isShape(element)) {
      const modified = renderShape(svg, element, options);
      return upsert(element, modified);
    }

    if (isBtnsGroup(element)) {
      return renderButtonsGroup(svg, element as SVGGElement);
    }

    if (isItemElement(element)) {
      const [, , itemType] = id.split('-');
      const indexes = getItemIndexes(id);
      const primaryColor = getPaletteColor(
        themeConfig.palette,
        id,
        topLevelItemKeys.length,
      );

      if (isItemLabel(element) || isItemDesc(element) || isItemValue(element)) {
        const modified = renderItemText(
          itemType as 'label' | 'desc' | 'value',
          element,
          options,
          primaryColor,
        );
        return upsert(element, modified);
      }

      if (isItemIllus(element)) {
        const modified = renderIllus(
          svg,
          element,
          getDatumByIndexes(data, indexes)?.illus,
        );
        return upsert(element, modified);
      }

      if (isItemIconGroup(element)) {
        element.setAttribute('data-element-type', ElementTypeEnum.IconGroup);
      }

      if (isItemIcon(element)) {
        const modified = renderItemIcon(
          svg,
          element,
          getDatumByIndexes(data, indexes)?.icon,
          options,
        );
        return upsert(element, modified);
      }

      if (isItemShapesGroup(element)) {
        return Array.from(element.children).forEach((child) => {
          renderItemShape(svg, child as SVGElement, options, primaryColor);
        });
      }

      if (isItemShape(element)) {
        const modified = renderItemShape(svg, element, options, primaryColor);
        return upsert(element, modified);
      }
    }

    if (isText(element)) {
      return renderStaticText(element, options);
    }

    if (!(element instanceof SVGGElement)) {
      return renderStaticShape(element, options);
    }

    Array.from(element.children).forEach((child) => {
      traverse(child as SVGElement);
    });
  };

  traverse(svg);
}

function setView(svg: SVGSVGElement, options: ParsedInfographicOptions) {
  const { padding = 20, viewBox } = options;

  if (viewBox) {
    svg.setAttribute('viewBox', viewBox);
  } else if (padding !== undefined) {
    setSVGPadding(svg, parsePadding(padding));
  }
}

interface SVGPaddingOptions {
  /** 是否保持宽高比 (默认: true) */
  preserveAspectRatio?: boolean;
}

function setSVGPadding(
  svg: SVGSVGElement,
  padding: [number, number, number, number],
  options: SVGPaddingOptions = {},
): boolean {
  const { preserveAspectRatio = true } = options;
  if (!svg.isConnected) return false;

  try {
    const bbox = svg.getBBox();

    // 检查包围盒是否有效
    if (bbox.width === 0 || bbox.height === 0) {
      return false;
    }
    const [widthBaseVal, heightBaseVal] = getSizeBaseVal(svg);

    const svgWidth = widthBaseVal || svg.clientWidth || 0;
    const svgHeight = heightBaseVal || svg.clientHeight || 0;

    const parentElement = svg.parentElement;
    const effectiveWidth =
      svgWidth || (parentElement ? parentElement.clientWidth : 300);
    const effectiveHeight =
      svgHeight || (parentElement ? parentElement.clientHeight : 150);

    const scaleX = bbox.width / effectiveWidth;
    const scaleY = bbox.height / effectiveHeight;

    let viewBoxPadding: number[];

    if (preserveAspectRatio) {
      const scale = Math.max(scaleX, scaleY);
      viewBoxPadding = padding.map((p) => p * scale);
    } else {
      viewBoxPadding = [
        padding[0] * scaleY,
        padding[1] * scaleX,
        padding[2] * scaleY,
        padding[3] * scaleX,
      ];
    }

    const newViewBox = [
      bbox.x - viewBoxPadding[3],
      bbox.y - viewBoxPadding[0],
      bbox.width + viewBoxPadding[1] + viewBoxPadding[3],
      bbox.height + viewBoxPadding[0] + viewBoxPadding[2],
    ].join(' ');

    // 设置新的 viewBox
    svg.setAttribute('viewBox', newViewBox);

    return true;
  } catch {
    return false;
  }
}

function collectItemKeys(svg: SVGSVGElement) {
  const items = svg.querySelectorAll('g[id^="item-"]');
  const ids = new Set<string>();
  const indexes: number[][] = [];
  items.forEach((item) => {
    const id = item.id;
    if (!ids.has(id)) {
      ids.add(id);
      const itemIndexes = getItemIndexes(id);
      indexes.push(itemIndexes);
    }
  });
  return indexes.sort((a, b) => a[0] - b[0]);
}

/**
 * 获取一级数据项 key, 用于分配色板
 */
function collectTopLevelItemKeys(svg: SVGSVGElement) {
  const itemKeys = collectItemKeys(svg);
  return Array.from(new Set(itemKeys.map((keys) => keys[0]))).sort(
    (a, b) => a - b,
  );
}
