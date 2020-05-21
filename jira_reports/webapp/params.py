# coding=utf-8
from dateutil.parser import parse as parse_date
from flask import request

from jira_reports.jira_client import PROJECTS
from jira_reports.projects.portfolio import LEAD_TIME_STATUSES


class Params(object):

    def __init__(self, app):
        self.app = app

    def get_sort_param(self):
        order_by = request.args.get('order_by')
        if order_by not in self.app.portfolio_df.columns:
            return 'resolved'
        return order_by

    @staticmethod
    def get_project_param():
        project_param = request.args.get('project', default='', type=str).upper()
        if project_param not in PROJECTS:
            return None
        return project_param

    @staticmethod
    def get_by_param():
        values = [x for x in request.args.getlist('by') if x == 'lead_time' or x in LEAD_TIME_STATUSES]
        if len(values) > 0:
            return values
        return ['lead_time']

    @staticmethod
    def get_start_date_param():
        return request.args.get('start_date', default=None, type=parse_date)

    @staticmethod
    def get_end_date_param():
        return request.args.get('end_date', default=None, type=parse_date)

    @staticmethod
    def get_include_labels_param():
        return request.args.getlist('include_labels')

    @staticmethod
    def get_exclude_labels_param():
        return request.args.getlist('exclude_labels')

    @staticmethod
    def get_teams_param():
        return request.args.getlist('team')

    @staticmethod
    def get_step_param():
        return request.args.get('step', default=10, type=int)

    @staticmethod
    def get_portfolio_param():
        return request.args.get('portfolio', default=None)

    @staticmethod
    def get_include_open_param():
        return request.args.get('include_open', default=None)

    @staticmethod
    def get_portfolio_sort_param():
        return request.args.get('portfolio_sort', default=None)

    @staticmethod
    def get_title_sort_param():
        return request.args.get('title_sort', default=None)

    @staticmethod
    def get_start_flag_sort_param():
        return request.args.get('start_flag_sort', default=None)

    @staticmethod
    def get_end_flag_sort_param():
        return request.args.get('end_flag_sort', default=None)

    @staticmethod
    def get_start_status_sort_param():
        return request.args.get('start_status_sort', default=None)

    @staticmethod
    def get_comment_sort_param():
        return request.args.get('comment_sort', default=None)

    @staticmethod
    def get_end_status_sort_param():
        return request.args.get('end_status_sort', default=None)

    @staticmethod
    def get_current_status_sort_param():
        return request.args.get('current_status_sort', default=None)

    @staticmethod
    def get_flag_days_sort_param():
        return request.args.get('flag_days_sort', default=None)

    @staticmethod
    def get_priority_param():
        return request.args.getlist('priority')
