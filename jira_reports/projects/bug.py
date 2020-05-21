# coding=utf-8
from collections import namedtuple, OrderedDict

STATUS_NAME_TO_VALUE = OrderedDict([
    ('OPEN', 1),
    ('CLOSED', '6'),
])

STATUS_VALUE_TO_NAME = {STATUS_NAME_TO_VALUE[x]: x for x in STATUS_NAME_TO_VALUE.keys()}
STATUS_VALUE_TO_NAME.update({
    '3': 'OPEN',                    # In Progress
    '4': 'OPEN',                    # Reopened
    '5': 'CLOSED',                  # Resolved
    '16': 'CLOSED',                 # Released
    '10161': 'OPEN',                # Prepare
    '10163': 'OPEN',                # Need Review
    '10131': 'OPEN',                # Need Testing
    '10333': 'OPEN',                # Testing
    '10334': 'OPEN',                # Ready To Release
    '10335': 'OPEN',                # Merged To RC
    '10482': 'OPEN',                # Reviewed
    '12092': 'CLOSED',              # Deployed
    '15391': 'CLOSED',              # Review
})

ALL_STATUSES = STATUS_NAME_TO_VALUE.keys()

DISPLAYED_STATUSES = [
    'OPEN',
    'CLOSED',
]

Bug = namedtuple('HH', [
    'key',
    'team',
    'summary',
    'created',
    'resolved',
    'priority',
    'resolution',
    *DISPLAYED_STATUSES,
])
