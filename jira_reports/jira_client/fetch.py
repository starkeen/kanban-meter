# coding=utf-8
import concurrent.futures
import json

import requests
import pandas
from dateutil.parser import parse as parse_datetime
from jira_reports.jira_client.parse import parse_portfolio_tasks_for_gantt_chart
from datetime import datetime, timezone
from jira_reports.jira_client.db_service import comments_data, save_comments, save_empty_tasks

from requests_oauthlib import OAuth1
from oauthlib.oauth1 import SIGNATURE_RSA
from jira_reports.jira_client import DEV_TEAM_FIELD, MAX_RESULTS, PORTFOLIO_QUERY, HH_QUERY, ISSUE_INCLUDES_QUERY, \
    WEBS_QUERY, RDD_QUERY, MAR_QUERY, MSBM_QUERY, EPIC_ISSUES_QUERY, EPIC_FIELD, BUGS_QUERY, MOB_QUERY

ISSUE_TYPE_TASK_ID = '3'
ISSUE_IN_EPIC = '253'
ISSUE_PORTFOLIO = '252'
ISSUE_BUG = '330'
ISSUE_BUG_MOB = '1'
ISSUE_AUTOTESTING_TASK = '348'
ISSUE_RDD = '17000'
ISSUE_TASKS_IDS = (ISSUE_TYPE_TASK_ID, ISSUE_IN_EPIC, ISSUE_BUG, ISSUE_BUG_MOB, ISSUE_AUTOTESTING_TASK, ISSUE_RDD)


def _fetch_data_post(config, project, params):
    token_auth = OAuth1(config.CONSUMER_KEY,
                        resource_owner_key=config.OAUTH_TOKEN,
                        resource_owner_secret=config.OAUTH_TOKEN_SECRET,
                        signature_method=SIGNATURE_RSA,
                        rsa_key=read(config.RSA_KEY),
                        signature_type='auth_header')
    all_json_data = []
    params['startAt'] = len(all_json_data)
    print('fetching {} data'.format(project))
    while True:
        params_json = json.dumps(params)
        r = requests.post(
            url='https://jira.hh.ru/rest/api/2/search',
            auth=token_auth,
            data=params_json,
            headers={
                'Content-Type': 'application/json',
            }
        )
        json_data = r.json()
        if len(json_data['issues']) > 0:
            all_json_data.extend(json_data['issues'])
            if len(all_json_data) >= json_data['total']:
                break
        else:
            break
    return all_json_data


def read(file_path):
    with open(file_path) as f:
        return f.read()


def _fetch_data(config, project, params, callback=None):
    token_auth = OAuth1(config.CONSUMER_KEY,
                        resource_owner_key=config.OAUTH_TOKEN,
                        resource_owner_secret=config.OAUTH_TOKEN_SECRET,
                        signature_method=SIGNATURE_RSA,
                        rsa_key=read(config.RSA_KEY),
                        signature_type='auth_header')
    all_json_data = []
    print('fetching {} data'.format(project))
    while True:
        r = requests.get(
            url='https://jira.hh.ru/rest/api/2/search',
            auth=token_auth,
            params={
                'startAt': len(all_json_data),
                **params,
            },
            headers={
                'Content-Type': 'application/json',
            }
        )
        json_data = r.json()
        if len(json_data['issues']) > 0:
            all_json_data.extend(json_data['issues'])
            if callback is not None:
                callback({
                    'fetched': len(all_json_data),
                    'total': json_data['total'],
                })
            if len(all_json_data) >= json_data['total']:
                break
        else:
            break
    return all_json_data


def fetch_portfolio_data(config, callback=None):
    return _fetch_data(config, 'portfolio', {
        'jql': PORTFOLIO_QUERY.format(start_date=config.START_DATE),
        'fields': ','.join(['created', 'summary', 'resolution', 'resolutiondate', 'labels', 'status', DEV_TEAM_FIELD]),
        'expand': 'changelog.histories',
        'maxResults': MAX_RESULTS,
    }, callback)


def fetch_hh_data(config, callback=None):
    return _fetch_data(config, 'HH', {
        'jql': HH_QUERY.format(start_date=config.START_DATE),
        'fields': ','.join(['created', 'summary', 'resolution', 'resolutiondate', DEV_TEAM_FIELD]),
        'expand': 'changelog.histories',
        'maxResults': MAX_RESULTS,
    }, callback)


