import { useCurrentFrame, useVideoConfig } from "remotion";
import { interpolate } from "remotion";

export function useSlideTiming() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Overall slide: fade in over first 12 frames, fade out over last 8 frames
  const opacity = interpolate(
    frame,
    [0, 12, durationInFrames - 8, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Staggered child fade-in: each index starts 6 frames after the previous
  const childOpacity = (index: number): number =>
    interpolate(
      frame,
      [index * 6, index * 6 + 12],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

  // Staggered child Y slide-up: 20px → 0px, matching childOpacity timing
  const childY = (index: number): number =>
    interpolate(
      frame,
      [index * 6, index * 6 + 12],
      [20, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

  // Animated score counter: counts from 0 to targetScore starting at delayFrames
  const scoreCounter = (targetScore: number, delayFrames: number = 0): number => {
    const animationDuration = 30; // frames to count up
    const value = interpolate(
      frame,
      [delayFrames, delayFrames + animationDuration],
      [0, targetScore],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return Math.round(value);
  };

  return { frame, opacity, childOpacity, childY, scoreCounter };
}
