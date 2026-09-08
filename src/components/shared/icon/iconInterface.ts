import { SVGProps } from 'react';

export interface IconInterface extends SVGProps<SVGSVGElement> {
  hasBackground?: boolean;
  size?: string | number;
  bgSize?: string | number;
  color?: string;
  bgColor?: string;
  width?: string | number;
  height?: string | number;
}
