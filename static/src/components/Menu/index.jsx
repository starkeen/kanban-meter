import React from 'react';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import t from '../../modules/translations';

const styleDefault = {
    fontSize: '14px',
    whiteSpace: 'normal',
};

const styleActive = {
    ...styleDefault,
    backgroundColor: '#E1F5FE',
};

const toggleSelectedMenu = (routePath, path) => (routePath === path ? styleActive : styleDefault);

const MenuComponent = (props) => {
    const { menuItems, routePath, onChange } = props;

    return (
        <Menu desktop onChange={onChange}>
            {menuItems.map((item) => (
                <MenuItem
                    value={item.route}
                    key={item.route}
                    primaryText={t(item.trlKey)}
                    style={toggleSelectedMenu(routePath, item.route)}
                />
            ))}
        </Menu>
    );
};

export default MenuComponent;
