# coding=utf-8
import copy
from collections import Counter
import logging

import pandas
from dateutil.parser import parse as parse_datetime
from intervaltree import Interval, IntervalTree

from jira_reports.jira_client import DEV_TEAM_FIELD, SECONDS_IN_DAY
from jira_reports.projects import HH, MAR, MSBM, portfolio, bug, MOB, rdd_task, webs_task
from jira_reports.projects.bug import Bug
from jira_reports.projects.HH import HH_task
from jira_reports.projects.MAR import MAR_task
from jira_reports.projects.MSBM import MSBM_task
from jira_reports.projects.MOB import MOB_task
from jira_reports.projects.portfolio import Portfolio
from jira_reports.projects.rdd_task import RDD_task
from jira_reports.projects.webs_task import WEBS_task


CFD_TRANSITIONS = '_cfd_transitions'
CREATED_DATE = '_created_date'
FLAG_TRANSITIONS = '_flag_transitions'
LEAD_TIME = '_lead_time'
STATUS_TRANSITIONS = '_status_transitions'
TOTAL_TIME_BY_STATUS = '_total_time_by_status'
WAIT_TIME_BY_STATUS = '_wait_time_by_status'
WORK_TIME_BY_STATUS = '_work_time_by_status'
WAIT_TIME_BY_STATUS_WITH_BLOCK_TIME = '_wait_time_by_status_with_block_time'
WORK_TIME_BY_STATUS_WITH_BLOCK_TIME = '_work_time_by_status_with_block_time'
EFFICIENCY = '_efficiency'
DISCOVERY_EFFICIENCY = '_discovery_efficiency'
DELIVERY_EFFICIENCY = '_delivery_efficiency'


def parse_date(date_str):
    return parse_datetime(date_str) if date_str is not None else None


def _force_dict(value):
    return {} if value is None else value


def _parse_created_date(issue):
    return {CREATED_DATE: parse_date(issue['fields']['created'])}


def _calculate_status_transitions(issue, status_value_to_name):
    status_transitions = []
    for changelog_entry in issue['changelog']['histories']:
        for transition in filter(lambda t: t['field'] == 'status', changelog_entry['items']):
            if transition['to'] is not None and transition['from'] != transition['to']:
                status_transitions.append({
                    'from': status_value_to_name.get(transition['from']),
                    'to': status_value_to_name.get(transition['to']),
                    'date': parse_date(changelog_entry['created']),
                })
    return {
        STATUS_TRANSITIONS: sorted(
            filter(lambda x: x['to'] is not None and x['from'] != x['to'], status_transitions),
            key=lambda t: t['date']
        )
    }


def _calculate_flag_transitions(issue):
    flag_transitions = []
    for changelog_entry in issue['changelog']['histories']:
        for transition in filter(lambda t: t['field'] == 'Flagged', changelog_entry['items']):
            if transition['fromString'] == 'Impediment' or transition['toString'] == 'Impediment':
                flag_transitions.append({
                    'from': transition['fromString'],
                    'to': transition['toString'],
                    'date': parse_date(changelog_entry['created']),
                })
    return {FLAG_TRANSITIONS: sorted(flag_transitions, key=lambda t: t['date'])}


def _calculate_total_time_by_status(issue, displayed_statuses):
    total_time_by_status = Counter()
    last_status_change_date = issue[CREATED_DATE]
    for transition in issue[STATUS_TRANSITIONS]:
        total_time_by_status[transition['from']] += (transition['date'] - last_status_change_date).total_seconds() / SECONDS_IN_DAY
        last_status_change_date = transition['date']
    return {TOTAL_TIME_BY_STATUS: {x: total_time_by_status[x] for x in displayed_statuses}}


def _calculate_lead_time(issue, lead_time_statuses):
    return {LEAD_TIME: sum(issue[TOTAL_TIME_BY_STATUS][x] for x in lead_time_statuses)}