def fetch_mob_data(config, callback=None):
    return _fetch_data(config, 'MOB', {
        'jql': MOB_QUERY.format(start_date=config.START_DATE),
        'fields': ','.join(['created', 'summary', 'resolution', 'resolutiondate', DEV_TEAM_FIELD]),
        'expand': 'changelog.histories',
        'maxResults': MAX_RESULTS,
    }, callback)


def fetch_bugs_data(config, callback=None):
    return _fetch_data(config, 'bugs', {
        'jql': BUGS_QUERY.format(start_date=config.START_DATE),
        'fields': ','.join(['created', 'summary', 'resolution', 'resolutiondate', DEV_TEAM_FIELD, 'priority']),
        'expand': 'changelog.histories',
        'maxResults': MAX_RESULTS,
    }, callback)


def fetch_webs_data(config, callback=None):
    return _fetch_data(config, 'WEBS', {
        'jql': WEBS_QUERY,
        'fields': ','.join(['created', 'summary', 'resolution', 'resolutiondate', 'assignee']),
        'expand': 'changelog.histories',
        'maxResults': MAX_RESULTS,
    }, callback)


def fetch_rdd_data(config, callback=None):
    return _fetch_data(config, 'RDD', {
        'jql': RDD_QUERY,
        'fields': ','.join(['created', 'summary', 'resolution', 'resolutiondate', 'reporter']),
        'expand': 'changelog.histories',
        'maxResults': MAX_RESULTS,
    }, callback)


def fetch_mar_data(config, callback=None):
    return _fetch_data(config, 'MAR', {
        'jql': MAR_QUERY,
        'fields': ','.join(['created', 'summary', 'resolution', 'resolutiondate', 'reporter']),
        'expand': 'changelog.histories',
        'maxResults': MAX_RESULTS,
    }, callback)


def fetch_msbm_data(config, callback=None):
    return _fetch_data(config, 'MSBM', {
        'jql': MSBM_QUERY,
        'fields': ','.join(['created', 'summary', 'resolution', 'resolutiondate', 'reporter']),
        'expand': 'changelog.histories',
        'maxResults': MAX_RESULTS,
    }, callback)


def parse_date(date_str):
    return parse_datetime(date_str) if date_str is not None else None


def comments_validate(histories, comments, id_issue, flag_histories):
    for flag in filter(lambda t: t['items'][0]['field'] == 'Flagged', histories):
        created_date = flag['created']
        flag = flag['items'][0]
        comment_text = ''
        for comment in filter(lambda t: abs((parse_date(t['created']) - parse_date(created_date)).seconds) <= 5,
                              comments):
            comment_text = comment['body']
            break
        if flag['fromString'] == 'Impediment' or flag['toString'] == 'Impediment':
            state = 'off'
            if flag['from'] is None and flag['fromString'] is None:
                state = 'on'
            flag_histories.append({
                'comment': comment_text,
                'state': state,
                'task': id_issue,
                'date': parse_date(created_date)
            })
    for flag in filter(lambda t: t['body'].startswith('(flag) Флажок добавлен'), comments):
        flag_histories.append({
            'comment': flag['body'],
            'state': 'on',
            'task': id_issue,
            'date': parse_date(flag['created'])
        })


def clear_flag_duplicates(flag_histories):
    for i in range(len(flag_histories)):
        if i < len(flag_histories) - 1:
            flag = flag_histories[i]
            next_flag = flag_histories[i + 1]
            if flag['state'] == next_flag['state'] and flag['task'] == next_flag['task']:
                if flag['comment'] == '':
                    del (flag_histories[i])
                else:
                    del (flag_histories[i + 1])


def get_flags_and_comments(config, ids):
    flag_histories = []
    for id_issue in ids:
        portfolio = fetch_issue(config, id_issue, True)
        comments = portfolio['fields']['comment']['comments']
        histories = portfolio['changelog']['histories']
        comments_validate(histories, comments, id_issue, flag_histories)
    return flag_histories


def find_flag_status(flag, statuses):
    before = list(filter(lambda d: d['created'] < flag['date'], statuses))
    if len(before) > 0:
        closest_date_status = max(before, key=lambda d: d['created'])
        if closest_date_status is not None:
            flag['status'] = closest_date_status['toString']
    else:
        flag['status'] = ''


