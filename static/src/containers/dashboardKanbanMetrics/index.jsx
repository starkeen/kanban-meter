import React from 'react';

import { Card, CardHeader, CardText } from 'material-ui/Card';

import LeadTimeContainer from '../leadTime';
import StatusesBarChart from '../statusesBarChart';
import StackedBarGraph from '../stackedBarChart';
import BoxPlotLeadTimeContainer from '../boxPlotLeadTime';
import BoxPlotStatusesContainer from '../boxPlotStatuses';
import ControlChartContainer from '../controlChart';
import { DashboardCard, DashboardCardWrapper, DashboardCardGraph } from '../../components/DashboardCard';

import t from '../../modules/translations';

const DashboardCardWrapperComponent = (prop) => (
    <DashboardCardWrapper>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.leadTime')}
                    subtitle={t('header.leadTime')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <LeadTimeContainer dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.barChart.statuses')}
                    subtitle={t('header.barChart.statuses')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <StatusesBarChart dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.stackedBarChart.portfolio')}
                    subtitle={t('header.stackedBarChart.portfolio')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <StackedBarGraph dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.boxPlot.team')}
                    subtitle={t('header.boxPlot.team')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <BoxPlotLeadTimeContainer dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.boxPlot.statuses')}
                    subtitle={t('header.boxPlot.statuses')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <BoxPlotStatusesContainer dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader title={t('nav.controlChart')} actAsExpander showExpandableButton />
                <CardText expandable>
                    <DashboardCardGraph>
                        <ControlChartContainer dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
    </DashboardCardWrapper>
);

export default DashboardCardWrapperComponent;
