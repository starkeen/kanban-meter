# coding=utf-8
import math
from collections import namedtuple
from http import HTTPStatus
from functools import partial
from datetime import datetime, timezone, timedelta
from dateutil import parser
import logging

import numpy
import pandas
import pytz
from flask import Flask, jsonify, request, make_response
from flask.json import JSONEncoder
from raven.contrib.flask import Sentry
from werkzeug.utils import cached_property

from jira_reports import config
from jira_reports.jira_client.db_service import portfolio_data, hh_data, bugs_data, mob_data
from jira_reports.webapp.params import Params
from jira_reports.webapp.util import add_headers, float_or_none
from jira_reports.jira_client import PROJECTS
from jira_reports.jira_client.fetch import fetch_issue_portfolio, fetch_task_blockers
from jira_reports.projects import HH, portfolio
from jira_reports.update import update_data, get_update_status

TIME_ZONE = pytz.timezone('Europe/Moscow')
DEFAULT_PARAM_LIST = [
    'teams',
    'start_date',
    'end_date',
    'include_labels',
    'exclude_labels',
    'include_open',
]
LABELS = ('include_labels', 'exclude_labels')


class NumpyJSONEncoder(JSONEncoder):

    def default(self, obj):
        if pandas.isnull(obj):
            return None
        if type(obj) == numpy.int64:
            return int(obj)
        return JSONEncoder.default(self, obj)


class App(Flask):

    @cached_property
    def hh_df(self):
        # return pandas.read_pickle(self.config.get('HH_DATA_PATH'))
        return hh_data()

    @cached_property
    def portfolio_df(self):
        # return pandas.read_pickle(self.config.get('PORTFOLIO_DATA_PATH'))
        return portfolio_data()

    @cached_property
    def bugs_df(self):
        # return pandas.read_pickle(self.config.get('BUGS_DATA_PATH'))
        return bugs_data()

    @cached_property
    def mob_df(self):
        # return pandas.read_pickle(self.config.get('MOB_DATA_PATH'))
        return mob_data()


app = App(__name__)
app.config.from_object(config)
app.json_encoder = NumpyJSONEncoder
params = Params(app)

if app.config.get('SENTRY_DSN', None) is not None:
    sentry = Sentry(app, dsn=app.config.get('SENTRY_DSN'))


def get_mask(*, df, param_list=None, include_open=False, include_feedback_in_closed=True, date_column_name=None):
    mask = True

    def rule(x, y):
        c = list(set(x) & set(y))
        if len(c) > 0:
            return True
        else:
            return False

    if param_list is None:
        return mask

    if 'teams' in param_list and 'team' in df.columns:
        teams = params.get_teams_param()
        if teams is not None and len(teams) > 0:
            mask = mask & (df['team'].isin(teams))

    if date_column_name is None:
        date_column_name = 'resolved' if 'resolved' in df.columns else 'date'

    if 'include_open' in param_list and params.get_include_open_param() == 'true' or include_open:
        include_open_mask = df[date_column_name].isnull()
    elif include_feedback_in_closed and 'status' in df.columns:
        include_open_mask = df['status'].isin(['FEEDBACK', 'STATUS_18203'])
    else:
        include_open_mask = False

    if 'start_date' in param_list:
        start_date = params.get_start_date_param()
        if start_date is not None:
            date_column = pandas.DatetimeIndex(pandas.to_datetime(df[date_column_name], unit='ms')).tz_localize(tz=TIME_ZONE)
            start_date -= timedelta(days=1)# for an equal answer with previous versions
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=TIME_ZONE)
            mask = mask & ((date_column > start_date) | include_open_mask)

    if 'end_date' in param_list:
        end_date = params.get_end_date_param()
        if end_date is not None:
            date_column = pandas.DatetimeIndex(pandas.to_datetime(df[date_column_name], unit='ms')).tz_localize(tz=TIME_ZONE)
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=TIME_ZONE)
            mask = mask & ((date_column < end_date) | include_open_mask)

    if 'include_labels' in param_list and 'labels' in df.columns:
        include_labels = params.get_include_labels_param()
        if include_labels is not None and len(include_labels) > 0:
            mask = mask & df['labels'].apply(lambda x: rule(x, include_labels))
    if 'exclude_labels' in param_list and 'labels' in df.columns:
        exclude_labels = params.get_exclude_labels_param()
        if exclude_labels is not None and len(exclude_labels) > 0:
            for label in exclude_labels:
                mask = mask & ~df['labels'].apply(lambda x: label in x)

    if 'priority' in param_list and 'priority' in df.columns:
        priority = params.get_priority_param()
        if priority is not None and len(priority) > 0:
            mask = mask & (df['priority'].isin(priority))

    return mask