def find_status_for_flag(histories, flag_histories, tasks_names):
    statuses = []
    tasks_names_map = dict(tasks_names)
    for status in filter(lambda t: t['items'][0]['field'] == 'status', histories):
        item = status['items'][0]
        statuses.append({
            'created': parse_date(status['created']),
            'fromString': item['fromString'],
            'toString': item['toString'],
        })

    statuses = sorted(statuses, key=lambda t: t['created'])
    current_status = statuses[len(statuses) - 1]['toString']
    results = []
    now = datetime.now(timezone.utc)
    while len(flag_histories) >= 1:
        flag = flag_histories[0]
        find_flag_status(flag, statuses)
        list_flags = list(filter(lambda d: d['task'] == flag['task'] and d['state'] != flag['state'], flag_histories))
        if list_flags is not None and len(list_flags) > 0:
            flag_off = min(list_flags, key=lambda d: d['date'])
            find_flag_status(flag_off, statuses)
            delta = flag_off['date'] - flag['date']
            results.append({
                'date_from': flag['date'],
                'date_to': flag_off['date'],
                'count_days': delta.days,
                'comment': flag['comment'],
                'task': flag['task'],
                'name': tasks_names_map[flag['task']],
                'status_from': flag['status'],
                'status_to': flag_off['status'],
                'current_status': current_status,
            })
            flag_histories.remove(flag)
            flag_histories.remove(flag_off)
        else:
            delta = now - flag['date']
            results.append({
                'date_from': flag['date'],
                'date_to': '',
                'count_days': delta.days,
                'comment': flag['comment'],
                'task': flag['task'],
                'name': tasks_names_map[flag['task']],
                'status_from': flag['status'],
                'status_to': '',
                'current_status': current_status,
            })
            flag_histories.remove(flag)
    return results


def execute_blockers(id, portfolio):
    comments = portfolio['fields']['comment']['comments']
    tasks_names = [[id, portfolio['fields']['summary']]]
    for task in portfolio['fields']['issuelinks']:
        kind_issue = 'inwardIssue' if 'inwardIssue' in task else 'outwardIssue'
        key = task[kind_issue]['key']
        value = task[kind_issue]['fields']['summary']
        tasks_names.append([key, value])
    histories = portfolio['changelog']['histories']
    flag_histories = []
    comments_validate(histories, comments, id, flag_histories)
    flag_histories = sorted(flag_histories, key=lambda t: t['date'])
    clear_flag_duplicates(flag_histories)
    return find_status_for_flag(histories, flag_histories, tasks_names)


def execute_sort_filters(portfolio_sort, title_sort, start_flag_sort, end_flag_sort,
                         start_status_sort, comment_sort, end_status_sort, current_status_sort, flag_days_sort):
    sort_filters = []
    sort_types = []

    def process_sort(sort, name):
        if sort is not None:
            sort_filters.append(name)
            if sort == 'asc':
                sort_types.append(True)
            else:
                sort_types.append(False)

    process_sort(portfolio_sort, 'task')
    process_sort(title_sort, 'name')
    process_sort(start_flag_sort, 'date_from')
    process_sort(end_flag_sort, 'date_to')
    process_sort(start_status_sort, 'status_from')
    process_sort(end_status_sort, 'status_to')
    process_sort(comment_sort, 'comment')
    process_sort(current_status_sort, 'current_status')
    process_sort(flag_days_sort, 'count_days')

    return sort_filters, sort_types


def sort_task_blockers(results, sort_filters, sort_types):
    if len(sort_filters) > 0:
        df = pandas.DataFrame.from_dict(results, orient='columns')
        sorted_df = df.sort_values(by=sort_filters, ascending=sort_types)
        sorted_list = sorted_df.to_dict('records')
        return sorted_list
    else:
        return results


def blockers_data(config, data, empty_tasks):
    comments = comments_data(data)
    if comments is None:
        portfolio = fetch_issue(config, data, True)
        tmp = execute_blockers(data, portfolio)
        if not tmp:
            empty_tasks.append(data)
        return tmp
    else:
        return comments


def fetch_task_blockers(config, converted_data, portfolio_sort, title_sort, start_flag_sort, end_flag_sort,
                        start_status_sort, comment_sort, end_status_sort, current_status_sort, flag_days_sort):
    args = ((config, data) for data in converted_data)
    empty_tasks = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=600) as executor:
        results_poll = list(executor.map(lambda p: blockers_data(*p, empty_tasks), args))
    results_poll = sum(results_poll, [])
    save_comments(results_poll)
    save_empty_tasks(empty_tasks)
    sort_filters, sort_types = execute_sort_filters(portfolio_sort, title_sort, start_flag_sort, end_flag_sort,
                                                    start_status_sort, comment_sort, end_status_sort,
                                                    current_status_sort, flag_days_sort)
    return sort_task_blockers(results_poll, sort_filters, sort_types)


