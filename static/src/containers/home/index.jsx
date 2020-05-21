import React from 'react';

import DashboardKanbanMetrics from '../dashboardKanbanMetrics';
import DashboardBugsMetrics from '../dashboardBugsMetrics';
import { DashboardCard, DashboardCardWrapper } from '../../components/DashboardCard';
import { HeaderFilter } from '../../components/HeaderFilter';

import t from '../../modules/translations';

const Home = () => (
    <DashboardCardWrapper>
        <DashboardCard>
            <HeaderFilter>{t('nav.kanban-metrics')}</HeaderFilter>
            <DashboardKanbanMetrics cardWidth="100%" />
        </DashboardCard>
        <DashboardCard>
            <HeaderFilter>{t('nav.bug-metrics')}</HeaderFilter>
            <DashboardBugsMetrics cardWidth="100%" />
        </DashboardCard>
    </DashboardCardWrapper>
);

export default Home;