def get_data(*, df, param_list=None, columns=None, include_open=False):
    mask = get_mask(
        df=df,
        param_list=param_list if param_list is not None else DEFAULT_PARAM_LIST,
        include_open=include_open
    )
    mask = slice(None) if mask is True else mask
    if columns is None:
        return df.loc[mask]
    return df.loc[mask, columns]


def should_display_status(status, value):
    if value > 0:
        return True
    return status not in portfolio.DEPRECATED_STATUSES


@app.route('/api/v1/teams')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def teams_handler():
    return jsonify(app.portfolio_df['team'].unique().tolist())


@app.route('/api/v1/labels')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def labels_handler():
    labels_str = get_data(df=app.portfolio_df, columns=['labels'])['labels'].values
    labels = list()
    for i in labels_str:
        labels.extend(eval(i))
    return jsonify(list(set(labels)))


@app.route('/api/v1/time_distribution')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def time_distribution_handler():
    step = params.get_step_param()
    data = get_data(df=app.portfolio_df, columns=['key', 'created', *params.get_by_param()])
    end_date = params.get_end_date_param()
    if end_date is not None:
        mask = (pandas.DatetimeIndex(pandas.to_datetime(data['created'], unit='ms')).tz_localize(tz=TIME_ZONE) <= end_date)
        data = data.loc[mask]
    if data.empty:
        return jsonify([])
    time_data = data.loc[:, params.get_by_param()].sum(axis=1)
    time_bins = pandas.cut(time_data, bins=range(0, math.ceil(time_data.max()) + step, step), include_lowest=True)
    distribution = time_bins.value_counts(sort=False)
    distribution_and_cumsum = pandas.concat([
        distribution,
        distribution.cumsum(),
        data.groupby(time_bins).key.apply(list)
    ], axis=1)
    total_sum = distribution.sum()
    converted_data = [{
        'title': '{} — {}'.format(int(interval.left), int(interval.right)),
        'value': int(value),
        'percentile': cumsum / total_sum * 100 if total_sum > 0 else 0,
        'issues': keys,
    } for (interval, value, cumsum, keys) in distribution_and_cumsum.itertuples()]
    return jsonify(converted_data)


@app.route('/api/v1/time_distribution_percentiles')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def time_distribution_percentiles_handler():
    data = get_data(df=app.portfolio_df, columns=params.get_by_param()) \
        .sum(axis=1) \
        .quantile(q=numpy.linspace(start=0.75, stop=1.0, num=6))
    converted_data = [{
        'percentile': str(int(x * 100)),
        'value': float_or_none(data[x]),
    } for x in data.to_dict().keys()]
    return jsonify(converted_data)


@app.route('/api/v1/status_distribution')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def status_distribution_handler():
    distribution = get_data(df=app.portfolio_df, columns=portfolio.DISPLAYED_STATUSES).sum()
    converted_data = [{
        'title': title,
        'value': int(value)
    } for (title, value) in distribution.iteritems() if should_display_status(title, int(value))]
    return jsonify(converted_data)


