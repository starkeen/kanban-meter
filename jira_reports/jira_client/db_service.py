import os
from datetime import datetime

import numpy
from sqlalchemy import create_engine, Column, Boolean, DateTime, Integer, String, MetaData, distinct
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from jira_reports import config
import json
import pandas as pd
from jira_reports.jira_client import PROJECTS

Base = declarative_base()
engine = create_engine(config.DB_URL, echo=False, connect_args={'check_same_thread': False})
Session = sessionmaker(bind=engine)
session = Session()


def db_engine():
    return engine


class TaskModel(Base):
    __tablename__ = 'task'

    task_id = Column(String, primary_key=True)
    finished = Column(Boolean)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    project = Column(String)
    fetched = Column(Integer)
    total = Column(Integer)

    def to_json(self):
        return {
            'task_id': self.task_id,
            'finished': self.finished,
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'project': self.project,
            'fetched': self.fetched,
            'total': self.total,
        }


class HhDataModel(Base):
    __tablename__ = 'hh_data'

    key = Column(String, primary_key=True)
    team = Column(String)
    summary = Column(String)
    created = Column(DateTime)
    resolved = Column(DateTime)
    resolution = Column(String)
    IN_PROGRESS = Column(Integer)
    NEED_REVIEW = Column(Integer)
    NEED_TESTING = Column(Integer)
    TESTING = Column(Integer)
    READY_TO_RELEASE = Column(Integer)
    MERGED_TO_RC = Column(Integer)

    def __init__(self, hh_data):
        self.key = hh_data.key
        self.team = hh_data.team
        self.summary = hh_data.summary
        self.created = hh_data.created
        self.resolved = hh_data.resolved
        self.resolution = hh_data.resolution
        self.IN_PROGRESS = hh_data.IN_PROGRESS
        self.NEED_REVIEW = hh_data.NEED_REVIEW
        self.NEED_TESTING = hh_data.NEED_TESTING
        self.TESTING = hh_data.TESTING
        self.READY_TO_RELEASE = hh_data.READY_TO_RELEASE
        self.MERGED_TO_RC = hh_data.MERGED_TO_RC

    def to_dict(self):
        return {
            'key': self.key,
            'team': self.team,
            'summary': self.summary,
            'created': self.created,
            'resolved': self.resolved,
            'resolution': self.resolution,
            'IN_PROGRESS': self.IN_PROGRESS,
            'NEED_REVIEW': self.NEED_REVIEW,
            'NEED_TESTING': self.NEED_TESTING,
            'TESTING': self.TESTING,
            'READY_TO_RELEASE': self.READY_TO_RELEASE,
            'MERGED_TO_RC': self.MERGED_TO_RC,
        }


class MobDataModel(Base):
    __tablename__ = 'mob_data'

    key = Column(String, primary_key=True)
    team = Column(String)
    summary = Column(String)
    created = Column(DateTime)
    resolved = Column(DateTime)
    resolution = Column(String)
    IN_PROGRESS = Column(Integer)
    NEED_REVIEW = Column(Integer)
    NEED_TESTING = Column(Integer)
    TESTING = Column(Integer)
    READY_TO_RELEASE = Column(Integer)
    MERGED_TO_RC = Column(Integer)

    def __init__(self, mob_data):
        self.key = mob_data.key
        self.team = mob_data.team
        self.summary = mob_data.summary
        self.created = mob_data.created
        self.resolved = mob_data.resolved
        self.resolution = mob_data.resolution
        self.IN_PROGRESS = mob_data.IN_PROGRESS
        self.NEED_REVIEW = mob_data.NEED_REVIEW
        self.NEED_TESTING = mob_data.NEED_TESTING
        self.TESTING = mob_data.TESTING
        self.READY_TO_RELEASE = mob_data.READY_TO_RELEASE
        self.MERGED_TO_RC = mob_data.MERGED_TO_RC

    def to_dict(self):
        return {
            'key': self.key,
            'team': self.team,
            'summary': self.summary,
            'created': self.created,
            'resolved': self.resolved,
            'resolution': self.resolution,
            'IN_PROGRESS': self.IN_PROGRESS,
            'NEED_REVIEW': self.NEED_REVIEW,
            'NEED_TESTING': self.NEED_TESTING,
            'TESTING': self.TESTING,
            'READY_TO_RELEASE': self.READY_TO_RELEASE,
            'MERGED_TO_RC': self.MERGED_TO_RC,
        }


