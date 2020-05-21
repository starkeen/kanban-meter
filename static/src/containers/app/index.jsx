import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';

import '@hh.ru/react-d3-chart-graphs/dist/styles.css';

import { toggled } from '../../modules/toggleDrawer';
import getHeader from '../../modules/titleHelper';
import routeMap from '../../modules/routePath';
import { kanbanMetricsMenuItems, mainMenuItems, bugMenuItems } from '../../modules/menu';
import urlParams from '../../modules/urlParams';

import ArrowBackButton from '../../components/ArrowBackIcon';
import MainContainer from '../mainContainer';
import FiltersTeamContainer from '../filtersTeam';
import FilterLabels from '../../components/FilterLabels';
import FiltersDate from '../../components/FiltersDate';
import FilterByOpen from '../../components/FilterByOpen';
import NotificationManager from '../../components/NotificationManager';
import Tooltip from '../../components/Tooltip';
import Menu from '../../components/Menu';

const styleDrawer = { overflowX: 'hidden' };

class App extends Component {
    componentWillMount() {
        const startDate = urlParams.getValue('start_date');
        const endDate = urlParams.getValue('end_date');
        const date = new Date();

        if (endDate === null) {
            this.props.push(urlParams.update('end_date', date.toISOString()));
        }

        if (startDate === null) {
            const month = date.getMonth();
            date.setMonth(month - 1);
            this.props.push(urlParams.update('start_date', date.toISOString()));
        }

        const includeOpen = urlParams.getValue('include_open');

        if (includeOpen === null) {
            this.props.push(urlParams.update('include_open', 'false'));
        }
    }

    handleChangeMenu = (event, value) => {
        if (value) {
            this.props.push(`${value}${this.props.location.search}`);
        }
    };

    handleToggle() {
        this.props.toggled(!this.props.isOpen);
    }

    shouldDisableStartDate = (date) => {
        const currentDate = new Date(date);
        return currentDate.getDate() !== 1;
    };

    shouldDisableEndDate = (date) => {
        const currentDate = new Date(date);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        return currentDate.getDate() !== lastDay.getDate();
    };

    render() {
        const { routePath, isOpen } = this.props;
        const isKanbanMetricsMenu = routePath.search(routeMap.kanbanMetrics) === 0;
        const isBugMetricsMenu = routePath.search(routeMap.bugMetrics) === 0;
        let menuItems;

        if (isKanbanMetricsMenu) {
            menuItems = kanbanMetricsMenuItems;
        } else if (isBugMetricsMenu) {
            menuItems = bugMenuItems;
        } else {
            menuItems = mainMenuItems;
        }

        return (
            <div>
                <AppBar
                    title={getHeader(routePath)}
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                    onLeftIconButtonTouchTap={this.handleToggle.bind(this)}
                    titleStyle={{
                        transition: 'padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        paddingLeft: isOpen ? '245px' : '0',
                    }}
                />
                <Drawer open={isOpen} containerStyle={styleDrawer}>
                    <AppBar
                        onLeftIconButtonTouchTap={this.handleToggle.bind(this)}
                        iconElementLeft={
                            <IconButton>
                                <ArrowBackButton />
                            </IconButton>
                        }
                    />
                    <Menu menuItems={menuItems} onChange={this.handleChangeMenu} routePath={routePath} />
                    <Divider />
                    <FiltersDate
                        shouldDisableStartDate={isBugMetricsMenu && this.shouldDisableStartDate}
                        shouldDisableEndDate={isBugMetricsMenu && this.shouldDisableEndDate}
                    />
                    <FiltersTeamContainer />
                    {isKanbanMetricsMenu && <FilterLabels />}
                    {isKanbanMetricsMenu && routeMap.cumulativeFlowDiagram !== routePath && <FilterByOpen />}
                </Drawer>
                <MainContainer routePath={routePath} location={this.props.location} />
                <NotificationManager />
                <Tooltip location={this.props.location} />
            </div>
        );
    }
}

export default connect(
    (state) => ({
        routePath: state.routing.location.pathname,
        location: state.routing.location,
        isOpen: state.toggleDrawer,
    }),
    {
        toggled,
        push,
    }
)(App);