def _calculate_work_and_wait_time_by_status(issue, lead_time_statuses, work_statuses):
    work_intervals = IntervalTree()
    wait_intervals = IntervalTree()
    work_time_by_status = Counter()
    wait_time_by_status = Counter()
    work_time_by_status_with_block_time = Counter()
    wait_time_by_status_with_block_time = Counter()

    last_status_change_date = issue[CREATED_DATE]
    for transition in issue[STATUS_TRANSITIONS]:
        if transition['from'] in lead_time_statuses:
            if transition['from'] in work_statuses:
                work_intervals.add(Interval(last_status_change_date, transition['date'], transition['from']))
            else:
                wait_intervals.add(Interval(last_status_change_date, transition['date'], transition['from']))
        last_status_change_date = transition['date']

    wait_intervals_with_block_time = copy.deepcopy(wait_intervals)
    work_intervals_with_block_time = copy.deepcopy(work_intervals)

    for i in range(len(issue[FLAG_TRANSITIONS])):
        transition_block_start = issue[FLAG_TRANSITIONS][i]
        if transition_block_start['from'] is None:
            if i + 1 < len(issue[FLAG_TRANSITIONS]):
                transition_block_end = issue[FLAG_TRANSITIONS][i + 1]
                wait_intervals.chop(transition_block_start['date'], transition_block_end['date'])
                work_intervals.chop(transition_block_start['date'], transition_block_end['date'])

    for interval in work_intervals:
        work_time_by_status[interval.data] += (interval.end - interval.begin).total_seconds() / SECONDS_IN_DAY
    for interval in wait_intervals:
        wait_time_by_status[interval.data] += (interval.end - interval.begin).total_seconds() / SECONDS_IN_DAY

    for interval in work_intervals_with_block_time:
        work_time_by_status_with_block_time[interval.data] += (interval.end - interval.begin).total_seconds() / SECONDS_IN_DAY
    for interval in wait_intervals_with_block_time:
        wait_time_by_status_with_block_time[interval.data] += (interval.end - interval.begin).total_seconds() / SECONDS_IN_DAY

    return {
        WORK_TIME_BY_STATUS: {'{}_work_time'.format(x): work_time_by_status[x] for x in lead_time_statuses},
        WAIT_TIME_BY_STATUS: {'{}_wait_time'.format(x): wait_time_by_status[x] for x in lead_time_statuses},
        WORK_TIME_BY_STATUS_WITH_BLOCK_TIME:
            {'{}_work_time_with_block_time'.format(x): work_time_by_status_with_block_time[x] for x in lead_time_statuses},
        WAIT_TIME_BY_STATUS_WITH_BLOCK_TIME:
            {'{}_wait_time_with_block_time'.format(x): wait_time_by_status_with_block_time[x] for x in lead_time_statuses},
    }


def _calculate_efficiency(issue, statuses):
    work_time = sum([issue[WORK_TIME_BY_STATUS]['{}_work_time'.format(x)] for x in statuses])
    wait_time = sum([issue[WAIT_TIME_BY_STATUS]['{}_wait_time'.format(x)] for x in statuses])
    total_time = work_time + wait_time
    return (work_time / total_time) if total_time > 0 else None


def _calculate_efficiency_delivery_and_discovery(issue, statuses_active, statuses_all):
    work_time = sum([issue[WORK_TIME_BY_STATUS]['{}_work_time'.format(x)] for x in statuses_active]) \
                + sum([issue[WAIT_TIME_BY_STATUS]['{}_wait_time'.format(x)] for x in statuses_active])
    total_time = sum([issue[WAIT_TIME_BY_STATUS_WITH_BLOCK_TIME]['{}_wait_time_with_block_time'.format(x)] for x in statuses_all]) \
                + sum([issue[WORK_TIME_BY_STATUS_WITH_BLOCK_TIME]['{}_work_time_with_block_time'.format(x)] for x in statuses_all])
    return (work_time / total_time) if total_time > 0 else None


def _calculate_cfd_transitions(issue, cfd_statuses):
    status_index_by_name = {y: x for x, y in enumerate(cfd_statuses)}
    status_name_by_index = {x: y for x, y in enumerate(cfd_statuses)}
    cfd_transitions = []
    for transition in issue[STATUS_TRANSITIONS]:
        if transition['from'] is not None:
            # если задачу перевели назад по воркфлоу
            if status_index_by_name[transition['from']] > status_index_by_name[transition['to']]:
                for i in range(
                    status_index_by_name[transition['from']],
                    status_index_by_name[transition['to']],
                    -1
                ):
                    cfd_transitions.append({
                        'status': status_name_by_index[i],
                        'date': transition['date'],
                        'portfolio': issue['key'],
                        'forward': False,
                    })
                continue
            # если задачу перевели из одного статуса в другой, пропустив промежуточные
            if status_index_by_name[transition['to']] - status_index_by_name[transition['from']] > 1:
                for i in range(status_index_by_name[transition['from']], status_index_by_name[transition['to']]):
                    cfd_transitions.append({
                        'status': status_name_by_index[i + 1],
                        'date': transition['date'],
                        'portfolio': issue['key'],
                        'forward': True,
                    })
                continue
        cfd_transitions.append({
            'status': transition['to'],
            'date': transition['date'],
            'portfolio': issue['key'],
            'forward': True,
        })
    return {CFD_TRANSITIONS: cfd_transitions}


