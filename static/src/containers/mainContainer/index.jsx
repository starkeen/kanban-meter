import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';

import LeadTimePageContainer from '../leadTimePage';
import Home from '../home';
import DashboardKanbanMetrics from '../dashboardKanbanMetrics';
import StackedBarGraph from '../stackedBarChart';
import StatusesBarChart from '../statusesBarChart';
import TableData from '../tableData';
import StatisticsLeadTime from '../statisticsLeadTime';
import BoxPlotLeadTime from '../boxPlotLeadTime';
import BoxPlotStatuses from '../boxPlotStatuses';
import BoxPlotHH from '../boxPlotHH';
import ControlChart from '../controlChart';
import CumulativeFlowDiagram from '../cumulativeFlowDiagram';
import TransitionsTable from '../transitionsTable';
import BlockersTable from '../blockersTablePage';
import BoxPlotClosedBugs from '../boxPlotClosedBugs';
import BugsToTasks from '../bugsToTasks';
import BugsUnresolved from '../bugsUnresolved';
import BugsResolvedToCreated from '../bugsResolvedToCreated';
import DashboardBugsMetrics from '../dashboardBugsMetrics';
import Update from '../update';

import { toggled } from '../../modules/toggleDrawer';
import { toggleDrawerAnimationEnd } from '../../modules/toggleDrawerAnimationEnd';
import routeMap from '../../modules/routePath';

const AppContentWrapper = styled.div`
    @media screen and (min-width: 700px) {
        margin: 0 30px;
        width: calc(100% - 60px);
    }
`;

const AppContent = styled.div`
    padding-top: 30px;
    transition: padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1);
    ${(props) => (props.isOpen ? 'padding-left: 280px' : '')};
`;

class MainContainer extends Component {
    componentDidMount() {
        this.element.addEventListener('transitionend', this.toggleDrawerAnimation);
    }

    componentWillUnmount() {
        this.element.removeEventListener('transitionend', this.toggleDrawerAnimation);
    }

    toggleDrawerAnimation = () => {
        this.props.toggleDrawerAnimationEnd(!this.props.toggleDrawerAnimationEndState);
    };

    innerRef = (element) => {
        this.element = element;
    };

    render() {
        const { isOpen } = this.props;

        return (
            <AppContentWrapper>
                <AppContent innerRef={this.innerRef} isOpen={isOpen}>
                    <Switch location={this.props.location}>
                        <Route exact path={routeMap.home} component={Home} />
                        <Route exact path={routeMap.update} component={Update} />

                        <Route path={routeMap.dashboard} component={DashboardKanbanMetrics} />
                        <Route path={routeMap.leadTimeChart} component={LeadTimePageContainer} />
                        <Route path={routeMap.statusesBarChart} component={StatusesBarChart} />
                        <Route path={routeMap.stackedBarChart} component={StackedBarGraph} />
                        <Route path={routeMap.boxPlotLeadTimeChart} component={BoxPlotLeadTime} />
                        <Route path={routeMap.boxPlotStatusesChart} component={BoxPlotStatuses} />
                        <Route path={routeMap.boxPlotHHChart} component={BoxPlotHH} />
                        <Route path={routeMap.dataCharts} component={TableData} />
                        <Route path={routeMap.statisticsLeadTime} component={StatisticsLeadTime} />
                        <Route path={routeMap.controlChart} component={ControlChart} />
                        <Route path={routeMap.cumulativeFlowDiagram} component={CumulativeFlowDiagram} />
                        <Route path={routeMap.transitionsTable} component={TransitionsTable} />
                        <Route path={routeMap.blockersTable} component={BlockersTable} />

                        <Route path={routeMap.bugsBoxPlotClosed} component={BoxPlotClosedBugs} />
                        <Route path={routeMap.bugDashboard} component={DashboardBugsMetrics} />
                        <Route path={routeMap.bugToTasks} component={BugsToTasks} />
                        <Route path={routeMap.bugsUnresolved} component={BugsUnresolved} />
                        <Route path={routeMap.bugsResolvedToCreated} component={BugsResolvedToCreated} />
                    </Switch>
                </AppContent>
            </AppContentWrapper>
        );
    }
}

export default connect(
    (state) => ({
        isOpen: state.toggleDrawer,
        toggleDrawerAnimationEndState: state.toggleDrawerAnimationEnd,
    }),
    {
        toggled,
        toggleDrawerAnimationEnd,
    }
)(MainContainer);
