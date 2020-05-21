# coding=utf-8
from collections import namedtuple, OrderedDict

STATUS_NAME_TO_VALUE = OrderedDict([
    ('OPEN', '1'),
    ('IN_PROGRESS', '3'),
    ('STATUS_16993', '16993'),  # Поиск решения: в работе
    ('STATUS_16994', '16994'),  # Поиск решения: готово
    ('STATUS_16995', '16995'),  # Проверка решения: в работе
    ('STATUS_16996', '16996'),  # Проверка решения: готово
    ('RESOLVED', '5'),
])

STATUS_VALUE_TO_NAME = {STATUS_NAME_TO_VALUE[x]: x for x in STATUS_NAME_TO_VALUE.keys()}
STATUS_VALUE_TO_NAME.update({
    '4': 'OPEN',                        # Reopened
    '6': 'RESOLVED',                    # Closed
    '15': 'IN_PROGRESS',                # Awaiting Clarification
})

ALL_STATUSES = STATUS_NAME_TO_VALUE.keys()

WEBS_task = namedtuple('WEBS', [
    'key',
    'summary',
    'assignee',
    'created',
    'resolved',
    *ALL_STATUSES,
])
