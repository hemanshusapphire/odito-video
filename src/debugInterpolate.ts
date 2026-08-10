import { interpolate as originalInterpolate } from 'remotion';

export const debugInterpolate = (...args: any[]): any => {
  return originalInterpolate(...(args as [any, any, any, any]));
};
