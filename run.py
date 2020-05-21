#!/usr/bin/env python3
# coding=utf-8
from jira_reports import config
from jira_reports.jira_client.db_service import create_database_if_it_is_need
from jira_reports.webapp import app


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


def fetch_callback(params):
    print('fetched {}/{} issues'.format(params.get('fetched'), params.get('total')))


create_database_if_it_is_need()

app.config.from_object(config)
app.run(host='0.0.0.0', port=1489, debug=False)
