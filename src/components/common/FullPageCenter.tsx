import React from "react";
import { makeStyles, mergeClasses } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
});

interface FullPageCenterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const FullPageCenter: React.FC<FullPageCenterProps> = ({
  className,
  children,
  ...props
}) => {
  const styles = useStyles();
  return (
    <div {...props} className={mergeClasses(styles.root, className)}>
      {children}
    </div>
  );
};