@app.route('/api/v1/time_cycle')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def time_cycle_handler():
    data = get_data(df=app.portfolio_df, columns=['key', 'summary', 'resolved', *portfolio.DISPLAYED_STATUSES]) \
        .sort_values(params.get_sort_param(), ascending=True)
    converted_data = [{
        'title': str(x.key),
        'summary': str(x.summary),
        'values': [{
            'title': status,
            'value': getattr(x, status),
        } for status in portfolio.DISPLAYED_STATUSES_WITHOUT_DEPRECATED],
    } for x in data.itertuples()]
    return jsonify(converted_data)


@app.route('/api/v1/raw_table')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def raw_table_handler():
    sorted_data = raw_table_data(params.get_sort_param()).to_dict(orient='records')
    return jsonify(sorted_data)


@app.route('/api/v1/raw_table.csv')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
@add_headers(headers={
    'Content-Disposition': 'attachment',
    'Content-Type': 'text/csv',
})
def raw_table_csv_handler():
    data = raw_table_data(params.get_sort_param())
    return data.to_csv(float_format='%.3f', index=False, sep='\t')


def raw_table_data(sort_param):
    data = get_data(df=app.portfolio_df, columns=[
        'key',
        'team',
        'summary',
        'created',
        'status',
        'table_transitions',
        'resolved',
        'labels',
        'lead_time',
        'discovery_efficiency',
        'delivery_efficiency',
        *portfolio.DISPLAYED_STATUSES_WITHOUT_DEPRECATED,
    ])
    data['resolved'].fillna(pandas.NaT, inplace=True)
    data['delivery_efficiency'].fillna(0, inplace=True)
    data['discovery_efficiency'].fillna(0, inplace=True)
    now = datetime.now(timezone.utc)
    end_date = params.get_end_date_param()
    start_date = params.get_start_date_param()
    include_open = params.get_include_open_param() == 'true'
    for index, item in data.iterrows():
        if item['status'] in portfolio.DISPLAYED_STATUSES_WITHOUT_DEPRECATED and len(item['table_transitions']) > 0:
            item_date = parser.parse(item['table_transitions'][len(item['table_transitions']) - 1]['date'])
            delta = now - item_date
            data.at[index, item['status']] = delta.days
        if not include_open:
            sort_without_open_include(item, data, start_date, end_date)
        else:
            sort_open_include(item, data, start_date, end_date)
    data.drop(['status', 'table_transitions'], axis='columns', inplace=True)
    sorted_data = data.sort_values(sort_param, ascending=False)
    return sorted_data


def sort_open_include(item, data, start_date, end_date):
    valid = False
    if item['status'] == 'FEEDBACK' or item['status'] == 'CLOSED':
        for transition in item['table_transitions']:
            if (transition['from'] == 'FEEDBACK' or transition['from'] == 'CLOSED') or \
                    (transition['to'] == 'FEEDBACK' or transition['to'] == 'CLOSED'):
                if start_date <= parser.parse(transition['date']).date() <= end_date:
                    valid = True
    else:
        valid = True
    if not valid:
        data.drop(data.loc[data['key'] == item['key']].index, inplace=True)


def sort_without_open_include(item, data, start_date, end_date):
    if item['status'] != 'CLOSED':
        valid = False
        for transition in item['table_transitions']:
            if transition['from'] == 'FEEDBACK' or transition['to'] == 'FEEDBACK':
                if start_date <= parser.parse(transition['date']) <= end_date:
                    valid = True
        if not valid:
            data.drop(data.loc[data['key'] == item['key']].index, inplace=True)


def _calculate_efficiency(data_frame, statuses=None):
    work_time = data_frame[['{}_work_time'.format(status) for status in statuses]].values.sum()
    wait_time = data_frame[['{}_wait_time'.format(status) for status in statuses]].values.sum()
    lead_time = work_time + wait_time
    return (work_time / lead_time) if lead_time > 0 else None


