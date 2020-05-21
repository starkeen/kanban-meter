import t from './translations';
import routeMap from './routePath';

export default (route) => {
    const routes = {};

    routes[routeMap.home] = t('header.home');
    routes[routeMap.update] = t('header.update');
    routes[routeMap.dashboard] = t('header.dashboard');
    routes[routeMap.leadTimeChart] = t('header.leadTime');
    routes[routeMap.boxPlotLeadTimeChart] = t('header.boxPlot.team');
    routes[routeMap.boxPlotStatusesChart] = t('header.boxPlot.statuses');
    routes[routeMap.boxPlotHHChart] = t('header.boxPlot.HH');
    routes[routeMap.statusesBarChart] = t('header.barChart.statuses');
    routes[routeMap.stackedBarChart] = t('header.stackedBarChart.portfolio');
    routes[routeMap.dataCharts] = t('header.dataGraph.table');
    routes[routeMap.statisticsLeadTime] = t('header.dataLeadTimeStatistics.table');
    routes[routeMap.controlChart] = t('header.controlChart');
    routes[routeMap.cumulativeFlowDiagram] = t('header.cumulativeFlowDiagram');
    routes[routeMap.transitionsTable] = t('header.transitionsTable');
    routes[routeMap.blockersTable] = t('header.blockersTable');

    routes[routeMap.bugDashboard] = t('header.bugDashboard');
    routes[routeMap.bugsBoxPlotClosed] = t('header.bugsBoxPlotClosed');
    routes[routeMap.bugToTasks] = t('header.bugToTasks');
    routes[routeMap.bugsUnresolved] = t('header.bugsUnresolved');
    routes[routeMap.bugsResolvedToCreated] = t('header.bugsResolvedToCreated');

    return routes[route] || t('header.notFound');
};
