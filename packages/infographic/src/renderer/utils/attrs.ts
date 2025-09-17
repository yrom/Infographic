import type { DynamicAttributes, DynamicItemAttribute } from '../../types';
import { hasColor } from '../../utils';

export function parseDynamicAttributes<T extends object>(
  node: SVGElement,
  attributes: DynamicAttributes<T> | DynamicItemAttribute<T>,
  primaryColor?: string,
): T {
  const attrs = Object.entries(attributes).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
      const staticValue = value(node.getAttribute(key), primaryColor);
      if (staticValue) acc[key as keyof T] = staticValue;
    } else {
      Object.assign(acc, { [key]: value });
    }
    return acc;
  }, {} as T);

  if (primaryColor) {
    if (!('fill' in attrs) && hasColor(node.getAttribute('fill')))
      Object.assign(attrs, { fill: primaryColor });
    if (!('stroke' in attrs) && hasColor(node.getAttribute('stroke')))
      Object.assign(attrs, { stroke: primaryColor });
  }

  return attrs;
}
