import React from 'react';

import { Card, CardHeader, CardText } from 'material-ui/Card';

import BoxPlotClosedBugs from '../boxPlotClosedBugs';
import BugsToTasks from '../bugsToTasks';
import BugsUnresolved from '../bugsUnresolved';
import BugsResolvedToCreated from '../bugsResolvedToCreated';

import { DashboardCard, DashboardCardWrapper, DashboardCardGraph } from '../../components/DashboardCard';
import t from '../../modules/translations';

const DashboardBugsMetrics = (prop) => (
    <DashboardCardWrapper>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.bugToTasks')}
                    subtitle={t('header.bugToTasks')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <BugsToTasks dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.bugsUnresolved')}
                    subtitle={t('header.bugsUnresolved')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <BugsUnresolved dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.bugsResolvedToCreated')}
                    subtitle={t('header.bugsResolvedToCreated')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <BugsResolvedToCreated dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
        <DashboardCard width={prop.cardWidth}>
            <Card initiallyExpanded>
                <CardHeader
                    title={t('nav.bugsBoxPlotClosed')}
                    subtitle={t('header.bugsBoxPlotClosed')}
                    actAsExpander
                    showExpandableButton
                />
                <CardText expandable>
                    <DashboardCardGraph>
                        <BoxPlotClosedBugs dashboard />
                    </DashboardCardGraph>
                </CardText>
            </Card>
        </DashboardCard>
    </DashboardCardWrapper>
);

export default DashboardBugsMetrics;
