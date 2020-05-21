#!/usr/bin/env python3
# coding=utf-8
from jira_reports import dev_config
from jira_reports.jira_client import fetch, parse
from jira_reports.trl import TRL

parse.parse_data('webs', fetch.fetch_webs_data(dev_config)).to_csv(
    'WEBS.csv',
    index=False,
    float_format='%.2f',
    encoding='utf-8',
    header=[
        'Key',
        'Summary',
        'Assignee',
        'Created',
        'Resolved',
        TRL['OPEN'],
        TRL['IN_PROGRESS'],
        TRL['STATUS_16993'],
        TRL['STATUS_16994'],
        TRL['STATUS_16995'],
        TRL['STATUS_16996'],
        TRL['RESOLVED'],
    ]
)

parse.parse_data('rdd', fetch.fetch_rdd_data(dev_config)).to_csv(
    'RDD.csv',
    index=False,
    float_format='%.2f',
    encoding='utf-8',
    header=[
        'Key',
        'Summary',
        'Reporter',
        'Created',
        'Resolved',
        TRL['OPEN'],
        TRL['IN_PROGRESS'],
        TRL['STATUS_13391'],
        TRL['STATUS_10037'],
        TRL['RESOLVED'],
        TRL['CLOSED'],
    ]
)

parse.parse_data('mar', fetch.fetch_mar_data(dev_config)).to_csv(
    'MAR.csv',
    index=False,
    float_format='%.2f',
    encoding='utf-8',
    header=[
        'Key',
        'Summary',
        'Reporter',
        'Created',
        'Resolved',
        TRL['STATUS_10371'],
        TRL['STATUS_10487'],
        TRL['OPEN'],
        TRL['IN_PROGRESS'],
        TRL['RESOLVED'],
        TRL['STATUS_10488'],
        TRL['CLOSED'],
    ]
)

parse.parse_data('msbm', fetch.fetch_msbm_data(dev_config)).to_csv(
    'MSBM.csv',
    index=False,
    float_format='%.2f',
    encoding='utf-8',
    header=[
        'Key',
        'Summary',
        'Reporter',
        'Created',
        'Resolved',
        TRL['OPEN'],
        TRL['STATUS_10488'],
        TRL['STATUS_10305'],
        TRL['STATUS_11192'],
        TRL['STATUS_10375'],
        TRL['STATUS_11193'],
        TRL['STATUS_11194'],
        TRL['STATUS_10037'],
        TRL['STATUS_15691'],
        TRL['STATUS_10136'],
        TRL['STATUS_16391'],
        TRL['STATUS_11593'],
        TRL['CLOSED'],
    ]
)
