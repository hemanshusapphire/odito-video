import React from "react";

interface StaggerChildrenProps {
  staggerDelay?: number;
  initialDelay?: number;
  children: React.ReactNode;
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  staggerDelay = 8,
  initialDelay = 0,
  children,
}) => {
  const items = React.Children.toArray(children);

  return (
    <>
      {items.map((child, i) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ delay?: number }>, {
          delay: initialDelay + i * staggerDelay,
        });
      })}
    </>
  );
};