def parse_portfolio_data(issue):
    issue.update(_parse_created_date(issue))
    issue.update(_calculate_status_transitions(issue, status_value_to_name=portfolio.STATUS_VALUE_TO_NAME))
    issue.update(_calculate_flag_transitions(issue))
    issue.update(_calculate_total_time_by_status(issue, displayed_statuses=portfolio.DISPLAYED_STATUSES))
    issue.update(_calculate_lead_time(issue, lead_time_statuses=portfolio.LEAD_TIME_STATUSES))
    issue.update(_calculate_work_and_wait_time_by_status(
        issue,
        lead_time_statuses=portfolio.LEAD_TIME_STATUSES,
        work_statuses=portfolio.DELIVERY_STATUSES
    ))
    issue.update({EFFICIENCY: _calculate_efficiency(issue, statuses=portfolio.LEAD_TIME_STATUSES)})
    issue.update({DISCOVERY_EFFICIENCY: _calculate_efficiency_delivery_and_discovery(issue,
                                                                                     portfolio.DISCOVERY_STATUSES_ACTIVE,
                                                                                     portfolio.DISCOVERY_STATUSES)})
    issue.update({DELIVERY_EFFICIENCY: _calculate_efficiency_delivery_and_discovery(issue,
                                                                                    portfolio.DELIVERY_STATUSES_ACTIVE,
                                                                                    portfolio.DELIVERY_STATUSES)})
    issue.update(_calculate_cfd_transitions(issue, cfd_statuses=portfolio.ALL_STATUSES))

    return Portfolio(
        key=issue['key'],
        team=issue['fields'][DEV_TEAM_FIELD]['value'],
        summary=issue['fields']['summary'],
        created=issue[CREATED_DATE],
        resolved=parse_date(issue['fields']['resolutiondate']),
        lead_time=issue[LEAD_TIME],
        labels=issue['fields']['labels'],
        status=portfolio.STATUS_VALUE_TO_NAME[issue['fields']['status']['id']],
        cfd_transitions=issue[CFD_TRANSITIONS],
        table_transitions=issue[STATUS_TRANSITIONS],
        efficiency=issue[EFFICIENCY],
        discovery_efficiency=issue[DISCOVERY_EFFICIENCY],
        delivery_efficiency=issue[DELIVERY_EFFICIENCY],
        **issue[TOTAL_TIME_BY_STATUS],
        **issue[WORK_TIME_BY_STATUS],
        **issue[WAIT_TIME_BY_STATUS],
        **issue[WORK_TIME_BY_STATUS_WITH_BLOCK_TIME],
        **issue[WAIT_TIME_BY_STATUS_WITH_BLOCK_TIME]
    )


def parse_hh_data(issue):
    issue.update(_parse_created_date(issue))
    issue.update(_calculate_status_transitions(issue, status_value_to_name=HH.STATUS_VALUE_TO_NAME))
    issue.update(_calculate_total_time_by_status(issue, displayed_statuses=HH.DISPLAYED_STATUSES))

    return HH_task(
        key=issue['key'],
        team=issue['fields'][DEV_TEAM_FIELD]['value'],
        summary=issue['fields']['summary'],
        created=issue[CREATED_DATE],
        resolved=parse_date(issue['fields']['resolutiondate']),
        resolution=_force_dict(issue['fields']['resolution']).get('name'),
        **issue[TOTAL_TIME_BY_STATUS],
    )


def parse_mob_data(issue):
    issue.update(_parse_created_date(issue))
    issue.update(_calculate_status_transitions(issue, status_value_to_name=MOB.STATUS_VALUE_TO_NAME))
    issue.update(_calculate_total_time_by_status(issue, displayed_statuses=MOB.DISPLAYED_STATUSES))

    return MOB_task(
        key=issue['key'],
        team=issue['fields'][DEV_TEAM_FIELD]['value'],
        summary=issue['fields']['summary'],
        created=issue[CREATED_DATE],
        resolved=parse_date(issue['fields']['resolutiondate']),
        resolution=_force_dict(issue['fields']['resolution']).get('name'),
        **issue[TOTAL_TIME_BY_STATUS],
    )


def parse_bugs_data(issue):
    issue.update(_parse_created_date(issue))
    issue.update(_calculate_status_transitions(issue, status_value_to_name=bug.STATUS_VALUE_TO_NAME))
    issue.update(_calculate_total_time_by_status(issue, displayed_statuses=bug.DISPLAYED_STATUSES))

    return Bug(
        key=issue['key'],
        team=issue['fields'][DEV_TEAM_FIELD]['value'],
        summary=issue['fields']['summary'],
        created=issue[CREATED_DATE],
        resolved=parse_date(issue['fields']['resolutiondate']),
        priority=issue['fields']['priority']['name'],
        resolution=_force_dict(issue['fields']['resolution']).get('name'),
        **issue[TOTAL_TIME_BY_STATUS]
    )


