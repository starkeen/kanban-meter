# coding=utf-8
import os

SENTRY_DSN = os.environ.get('SENTRY_DSN', None)
OAUTH_TOKEN = os.environ.get('OAUTH_TOKEN', None)
OAUTH_TOKEN_SECRET = os.environ.get('OAUTH_TOKEN_SECRET', None)

BUGS_DATA_PATH = '/var/jira-reports/bugs-data.bin'
HH_DATA_PATH = '/var/jira-reports/hh-data.bin'
MOB_DATA_PATH = '/var/jira-reports/mob-data.bin'
PORTFOLIO_DATA_PATH = '/var/jira-reports/portfolio-data.bin'

START_DATE = '2014-01-01'

CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'

DB_URL = 'sqlite:////var/jira-reports/db.sqlite'

FILE_PATH = "/var/jira-reports/db.sqlite"

HOST = 'https://kanban-meter.host'

CONSUMER_KEY = 'jira-reports'

RSA_KEY = '/var/jira-reports/cert/jira_privatekey.pem'