class BugsDataModel(Base):
    __tablename__ = 'bugs_data'

    key = Column(String, primary_key=True)
    team = Column(String)
    summary = Column(String)
    created = Column(DateTime)
    resolved = Column(DateTime)
    priority = Column(String)
    resolution = Column(String)
    OPEN = Column(Integer)
    CLOSED = Column(Integer)

    def __init__(self, bug_data):
        self.key = bug_data.key
        self.team = bug_data.team
        self.summary = bug_data.summary
        self.created = bug_data.created
        self.resolved = bug_data.resolved
        self.priority = bug_data.priority
        self.resolution = bug_data.resolution
        self.OPEN = bug_data.OPEN
        self.CLOSED = bug_data.CLOSED

    def to_dict(self):
        return {
            'key': self.key,
            'team': self.team,
            'summary': self.summary,
            'created': self.created,
            'resolved': self.resolved,
            'resolution': self.resolution,
            'priority': self.priority,
            'OPEN': self.OPEN,
            'CLOSED': self.CLOSED,
        }


class CommentsDataModel(Base):
    __tablename__ = 'comments_data'

    task = Column(String, primary_key=True)
    current_status = Column(String)
    name = Column(String)
    comment = Column(String)
    date_from = Column(DateTime, primary_key=True)
    date_to = Column(DateTime)
    status_from = Column(String)
    status_to = Column(String)
    count_days = Column(Integer)
    empty = Column(Boolean)

    def __init__(self, comment_data):
        if not comment_data:
            self.task = None
            self.current_status = None
            self.name = None
            self.comment = None
            self.date_from = datetime.strptime("01012000", '%d%m%Y')
            self.date_to = None
            self.status_from = None
            self.status_to = None
            self.count_days = None
            self.empty = True
        else:
            self.task = comment_data['task']
            self.current_status = comment_data['current_status']
            self.name = comment_data['name']
            self.comment = comment_data['comment']
            self.date_from = comment_data['date_from']
            self.date_to = comment_data['date_to']
            self.status_from = comment_data['status_from']
            self.status_to = comment_data['status_to']
            self.count_days = comment_data['count_days']
            self.empty = False

    def to_dict(self):
        return {
            'task': self.task,
            'current_status': self.current_status,
            'name': self.name,
            'comment': self.comment,
            'date_from': self.date_from,
            'date_to': self.date_to,
            'status_from': self.status_from,
            'status_to': self.status_to,
            'count_days': self.count_days,
        }


