import { makeStyles, tokens } from "@fluentui/react-components";

export const useBreadcrumbStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 0",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  divider: {
    color: tokens.colorNeutralForeground4,
    fontSize: "14px",
  },
});
