import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import toggleDrawerAnimationEndReducer from './toggleDrawerAnimationEnd';
import toggleDrawer from './toggleDrawer';
import notificationManager from './notificationManager';
import tableDataFetch from './graphData';
import leadTimeBarCharData from './leadTimeBarCharData';
import leadTimeTableData from './leadTimeTableData';
import statusesBarChartData from './statusesBarChartData';
import stackedBarChartData from './stackedBarChartData';
import boxPlotLeadTimeData from './boxPlotLeadTimeData';
import boxPlotStatusesData from './boxPlotStatusesData';
import boxPlotHHData from './boxPlotHHData';
import filtersTeamData from './filtersTeam';
import statisticsLeadTimeTableData from './statisticsLeadTimeTableData';
import filterByStatus from './filterByStatus';
import controlChartData from './controlChartData';
import cumulativeFlowDiagramData from './cumulativeFlowDiagramData';
import tasksPortfolio from './fetchTasks';
import transitionsTableData from './transitionsTableData';
import tooltip from './tooltip';
import filterLabelsData from './filterLabelsData';
import boxPlotClosedBugsData from './boxPlotClosedBugsData';
import bugsToTasksData from './bugsToTasksData';
import bugsUnresolved from './bugsUnresolved';
import bugsResolvedToCreated from './bugsResolvedToCreated';
import updateData from './updateData';
import blockersTableData from './blockersTableData';

export default combineReducers({
    routing: routerReducer,
    toggleDrawer,
    toggleDrawerAnimationEndReducer,
    notificationManager,
    tableDataFetch,
    leadTimeBarCharData,
    leadTimeTableData,
    statusesBarChartData,
    stackedBarChartData,
    boxPlotLeadTimeData,
    boxPlotStatusesData,
    boxPlotHHData,
    filtersTeamData,
    statisticsLeadTimeTableData,
    controlChartData,
    cumulativeFlowDiagramData,
    filterByStatus,
    tasksPortfolio,
    transitionsTableData,
    tooltip,
    filterLabelsData,
    boxPlotClosedBugsData,
    bugsToTasksData,
    bugsUnresolved,
    bugsResolvedToCreated,
    updateData,
    blockersTableData,
});