def _calculate_efficiency_delivery_and_discovery(data_frame, statuses_active, statuses_all):
    work_time = data_frame[['{}_work_time'.format(status) for status in statuses_active]].values.sum() \
                + data_frame[['{}_wait_time'.format(status) for status in statuses_active]].values.sum()
    total_time = data_frame[['{}_wait_time_with_block_time'.format(status) for status in statuses_all]].values.sum() \
                + data_frame[['{}_work_time_with_block_time'.format(status) for status in statuses_all]].values.sum()
    return (work_time / total_time) if total_time > 0 else None


def _calculate_team_stats(data_frame, statuses):
    if not statuses:
        aggregated = data_frame['lead_time'].aggregate([numpy.mean, numpy.median, numpy.max, numpy.std, numpy.sum])
    else:
        if len(statuses) == 1:
            aggregated = data_frame[statuses[0]].aggregate([numpy.mean, numpy.median, numpy.max, numpy.std, numpy.sum])
        else:
            cols = [x for x in data_frame.columns.values.tolist() if x not in statuses]
            df = data_frame.drop([*cols], axis=1)
            sum_row = df.sum(axis=1)
            aggregated = sum_row.aggregate([numpy.mean, numpy.median, numpy.max, numpy.std, numpy.sum])

    efficiency = _calculate_efficiency(data_frame, [status for status in statuses if status != 'lead_time'])

    discovery_efficiency = _calculate_efficiency_delivery_and_discovery(
        data_frame, list(set(statuses) & set(portfolio.DISCOVERY_STATUSES_ACTIVE)),
        list(set(statuses) & set(portfolio.DISCOVERY_STATUSES)))
    delivery_efficiency = _calculate_efficiency_delivery_and_discovery(
        data_frame, list(set(statuses) & set(portfolio.DELIVERY_STATUSES_ACTIVE)),
        list(set(statuses) & set(portfolio.DELIVERY_STATUSES)))

    return {
        'lead_time': {
            'mean': float_or_none(aggregated['mean']),
            'median': float_or_none(aggregated['median']),
            'max': float_or_none(aggregated['amax']),
            'std': float_or_none(aggregated['std']),
        },
        'efficiency': efficiency,
        'discovery_efficiency': discovery_efficiency,
        'delivery_efficiency': delivery_efficiency,
    }


@app.route('/api/v1/team_stats')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def team_stats_handler():
    columns = params.get_by_param()
    try:
        if 'lead_time' in columns:
            columns.remove('lead_time')
        hh_data = get_data(
            df=app.portfolio_df,
            param_list=['start_date', 'end_date', *LABELS, 'include_open'],
            columns=['lead_time', *['{}_work_time'.format(x) for x in columns],
                     *['{}_wait_time'.format(x) for x in columns],
                     *['{}_wait_time_with_block_time'.format(x) for x in columns],
                     *['{}_work_time_with_block_time'.format(x) for x in columns],
                     *columns]
        )
        data_by_team = get_data(df=app.portfolio_df).groupby('team')
        return jsonify({
            'hh': _calculate_team_stats(hh_data, columns),
            'by_team': [{
                'team': team,
                **_calculate_team_stats(data_frame, columns)
            } for (team, data_frame) in data_by_team]
        })
    except Exception as e:
        logging.critical('team_stats error %s', e)


@app.route('/api/v1/control_chart')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def control_chart_handler():
    data = get_data(
        df=app.portfolio_df,
        param_list=['teams', *LABELS, 'include_open'],
        columns=['key', 'summary', 'resolved', *params.get_by_param()]
    ).iloc[::-1]
    data['value'] = data.loc[:, params.get_by_param()].sum(axis=1)
    rolling_data = data.rolling(5, center=True)['value']
    data.loc[:, 'mean'] = rolling_data.mean()
    data.loc[:, 'std'] = rolling_data.std()
    data.loc[:, 'std_from'] = data['mean'] - data['std']
    data.loc[:, 'std_to'] = data['mean'] + data['std']
    converted_data = [{
        'date': x.resolved,
        'key': x.key,
        'summary': x.summary,
        'lead_time': {
            'value': x.value,
            'mean': float_or_none(x.mean),
            'std_from': float_or_none(x.std_from),
            'std_to': float_or_none(x.std_to)
        },
    } for x in data.loc[get_mask(
        df=app.portfolio_df,
        param_list=['start_date', 'end_date'],
        include_feedback_in_closed=False
    )].itertuples()]
    return jsonify(converted_data)