def parse_webs_data(issue):
    issue.update(_parse_created_date(issue))
    issue.update(_calculate_status_transitions(issue, status_value_to_name=webs_task.STATUS_VALUE_TO_NAME))
    issue.update(_calculate_total_time_by_status(issue, displayed_statuses=webs_task.ALL_STATUSES))

    return WEBS_task(
        key=issue['key'],
        summary=issue['fields']['summary'],
        assignee=issue['fields']['assignee']['name'],
        created=issue[CREATED_DATE],
        resolved=parse_date(issue['fields']['resolutiondate']),
        **issue[TOTAL_TIME_BY_STATUS]
    )


def parse_rdd_data(issue):
    issue.update(_parse_created_date(issue))
    issue.update(_calculate_status_transitions(issue, status_value_to_name=rdd_task.STATUS_VALUE_TO_NAME))
    issue.update(_calculate_total_time_by_status(issue, displayed_statuses=rdd_task.ALL_STATUSES))

    return RDD_task(
        key=issue['key'],
        summary=issue['fields']['summary'],
        reporter=issue['fields']['reporter']['name'],
        created=issue[CREATED_DATE],
        resolved=parse_date(issue['fields']['resolutiondate']),
        **issue[TOTAL_TIME_BY_STATUS]
    )


def parse_mar_data(issue):
    issue.update(_parse_created_date(issue))
    issue.update(_calculate_status_transitions(issue, status_value_to_name=MAR.STATUS_VALUE_TO_NAME))
    issue.update(_calculate_total_time_by_status(issue, displayed_statuses=MAR.ALL_STATUSES))

    return MAR_task(
        key=issue['key'],
        summary=issue['fields']['summary'],
        reporter=issue['fields']['reporter']['name'],
        created=issue[CREATED_DATE],
        resolved=parse_date(issue['fields']['resolutiondate']),
        **issue[TOTAL_TIME_BY_STATUS]
    )


def parse_msbm_data(issue):
    issue.update(_parse_created_date(issue))
    issue.update(_calculate_status_transitions(issue, status_value_to_name=MSBM.STATUS_VALUE_TO_NAME))
    issue.update(_calculate_total_time_by_status(issue, displayed_statuses=MSBM.ALL_STATUSES))

    return MSBM_task(
        key=issue['key'],
        summary=issue['fields']['summary'],
        reporter=issue['fields']['reporter']['name'],
        created=issue[CREATED_DATE],
        resolved=parse_date(issue['fields']['resolutiondate']),
        **issue[TOTAL_TIME_BY_STATUS]
    )


PARSERS = {
    'PORTFOLIO': parse_portfolio_data,
    'HH': parse_hh_data,
    'MOB': parse_mob_data,
    'BUGS': parse_bugs_data,
    'WEBS': parse_webs_data,
    'RDD': parse_rdd_data,
    'MAR': parse_mar_data,
    'MSBM': parse_msbm_data,
}


def parse_data(project, json_data):
    parser = PARSERS[project]
    try:
        parsed_data = [parser(x) for x in json_data]
    except KeyError as e:
        logging.error("Parse data error: ", e)
        return None
    else:
        return pandas.DataFrame(parsed_data)


def parse_portfolio_tasks_for_gantt_chart(json_data, issue_types):
    tasks = []
    for issue_task in json_data:
        statuses_task = []
        task = {
            'titleBar': issue_task['key'],
            'summary': issue_task['fields']['summary'],
            'values': statuses_task,
            'type': issue_types.get(issue_task['key'], None)
        }

        if issue_task['key'].startswith('HH'):
            statuses_task.append({
                'title': 'OPEN',
                'dateStart': parse_date(issue_task['fields']['created']),
            })

        for changelog_entry in issue_task['changelog']['histories']:
            ignore_idea_statuses = True
            for transition in changelog_entry['items']:
                if transition['field'] == 'status':
                    if issue_task['key'].startswith('PORTFOLIO'):
                        if ignore_idea_statuses and transition['to'] in ('1', '10304', '16091'):
                            continue
                        ignore_idea_statuses = False
                    statuses_task.append({
                        'title': transition['toString'].replace(' ', '_').upper(),
                        'dateStart': parse_date(changelog_entry['created']),
                    })
        index = 0
        task_count = len(task['values']) - 1
        for item in task['values']:
            index += 1
            if task_count - index >= 0:
                item['dateEnd'] = task['values'][index]['dateStart']
            else:
                item['dateEnd'] = item['dateStart']
        tasks.append(task)
    return tasks