class PortfolioDataModel(Base):
    __tablename__ = 'portfolio_data'

    key = Column(String, primary_key=True)
    team = Column(String)
    summary = Column(String)
    created = Column(DateTime)
    resolved = Column(DateTime)
    lead_time = Column(Integer)
    labels = Column(String)
    status = Column(String)
    cfd_transitions = Column(String)
    table_transitions = Column(String)
    efficiency = Column(Integer)
    discovery_efficiency = Column(Integer)
    delivery_efficiency = Column(Integer)
    STATUS_19695 = Column(Integer)
    STATUS_19696 = Column(Integer)
    STATUS_19697 = Column(Integer)
    PLANNING = Column(Integer)
    PLANNING_READY = Column(Integer)
    BACKLOG = Column(Integer)
    ESTIMATION = Column(Integer)
    ESTIMATION_READY = Column(Integer)
    DEVELOPMENT = Column(Integer)
    DEVELOPMENT_READY = Column(Integer)
    AB_TEST = Column(Integer)
    AB_TEST_READY = Column(Integer)
    FEEDBACK = Column(Integer)
    STATUS_18203 = Column(Integer)
    SUCCESS_DECISION = Column(Integer)
    REMOVE_DEAD_CODE = Column(Integer)
    STATUS_19695_work_time = Column(Integer)
    STATUS_19696_work_time = Column(Integer)
    STATUS_19697_work_time = Column(Integer)
    PLANNING_work_time = Column(Integer)
    PLANNING_READY_work_time = Column(Integer)
    BACKLOG_work_time = Column(Integer)
    ESTIMATION_work_time = Column(Integer)
    ESTIMATION_READY_work_time = Column(Integer)
    DEVELOPMENT_work_time = Column(Integer)
    DEVELOPMENT_READY_work_time = Column(Integer)
    AB_TEST_work_time = Column(Integer)
    AB_TEST_READY_work_time = Column(Integer)
    STATUS_19696_wait_time = Column(Integer)
    STATUS_19697_wait_time = Column(Integer)
    PLANNING_wait_time = Column(Integer)
    PLANNING_READY_wait_time = Column(Integer)
    BACKLOG_wait_time = Column(Integer)
    ESTIMATION_wait_time = Column(Integer)
    ESTIMATION_READY_wait_time = Column(Integer)
    DEVELOPMENT_wait_time = Column(Integer)
    DEVELOPMENT_READY_wait_time = Column(Integer)
    AB_TEST_wait_time = Column(Integer)
    AB_TEST_READY_wait_time = Column(Integer)

    def __init__(self, portfolio_data):
        self.key = portfolio_data.key
        self.team = portfolio_data.team
        self.summary = portfolio_data.summary
        self.created = portfolio_data.created
        self.resolved = portfolio_data.resolved
        self.lead_time = portfolio_data.lead_time
        self.labels = json.dumps(portfolio_data['labels'])
        self.status = portfolio_data.status
        self.cfd_transitions = json.dumps(portfolio_data['cfd_transitions'], indent=4, sort_keys=True, default=str)
        self.table_transitions = json.dumps(portfolio_data['table_transitions'], indent=4, sort_keys=True, default=str)
        self.efficiency = portfolio_data.efficiency
        self.discovery_efficiency = portfolio_data.discovery_efficiency
        self.delivery_efficiency = portfolio_data.delivery_efficiency
        self.STATUS_19695 = portfolio_data.STATUS_19695
        self.STATUS_19696 = portfolio_data.STATUS_19696
        self.STATUS_19697 = portfolio_data.STATUS_19697
        self.PLANNING = portfolio_data.PLANNING
        self.PLANNING_READY = portfolio_data.PLANNING_READY
        self.BACKLOG = portfolio_data.BACKLOG
        self.ESTIMATION = portfolio_data.ESTIMATION
        self.ESTIMATION_READY = portfolio_data.ESTIMATION_READY
        self.DEVELOPMENT = portfolio_data.DEVELOPMENT
        self.DEVELOPMENT_READY = portfolio_data.DEVELOPMENT_READY
        self.AB_TEST = portfolio_data.AB_TEST
        self.AB_TEST_READY = portfolio_data.AB_TEST_READY
        self.FEEDBACK = portfolio_data.FEEDBACK
        self.STATUS_18203 = portfolio_data.STATUS_18203
        self.REMOVE_DEAD_CODE = portfolio_data.REMOVE_DEAD_CODE
        self.SUCCESS_DECISION = portfolio_data.SUCCESS_DECISION
        self.STATUS_19695_work_time = portfolio_data.STATUS_19695_work_time
        self.STATUS_19696_work_time = portfolio_data.STATUS_19696_work_time
        self.STATUS_19697_work_time = portfolio_data.STATUS_19697_work_time
        self.PLANNING_work_time = portfolio_data.PLANNING_work_time
        self.PLANNING_READY_work_time = portfolio_data.PLANNING_READY_work_time
        self.BACKLOG_work_time = portfolio_data.BACKLOG_work_time
        self.ESTIMATION_work_time = portfolio_data.ESTIMATION_work_time
        self.ESTIMATION_READY_work_time = portfolio_data.ESTIMATION_READY_work_time
        self.DEVELOPMENT_work_time = portfolio_data.DEVELOPMENT_work_time
        self.DEVELOPMENT_READY_work_time = portfolio_data.DEVELOPMENT_READY_work_time
        self.AB_TEST_work_time = portfolio_data.AB_TEST_work_time
        self.AB_TEST_READY_work_time = portfolio_data.AB_TEST_READY_work_time
        self.STATUS_19696_wait_time = portfolio_data.STATUS_19696_wait_time
        self.STATUS_19697_wait_time = portfolio_data.STATUS_19697_wait_time
        self.PLANNING_wait_time = portfolio_data.PLANNING_wait_time
        self.PLANNING_READY_wait_time = portfolio_data.PLANNING_READY_wait_time
        self.BACKLOG_wait_time = portfolio_data.BACKLOG_wait_time
        self.ESTIMATION_wait_time = portfolio_data.ESTIMATION_wait_time
        self.ESTIMATION_READY_wait_time = portfolio_data.ESTIMATION_READY_wait_time
        self.DEVELOPMENT_wait_time = portfolio_data.DEVELOPMENT_wait_time
        self.DEVELOPMENT_READY_wait_time = portfolio_data.DEVELOPMENT_READY_wait_time
        self.AB_TEST_wait_time = portfolio_data.AB_TEST_wait_time
        self.AB_TEST_READY_wait_time = portfolio_data.AB_TEST_READY_wait_time

    def to_dict(self):
        return {
            'key': self.key,
            'team': self.team,
            'summary': self.summary,
            'created': self.created,
            'resolved': self.resolved,
            'lead_time': self.lead_time,
            'labels': self.labels,
            'status': self.status,
            'cfd_transitions': self.cfd_transitions,
            'table_transitions': self.table_transitions,
            'efficiency': self.efficiency,
            'discovery_efficiency': self.discovery_efficiency,
            'delivery_efficiency': self.delivery_efficiency,
            'STATUS_19695': self.STATUS_19695,
            'STATUS_19696': self.STATUS_19696,
            'STATUS_19697': self.STATUS_19697,
            'PLANNING': self.PLANNING,
            'PLANNING_READY': self.PLANNING_READY,
            'BACKLOG': self.BACKLOG,
            'ESTIMATION': self.ESTIMATION,
            'ESTIMATION_READY': self.ESTIMATION_READY,
            'DEVELOPMENT': self.DEVELOPMENT,
            'DEVELOPMENT_READY': self.DEVELOPMENT_READY,
            'AB_TEST': self.AB_TEST,
            'AB_TEST_READY': self.AB_TEST_READY,
            'FEEDBACK': self.FEEDBACK,
            'STATUS_18203': self.STATUS_18203,
            'REMOVE_DEAD_CODE': self.REMOVE_DEAD_CODE,
            'SUCCESS_DECISION': self.SUCCESS_DECISION,
            'STATUS_19695_work_time': self.STATUS_19695_work_time,
        }