@app.route('/api/v1/cumulative_flow_diagram')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def cumulative_flow_diagram_handler():
    data = get_data(df=app.portfolio_df, columns=['cfd_transitions'], include_open=True)

    transitions = data.cfd_transitions.sum()
    if not transitions or len(transitions) == 0:
        return jsonify([])
    df = pandas.DataFrame(transitions)
    df.loc[:, 'date'] = pandas.to_datetime(df['date'], utc=True).dt.date

    df = pandas.concat(
        {x: df.loc[(df['status'] == x) & df['forward'], 'date'].value_counts().subtract(
            df.loc[(df['status'] == x) & ~df['forward'], 'date'].value_counts(),
            fill_value=0
        ) for x in portfolio.ALL_STATUSES},
        axis=1
    )
    df = df.sort_index()
    df = df[[x for x in portfolio.ALL_STATUSES if x not in ['IDEA', 'IDEA_READY', 'SUCCESS_DECISION', *portfolio.DEPRECATED_STATUSES]]]
    df = df.fillna(0).cumsum(axis=0)
    df.index = pandas.to_datetime(df.index, origin='unix')
    df = df.reindex(pandas.date_range(start=df.index.min(), end=df.index.max(), freq='D'), method='ffill')
    df.loc[:, 'date'] = df.index

    df = df.loc[get_mask(df=df, param_list=['start_date', 'end_date'])]

    return jsonify(df.to_dict('records'))


# namedtuple instead of dict because https://github.com/pandas-dev/pandas/issues/16741
boxplot_values = namedtuple('boxplot_values', ['count', 'numbers', 'outliers'])


def get_boxplot_values(array, data):
    def make_outlier_dict(item):
        return {
            'key': item.index.values[0],
            'title': data.loc[item.index.values[0]].summary,
            'value': item.values[0],
        }

    nonzero_values = array.loc[array.values != 0]
    if len(nonzero_values) == 0:
        return boxplot_values(
            count=0,
            numbers={},
            outliers=[],
        )
    elif len(nonzero_values) == 1:
        return boxplot_values(
            count=1,
            numbers={},
            outliers=[make_outlier_dict(nonzero_values)]
        )
    elif len(nonzero_values) <= 5:
        percentiles = [
            nonzero_values.min(),
            *numpy.percentile(array.loc[array.values != 0], axis=0, q=[25, 50, 75]),
            nonzero_values.max()
        ]
    else:
        percentiles = numpy.percentile(array.loc[array.values != 0], axis=0, q=[1, 25, 50, 75, 99])

    max_value = percentiles[4]
    bigger_values = nonzero_values > max_value
    values = numpy.flatnonzero(bigger_values.values)
    return boxplot_values(
        count=len(nonzero_values),
        numbers={
            'min': percentiles[0],
            'median': percentiles[2],
            'max': max_value,
            'quartiles': [percentiles[1], percentiles[3]],
        },
        outliers=[make_outlier_dict(nonzero_values.iloc[[x]]) for x in values]
    )


@app.route('/api/v1/boxplot_chart_by_team')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def boxplot_chart_by_team_handler():
    data = get_data(df=app.portfolio_df, columns=['key', 'lead_time', 'team', 'summary'])
    data.set_index('key', inplace=True)
    data_by_team = data.groupby('team').lead_time.agg(partial(get_boxplot_values, data=data))
    converted_data = [{
        'title': team,
        **data_iter._asdict(),
    } for team, data_iter in data_by_team.iteritems()]
    return jsonify(converted_data)


