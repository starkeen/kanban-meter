import routeMap from './routePath';

export const kanbanMetricsMenuItems = [
    {
        trlKey: 'nav.home',
        route: routeMap.home,
    },
    {
        trlKey: 'dashboard',
        route: routeMap.dashboard,
    },
    {
        trlKey: 'nav.leadTime',
        route: routeMap.leadTimeChart,
    },
    {
        trlKey: 'nav.boxPlot.team',
        route: routeMap.boxPlotLeadTimeChart,
    },
    {
        trlKey: 'nav.barChart.statuses',
        route: routeMap.statusesBarChart,
    },
    {
        trlKey: 'nav.boxPlot.statuses',
        route: routeMap.boxPlotStatusesChart,
    },
    {
        trlKey: 'nav.boxPlot.HH',
        route: routeMap.boxPlotHHChart,
    },
    {
        trlKey: 'nav.stackedBarChart.portfolio',
        route: routeMap.stackedBarChart,
    },
    {
        trlKey: 'nav.controlChart',
        route: routeMap.controlChart,
    },
    {
        trlKey: 'nav.dataGraph.table',
        route: routeMap.dataCharts,
    },
    {
        trlKey: 'nav.blockersTable',
        route: routeMap.blockersTable,
    },
    {
        trlKey: 'nav.dataLeadTimeStatistics.table',
        route: routeMap.statisticsLeadTime,
    },
    {
        trlKey: 'nav.cumulativeFlowDiagram',
        route: routeMap.cumulativeFlowDiagram,
    },
    {
        trlKey: 'nav.transitionsTable',
        route: routeMap.transitionsTable,
    },
];

export const bugMenuItems = [
    {
        trlKey: 'nav.home',
        route: routeMap.home,
    },
    {
        trlKey: 'dashboard',
        route: routeMap.bugDashboard,
    },
    {
        trlKey: 'nav.bugsBoxPlotClosed',
        route: routeMap.bugsBoxPlotClosed,
    },
    {
        trlKey: 'nav.bugToTasks',
        route: routeMap.bugToTasks,
    },
    {
        trlKey: 'nav.bugsUnresolved',
        route: routeMap.bugsUnresolved,
    },
    {
        trlKey: 'nav.bugsResolvedToCreated',
        route: routeMap.bugsResolvedToCreated,
    },
];

export const mainMenuItems = [
    {
        trlKey: 'nav.home',
        route: routeMap.home,
    },
    {
        trlKey: 'nav.kanban-metrics',
        route: routeMap.dashboard,
    },
    {
        trlKey: 'nav.bug-metrics',
        route: routeMap.bugDashboard,
    },
];