def fetch_issue_portfolio(config, id):
    portfolio = fetch_issue(config, id, True)
    comments = portfolio['fields']['comment']['comments']

    issue_ids, issue_types, issue_type_ids = extract_tasks(portfolio)
    flags_related_tasks = get_flags_and_comments(config, issue_ids)
    issue_ids.insert(0, id)
    issue_types[id] = 'consists in'
    issue_type_ids[id] = ISSUE_PORTFOLIO

    epic_id = portfolio['fields'][EPIC_FIELD]

    histories = portfolio['changelog']['histories']
    flag_histories = []

    comments_validate(histories, comments, id, flag_histories)
    flag_histories = flag_histories + flags_related_tasks
    flag_histories = sorted(flag_histories, key=lambda t: t['date'])
    clear_flag_duplicates(flag_histories)
    for item in issue_ids:
        if issue_type_ids[item] == ISSUE_IN_EPIC:
            epic_id = item
    if epic_id:
        epic_issue_ids, epic_issue_types = fetch_epic_tasks(config, epic_id)
        issue_ids.extend(epic_issue_ids)
        issue_types.update(epic_issue_types)

    tasks = []
    if len(issue_ids) > 0:
        tasks = parse_portfolio_tasks_for_gantt_chart(
            fetch_portfolio_tasks_for_gantt_chart(config, issue_ids),
            issue_types
        )
    return {
        'key': id,
        'por': portfolio['fields']['issuelinks'],
        'tasks': tasks,
        'flags': flag_histories,
    }


def fetch_issue(config, id, with_comments=False):
    token_auth = OAuth1(config.CONSUMER_KEY,
                        resource_owner_key=config.OAUTH_TOKEN,
                        resource_owner_secret=config.OAUTH_TOKEN_SECRET,
                        signature_method=SIGNATURE_RSA,
                        rsa_key=read(config.RSA_KEY),
                        signature_type='auth_header')
    params = ['created',
              'summary',
              'resolution',
              'resolutiondate',
              'labels',
              'issuetype',
              'issuelinks',
              DEV_TEAM_FIELD,
              EPIC_FIELD,
              ]
    if with_comments:
        params.append('comment')
    r = requests.get(
        url='https://jira.hh.ru/rest/api/2/issue/{}'.format(id),
        auth=token_auth,
        params={
            'fields': ','.join(params),
            'expand': ','.join(['changelog.histories']),
        },
        headers={
            'Content-Type': 'application/json',
        }
    )

    return r.json()


def extract_tasks(data):
    issue_ids = []
    issue_types = {}
    issue_type_ids = {}
    for item in data['fields']['issuelinks']:
        if item.get('outwardIssue', None) is not None and \
                item['outwardIssue']['fields']['issuetype']['id'] in ISSUE_TASKS_IDS:
            issue_types[item['outwardIssue']['key']] = item['type']['outward']
            issue_type_ids[item['outwardIssue']['key']] = item['outwardIssue']['fields']['issuetype']['id']
            issue_ids.append(item['outwardIssue']['key'])

        if item.get('inwardIssue', None) is not None and \
                item['inwardIssue']['fields']['issuetype']['id'] in ISSUE_TASKS_IDS:
            issue_types[item['inwardIssue']['key']] = item['type']['outward']
            issue_type_ids[item['inwardIssue']['key']] = item['inwardIssue']['fields']['issuetype']['id']
            issue_ids.append(item['inwardIssue']['key'])

    return issue_ids, issue_types, issue_type_ids


def fetch_epic_tasks(config, epic_id):
    issues = _fetch_data_post(config, 'EPIC_ISSUES', {
        'jql': EPIC_ISSUES_QUERY.format(epic_id),
        'fields': ['issuetype'],
    })

    issue_ids = []
    issue_types = {}

    for item in issues:
        issue_types[item['key']] = 'consists in'
        issue_ids.append(item['key'])

    return issue_ids, issue_types


def fetch_portfolio_tasks_for_gantt_chart(config, ids):

    return _fetch_data_post(config, 'linked issues', {
        'jql': ISSUE_INCLUDES_QUERY.format(','.join(ids)),
        'fields': ['created', 'summary', 'issuetype', 'issuelinks', 'type'],
        'expand': ['changelog.histories'],
    })


FETCHERS = {
    'PORTFOLIO': fetch_portfolio_data,
    'HH': fetch_hh_data,
    'MOB': fetch_mob_data,
    'BUGS': fetch_bugs_data,
    'WEBS': fetch_webs_data,
    'RDD': fetch_rdd_data,
    'MAR': fetch_mar_data,
    'MSBM': fetch_msbm_data,
}


def fetch_data(project, config, fetch_callback):
    return FETCHERS[project](config, fetch_callback)