@app.route('/api/v1/boxplot_chart_by_status')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def boxplot_chart_by_status_handler():
    project = params.get_project_param()
    if project in (None, 'PORTFOLIO'):
        data = get_data(df=app.portfolio_df, columns=['key', 'summary', *portfolio.DISPLAYED_STATUSES])
        if data.empty:
            return jsonify([{
                'title': status,
                **boxplot_values(count=0, numbers={}, outliers=[])._asdict()
            } for status in portfolio.DISPLAYED_STATUSES])
        data.set_index('key', inplace=True)
        data_by_status = data.loc[:, portfolio.DISPLAYED_STATUSES].agg(partial(get_boxplot_values, data=data))
    elif project == 'HH':
        data = get_data(df=app.hh_df, columns=['key', 'summary', *HH.DISPLAYED_STATUSES])
        if data.empty:
            return jsonify([{
                'title': status,
                **boxplot_values(count=0, numbers={}, outliers=[])._asdict()
            } for status in HH.DISPLAYED_STATUSES])
        data.set_index('key', inplace=True)
        data_by_status = data.loc[:, HH.DISPLAYED_STATUSES].agg(partial(get_boxplot_values, data=data))
    else:
        raise NotImplementedError()
    converted_data = [{
        'title': status,
        **data_iter._asdict(),
    } for status, data_iter in data_by_status.iteritems() if should_display_status(status, data_iter.count)]
    return jsonify(converted_data)


@app.route('/api/v1/gantt_chart_by_portfolio_tasks')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def gantt_chart_by_portfolio_tasks_handler():
    key = params.get_portfolio_param()
    portfolio_task = fetch_issue_portfolio(config, key)
    return jsonify(portfolio_task)


@app.route('/api/v1/task_blockers')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def task_blockers_handler():
    if params.get_include_open_param() is None:
        include_open = False
    else:
        include_open = params.get_include_open_param().lower() == 'true'
    data = get_data(df=app.portfolio_df, param_list=['teams', *LABELS, 'start_date', 'end_date'],
                    columns=['key', 'lead_time', 'team', 'summary'], include_open=include_open)
    data.set_index('key', inplace=True)
    portfolio_task = fetch_task_blockers(config, data.index.values, params.get_portfolio_sort_param(),
                                         params.get_title_sort_param(), params.get_start_flag_sort_param(),
                                         params.get_end_flag_sort_param(), params.get_start_status_sort_param(),
                                         params.get_comment_sort_param(), params.get_end_status_sort_param(),
                                         params.get_current_status_sort_param(), params.get_flag_days_sort_param())
    return jsonify(portfolio_task)


@app.route('/api/v1/transitions_table')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def transitions_table_handler():
    data = get_data(df=app.portfolio_df, columns=['table_transitions'])

    transitions = data.table_transitions.sum()
    if not transitions or len(transitions) == 0:
        return jsonify([])
    df = pandas.DataFrame(transitions)
    df.loc[:, 'date'] = pandas.to_datetime(df['date'], utc=True).dt.date

    d = {}
    d.update({'{}_IN'.format(x): df.loc[(df['to'] == x), 'date'].value_counts()
              for x in portfolio.DISPLAYED_STATUSES_WITHOUT_DEPRECATED})
    d.update({'{}_OUT'.format(x): df.loc[(df['from'] == x), 'date'].value_counts()
              for x in portfolio.DISPLAYED_STATUSES_WITHOUT_DEPRECATED})
    df = pandas.concat(d, axis=1)

    df = df.reindex(pandas.date_range(start=df.index.min(), end=df.index.max(), freq='D'))
    df = df.fillna(0)
    df.loc[:, 'date'] = df.index

    df = df.loc[get_mask(df=df, param_list=['start_date', 'end_date'])]

    return jsonify(df.sum().to_dict())


