import { parseDynamicAttributes } from '@/renderer/utils/attrs';
import { describe, expect, it } from 'vitest';

describe('attrs', () => {
  describe('parseDynamicAttributes', () => {
    it('should parse static attributes correctly', () => {
      const mockElement = {
        getAttribute: () => null,
      } as unknown as SVGElement;

      const attributes = {
        width: 100,
        height: 200,
        fill: 'red',
      };

      const result = parseDynamicAttributes(mockElement, attributes);
      expect(result).toEqual({
        width: 100,
        height: 200,
        fill: 'red',
      });
    });

    it('should parse dynamic attributes with functions', () => {
      const mockElement = {
        getAttribute: (attr: string) => {
          const attrMap: Record<string, string> = {
            width: '150',
            height: '250',
          };
          return attrMap[attr] || null;
        },
      } as unknown as SVGElement;

      const attributes: any = {
        width: (value: string | null) =>
          value ? parseInt(value, 10) : undefined,
        height: (value: string | null) =>
          value ? parseInt(value, 10) : undefined,
        fill: 'blue',
      };

      const result = parseDynamicAttributes(mockElement, attributes);
      expect(result).toEqual({
        width: 150,
        height: 250,
        fill: 'blue',
      });
    });

    it('should apply primary color to fill and stroke when not already set', () => {
      const mockElement = {
        getAttribute: (attr: string) => {
          const attrMap: Record<string, string> = {
            fill: 'red',
            stroke: 'blue',
          };
          return attrMap[attr] || null;
        },
      } as unknown as SVGElement;

      const attributes = {
        width: 100,
      };

      const result = parseDynamicAttributes(mockElement, attributes, 'green');
      expect(result).toEqual({
        width: 100,
        fill: 'green',
        stroke: 'green',
      });
    });

    it('should not override existing fill and stroke attributes', () => {
      const mockElement = {
        getAttribute: (attr: string) => {
          const attrMap: Record<string, string> = {
            fill: 'red',
            stroke: 'blue',
          };
          return attrMap[attr] || null;
        },
      } as unknown as SVGElement;

      const attributes = {
        fill: 'yellow',
        stroke: 'purple',
        width: 100,
      };

      const result = parseDynamicAttributes(mockElement, attributes, 'green');
      expect(result).toEqual({
        fill: 'yellow',
        stroke: 'purple',
        width: 100,
      });
    });

    it('should skip function attributes that return falsy values', () => {
      const mockElement = {
        getAttribute: () => null,
      } as unknown as SVGElement;

      const attributes = {
        width: () => null,
        height: () => undefined,
        fill: 'red',
      };

      const result = parseDynamicAttributes(mockElement, attributes);
      expect(result).toEqual({
        fill: 'red',
      });
    });
  });
});
