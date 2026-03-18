import React from 'react';
import { MenuItem as FluentMenuItem } from '@fluentui/react-components';
import { Item } from './types';

interface MenuItemProps {
  item: Item;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  return (
    <FluentMenuItem onClick={item.onClick}>
      {item.text}
    </FluentMenuItem>
  );
};