def requested_tasks():
    tasks = session.query(distinct(CommentsDataModel.task)).all()
    return tasks


def create_database_if_it_is_need():
    if os.path.exists(config.FILE_PATH):
        tables = [TaskModel, HhDataModel, MobDataModel, BugsDataModel, CommentsDataModel, PortfolioDataModel]
        for i in tables:
            if model_exists(i) is False:
                Base.metadata.create_all(engine)
                get_data_from_jira()
                return
        if session.query(PortfolioDataModel).first() is None:
            get_data_from_jira()
    else:
        Base.metadata.create_all(engine)
        get_data_from_jira()


def model_exists(model_class):
    return model_class.metadata.tables[model_class.__tablename__].exists(engine)


def get_data_from_jira():
    for project in PROJECTS:
        from jira_reports.jira_client.get import get_data
        get_data(config, project, error_callback=None, fetch_callback=fetch_callback)


def fetch_callback(params):
    print('fetched {}/{} issues'.format(params.get('fetched'), params.get('total')))


def save_comments(comments):
    for data_item in comments:
        if data_item['date_to'] == '':
            data_item['date_to'] = None
        save_or_update(CommentsDataModel(data_item))


def save_empty_tasks(tasks):
    for task in tasks:
        item = CommentsDataModel([])
        item.task = task
        save_or_update(item)


def save_data(data, project):
    objects = []
    if project == 'HH':
        for index, item in data.iterrows():
            save_or_update(HhDataModel(item))
    elif project == 'PORTFOLIO':
        data.resolved = data.resolved.replace({numpy.nan: None})
        for index, item in data.iterrows():
            objects.append(PortfolioDataModel(item))
    elif project == 'MOB':
        for index, item in data.iterrows():
            objects.append(MobDataModel(item))
    elif project == 'BUGS':
        data.resolved = data.resolved.replace({numpy.nan: None})
        for index, item in data.iterrows():
            save_or_update(BugsDataModel(item))
    if project != 'BUGS' and project != 'HH':
        save(objects)


def save(objects):
    session.bulk_save_objects(objects)
    session.commit()


def save_or_update(object):
    session.merge(object)


def hh_data():
    hhs = session.query(HhDataModel).all()
    data = pd.DataFrame.from_records([h.to_dict() for h in hhs])
    return data


def bugs_data():
    bugs = session.query(BugsDataModel).all()
    data = pd.DataFrame.from_records([b.to_dict() for b in bugs])
    return data


def comments_data(key):
    comments = session.query(CommentsDataModel).filter(CommentsDataModel.task == key)
    if comments.count() == 0:
        return None
    if comments.count() == 1:
        if comments.one().empty:
            return []
    data = [c.to_dict() for c in comments.all()]
    return data


def mob_data():
    mobs = session.query(MobDataModel).all()
    data = pd.DataFrame.from_records([m.to_dict() for m in mobs])
    return data


def portfolio_data():
    portfolios = session.query(PortfolioDataModel).all()
    data = pd.DataFrame.from_records([p.to_dict() for p in portfolios])
    data.resolved = data.resolved.replace({None: pd.NaT})
    data.table_transitions = data.table_transitions.apply(json.loads).values.tolist()
    data.cfd_transitions = data.cfd_transitions.apply(json.loads).values.tolist()
    return data
