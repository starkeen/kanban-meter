# coding=utf-8
from collections import namedtuple, OrderedDict

STATUS_NAME_TO_VALUE = OrderedDict([
    ('OPEN', '1'),
    ('IN_PROGRESS', '3'),
    ('STATUS_13391', '13391'),  # На утверждении
    ('STATUS_10037', '10037'),  # Ожидание
    ('RESOLVED', '5'),
    ('CLOSED', '6'),
])

STATUS_VALUE_TO_NAME = {STATUS_NAME_TO_VALUE[x]: x for x in STATUS_NAME_TO_VALUE.keys()}
STATUS_VALUE_TO_NAME.update({
    '4': 'OPEN',                # Reopened
})

ALL_STATUSES = STATUS_NAME_TO_VALUE.keys()

RDD_task = namedtuple('RDD', [
    'key',
    'summary',
    'reporter',
    'created',
    'resolved',
    *ALL_STATUSES,
])
