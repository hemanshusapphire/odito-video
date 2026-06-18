import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { smooth } from "../../lib/easing";
import { StarIcon } from "../assets/StarIcon";

interface StarRatingProps {
  rating: number;
  max?: number;
  delay?: number;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  delay = 0,
  size = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: smooth,
  });

  const animatedRating = progress * rating;
  const stars = Array.from({ length: max }, (_, i) => {
    const fill = Math.min(Math.max(animatedRating - i, 0), 1);
    return fill;
  });

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {stars.map((fill, i) => (
        <StarIcon key={i} size={size} fill={fill} />
      ))}
    </div>
  );
};