def calc_bugs_stats():
    bugs_data = get_data(df=app.bugs_df, param_list=['teams', 'priority', *LABELS])
    hh_data = get_data(df=app.hh_df, param_list=['teams', *LABELS])
    mob_data = get_data(df=app.mob_df, param_list=['teams', *LABELS])
    if bugs_data.empty:
        return bugs_data
    bugs_data.loc[:, 'created_date'] = pandas.to_datetime(bugs_data['created'], utc=True).dt.date
    bugs_data.loc[:, 'resolved_date'] = pandas.to_datetime(bugs_data['resolved'], utc=True).dt.date
    hh_data.loc[:, 'resolved_date'] = pandas.to_datetime(hh_data['resolved'], utc=True).dt.date
    mob_data.loc[:, 'resolved_date'] = pandas.to_datetime(mob_data['resolved'], utc=True).dt.date

    dfs = {}
    for team, df in bugs_data.groupby('team'):
        df = pandas.concat({
            'resolved': df.loc[df['resolution'] == 'Fixed', 'resolved_date'].value_counts(),
            'created': df.loc[:, 'created_date'].value_counts(),
            'rejected': df.loc[
                df['resolution'].notnull() & (df['resolution'] != 'Fixed'), 'resolved_date'].value_counts(),
            'released_hh': hh_data.loc[
                (hh_data['resolution'] == 'Fixed') & (hh_data['team'] == team), 'resolved_date'].value_counts(),
            'released_mob': mob_data.loc[
                (mob_data['resolution'] == 'Fixed') & (mob_data['team'] == team), 'resolved_date'].value_counts(),
        }, axis=1)
        df = df.reindex(pandas.date_range(start=df.index.min(), end=df.index.max(), freq='D')) \
            .fillna(0) \
            .resample('MS').sum()
        df.loc[:, 'unresolved'] = (df['created'] - (df['resolved'] + df['rejected'])).cumsum()
        start_date = params.get_start_date_param()
        end_date = params.get_end_date_param()
        if start_date is not None:
            start_date = start_date.replace(tzinfo=None)
        if end_date is not None:
            end_date = end_date.replace(tzinfo=None)
        df = df.loc[start_date:end_date]
        dfs[team] = df

    mdf = pandas.concat(dfs, axis=0, names=['team', 'date'])
    dfs['total'] = mdf.sum(level='date')
    return pandas.concat(dfs, axis=0, names=['team', 'date'])


def empty_answer_bugs():
    return jsonify({
        'by_team': [],
        'total': {
            'values': []
        }
    })


@app.route('/api/v1/bugs')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def bugs_handler():
    df = calc_bugs_stats()
    if df.empty:
        return empty_answer_bugs()
    return jsonify({
        'by_team': [{
            'title': team,
            'values': [{
                'date': date,
                'resolved': __df.resolved.values[0],
                'created': __df.created.values[0],
                'rejected': __df.rejected.values[0],
            } for date, __df in _df.groupby(level='date')]
        } for team, _df in df.groupby(level='team') if team != 'total'],
        'total': {
            'values': [{
                'date': date,
                'resolved': __df.resolved.values[0],
                'created': __df.created.values[0],
                'rejected': __df.rejected.values[0],
            } for date, __df in df.loc['total', :].groupby(level='date')]
        },
    })


@app.route('/api/v1/bugs/resolved_to_created')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def resolved_to_created_bugs_handler():
    df = calc_bugs_stats()
    if df.empty:
        return empty_answer_bugs()
    df.loc[:, 'resolved_to_created'] = df['resolved'] / df['created']
    df.loc[:, 'resolved_to_created'].fillna(0, inplace=True)
    df.loc[df['resolved_to_created'] == numpy.inf] = 0
    return jsonify({
        'by_team': [{
            'title': team,
            'values': [{
                'date': date,
                'value': __df.resolved_to_created.values[0],
            } for date, __df in _df.groupby(level='date')]
        } for team, _df in df.groupby(level='team') if team != 'total'],
        'total': {
            'values': [{
                'date': date,
                'value': __df.resolved_to_created.values[0],
            } for date, __df in df.loc['total', :].groupby(level='date')]
        },
    })


