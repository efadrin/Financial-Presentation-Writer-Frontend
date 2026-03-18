import React, { PropsWithChildren, ReactNode } from 'react';

interface RenderWhenProps extends PropsWithChildren {
  condition: boolean;
  fallback?: ReactNode;
}

const RenderWhen: React.FC<RenderWhenProps> = ({
  children,
  condition,
  fallback = null,
}: Readonly<RenderWhenProps>) => {
  if (condition) {
    return <>{children}</>;
  } else return fallback;
};

export default RenderWhen;
