#!/usr/bin/env python3
# coding=utf-8
from jira_reports import dev_config
from jira_reports.jira_client import PROJECTS
from jira_reports.jira_client.get import get_data


def fetch_callback(params):
    print('fetched {}/{} issues'.format(params.get('fetched'), params.get('total')))


for project in PROJECTS:
    get_data(dev_config, project, error_callback=None, fetch_callback=fetch_callback)