@app.route('/api/v1/bugs/unresolved')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def unresolved_bugs_handler():
    df = calc_bugs_stats()
    if df.empty:
        return empty_answer_bugs()
    return jsonify({
        'by_team': [{
            'title': team,
            'values': [{
                'date': date,
                'value': __df.unresolved.values[0],
            } for date, __df in _df.groupby(level='date')]
        } for team, _df in df.groupby(level='team') if team != 'total'],
        'total': {
            'values': [{
                'date': date,
                'value': __df.unresolved.values[0],
            } for date, __df in df.loc['total', :].groupby(level='date')]
        },
    })


@app.route('/api/v1/bugs/bugs_to_tasks')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def created_bugs_to_released_tasks_handler():
    df = calc_bugs_stats()
    if df.empty:
        return empty_answer_bugs()
    df.loc[:, 'bugs_to_tasks'] = df['created'] / (df['released_hh'] + df['released_mob'])
    df.loc[:, 'bugs_to_tasks'].fillna(0, inplace=True)
    df.loc[df['bugs_to_tasks'] == numpy.inf] = 0
    return jsonify({
        'by_team': [{
            'title': team,
            'values': [{
                'date': date,
                'value': __df.bugs_to_tasks.values[0],
            } for date, __df in _df.groupby(level='date')]
        } for team, _df in df.groupby(level='team') if team != 'total'],
        'total': {
            'values': [{
                'date': date,
                'value': __df.bugs_to_tasks.values[0],
            } for date, __df in df.loc['total', :].groupby(level='date')]
        },
    })


@app.route('/api/v1/bugs/boxplot_by_team')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def boxplot_by_team_bugs_handler():
    data = get_data(df=app.bugs_df, param_list=['teams', 'priority', *LABELS, 'start_date', 'end_date'])
    data = data.loc[data['resolution'] == 'Fixed']
    data.set_index('key', inplace=True)
    data_by_team = data.groupby('team').OPEN.agg(partial(get_boxplot_values, data=data))
    converted_data = [{
        'title': team,
        **data_iter._asdict(),
    } for team, data_iter in data_by_team.iteritems()]
    return jsonify(converted_data)


@app.route('/api/v1/statuses')
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def statuses_handler():
    project = params.get_project_param()
    if project == 'HH':
        return jsonify(HH.STATUS_NAME_TO_VALUE)
    elif project == 'PORTFOLIO':
        return jsonify(portfolio.STATUS_NAME_TO_VALUE)


@app.route('/api/v1/update', methods=['GET', 'POST'])
@add_headers(headers={'Access-Control-Allow-Origin': '*'})
def update_handler():
    print('update_handler step 1')

    if request.method == 'GET':
        return jsonify([get_update_status(project) for project in PROJECTS])

    if request.method == 'POST':
        print('update_handler step 2')
        project = params.get_project_param()
        print('update_handler step 3')

        if project is None:
            print('update_handler step 4')

            response = make_response()
            response.status_code = HTTPStatus.BAD_REQUEST
            return response

        print('update_handler step 5')

        update_result = get_update_status(project)
        print('update_handler step 6')

        if update_result['current'] is not None:
            response = make_response()
            response.status_code = HTTPStatus.CONFLICT
            return response
        print('update_handler step 7')

        update_data.apply_async(args=[project], link=None)
        print('update_handler step 8')

        response = make_response()
        response.status_code = HTTPStatus.OK
        return response


@app.route('/api/v1/reset_cache', methods=['POST'])
def reset_cache_handler():
    project = params.get_project_param()
    if project is None:
        response = make_response()
        response.status_code = HTTPStatus.BAD_REQUEST
        return response

    df_name = '{}_df'.format(project.lower())
    if df_name in app.__dict__:
        del app.__dict__[df_name]
    response = make_response()
    response.status_code = HTTPStatus.OK
    return response
