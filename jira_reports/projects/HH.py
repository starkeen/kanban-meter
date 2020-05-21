# coding=utf-8
from collections import namedtuple, OrderedDict

STATUS_NAME_TO_VALUE = OrderedDict([
    ('OPEN', '1'),
    ('IN_PROGRESS', '3'),
    ('NEED_REVIEW', '10163'),
    ('NEED_TESTING', '10131'),
    ('TESTING', '10333'),
    ('READY_TO_RELEASE', '10334'),
    ('MERGED_TO_RC', '10335'),
    ('RELEASED', '16'),
])

STATUS_VALUE_TO_NAME = {STATUS_NAME_TO_VALUE[x]: x for x in STATUS_NAME_TO_VALUE.keys()}
STATUS_VALUE_TO_NAME.update({
    '4': 'OPEN',                    # Reopened
    '5': 'RELEASED',                # Resolved
    '6': 'RELEASED',                # Closed
    '12092': 'RELEASED',            # Deployed
    '15391': 'NEED_REVIEW',         # Review
})

ALL_STATUSES = STATUS_NAME_TO_VALUE.keys()

DISPLAYED_STATUSES = [
    'IN_PROGRESS',
    'NEED_REVIEW',
    'NEED_TESTING',
    'TESTING',
    'READY_TO_RELEASE',
    'MERGED_TO_RC',
]

HH_task = namedtuple('HH', [
    'key',
    'team',
    'summary',
    'created',
    'resolved',
    'resolution',
    *DISPLAYED_STATUSES,
])
