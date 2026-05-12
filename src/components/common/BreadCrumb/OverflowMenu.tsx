import React from "react";
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  Button,
} from "@fluentui/react-components";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { Item } from "./types";
import { MenuItem } from "./MenuItem";

interface OverflowMenuProps {
  items: Item[];
}

export const OverflowMenu: React.FC<OverflowMenuProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          size="small"
          icon={<MoreHorizontal20Regular />}
          style={{ minWidth: "auto", padding: "2px 4px" }}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {items.map((item) => (
            <MenuItem key={item.key} item={item} />
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
