# coding=utf-8
from collections import namedtuple, OrderedDict

STATUS_NAME_TO_VALUE = OrderedDict([
    ('STATUS_10371', '10371'),  # Взять в квартал
    ('STATUS_10487', '10487'),  # Кто ставит оценку
    ('OPEN', '1'),
    ('IN_PROGRESS', '3'),
    ('RESOLVED', '5'),
    ('STATUS_10488', '10488'),  # Оценка
    ('CLOSED', '6'),
])

STATUS_VALUE_TO_NAME = {STATUS_NAME_TO_VALUE[x]: x for x in STATUS_NAME_TO_VALUE.keys()}
STATUS_VALUE_TO_NAME.update({
    '4': 'OPEN',                # Reopened
})

ALL_STATUSES = STATUS_NAME_TO_VALUE.keys()

MAR_task = namedtuple('MAR', [
    'key',
    'summary',
    'reporter',
    'created',
    'resolved',
    *ALL_STATUSES,
])
