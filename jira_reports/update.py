# coding=utf-8
from datetime import datetime

import requests
from celery import Celery
from celery.schedules import crontab
from celery.states import FAILURE
from celery.task import Task, periodic_task
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from werkzeug.utils import cached_property

from jira_reports import config
from jira_reports.jira_client.db_service import TaskModel, db_engine
from jira_reports.jira_client.fetch import execute_blockers, fetch_issue
from jira_reports.jira_client.get import get_data

celery_instance = Celery(broker=config.CELERY_BROKER_URL)

Base = declarative_base()


class UpdateTask(Task):

    @cached_property
    def session(self):
        engine = db_engine()
        return sessionmaker(bind=engine)()


def task_comments(config, data, empty_tasks):
    portfolio = fetch_issue(config, data, True)
    tmp = execute_blockers(data, portfolio)
    if not tmp:
        empty_tasks.append(data)
    return tmp


@celery_instance.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls test('hello') every 10 seconds.
    sender.add_periodic_task(10.0, update_task_data.s())


@periodic_task(run_every=(crontab(minute='*')), name="run_every_minute", ignore_result=True)
def run_every_minute():
    print("hello")


@celery_instance.task(bind=True)
def update_task_data():
    print('ololo')
    # tasks_data = requested_tasks()
    # if tasks_data:
    #     tasks = []
    #     for data in tasks_data:
    #         tasks.append(data[0])
    #     empty_tasks = []
    #     args = ((config, data) for data in tasks)
    #     with concurrent.futures.ThreadPoolExecutor(max_workers=600) as executor:
    #         results_poll = list(executor.map(lambda p: task_comments(*p, empty_tasks), args))
    #     results_poll = sum(results_poll, [])
    #     save_comments(results_poll)
    #     save_empty_tasks(empty_tasks)


@celery_instance.task(base=UpdateTask, bind=True)
def update_data(self, project):
    print('update_data step 1')
    task = TaskModel(task_id=update_data.request.id, finished=False, start_date=datetime.now(), project=project)
    update_data.session.add(task)
    print('update_data step 2')
    update_data.session.commit()
    print('update_data step 3')

    def error_cb():
        self.update_state(FAILURE)
    print('update_data step 4')

    def fetch_cb(params):
        task.fetched = params.get('fetched')
        task.total = params.get('total')
        update_data.session.commit()
    print('update_data step 5')

    get_data(config, project, error_callback=error_cb, fetch_callback=fetch_cb)

    task.finished = True
    task.end_date = datetime.now()
    update_data.session.commit()

    requests.post(
        url='http://127.0.0.1:1489/api/v1/reset_cache',
        params={
            'project': project.lower(),
        }
    )


def get_update_status(project):
    last_task_result = update_data \
        .session \
        .query(TaskModel) \
        .filter_by(project=project, finished=True) \
        .order_by(TaskModel.start_date.desc()) \
        .first()
    current_task_result = update_data \
        .session \
        .query(TaskModel) \
        .filter_by(project=project, finished=False) \
        .order_by(TaskModel.start_date.desc()) \
        .first()
    return {
        'project': project,
        'last': last_task_result.to_json() if last_task_result is not None else None,
        'current': current_task_result.to_json() if current_task_result is not None else None,
    }


if __name__ == '__main__':
    celery_instance.worker_main()
