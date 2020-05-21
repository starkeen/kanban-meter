# coding=utf-8
from collections import namedtuple, OrderedDict

STATUS_NAME_TO_VALUE = OrderedDict([
    ('IDEA', '10304'),                  # Идея
    ('IDEA_READY', '16091'),            # Идея: готово
    ('STATUS_19695', '19695'),          # Проработка: анализ проблемы
    ('STATUS_19696', '19696'),          # Проработка: генерация/отсев вариантов
    ('STATUS_19697', '19697'),          # Проработка с чеклистами
    ('PLANNING', '10308'),              # Проработка: детализация
    ('PLANNING_READY', '16092'),        # Проработка: готово
    ('BACKLOG', '17591'),               # Backlog разработки
    ('ESTIMATION', '12592'),            # Декомпозиция: в работе
    ('ESTIMATION_READY', '16093'),      # Декомпозиция: готово
    ('DEVELOPMENT', '10309'),           # Разработка: в работе
    ('DEVELOPMENT_READY', '16094'),     # Разработка: готово
    ('AB_TEST', '14792'),               # A/B-тест: в работе
    ('AB_TEST_READY', '16095'),         # A/B-тест: готово
    ('FEEDBACK', '10256'),              # Обратная связь
    ('STATUS_18203', '18203'),          # Сбор обратной связи от пользователей
    ('CLOSED', '6'),                    # Closed
    ('RESOLVED', '5'),                  # Resolved
    ('SUCCESS_DECISION', '22891'),      # Решение об успехе: Готово
    ('REMOVE_DEAD_CODE', '22892'),      # Удаление лишнего кода: в работе
])

STATUS_VALUE_TO_NAME = {STATUS_NAME_TO_VALUE[x]: x for x in STATUS_NAME_TO_VALUE.keys()}
STATUS_VALUE_TO_NAME.update({
    '1': 'IDEA',                        # Open
    '12591': 'PLANNING',                # Аналитика и дизайн
    '10301': 'FEEDBACK',                # Мониторинг и маркетинговое сопровождение
})

ALL_STATUSES = STATUS_NAME_TO_VALUE.keys()

LEAD_TIME_STATUSES = [
    'STATUS_19695',
    'STATUS_19696',
    'STATUS_19697',
    'PLANNING',
    'PLANNING_READY',
    'BACKLOG',
    'ESTIMATION',
    'ESTIMATION_READY',
    'DEVELOPMENT',
    'DEVELOPMENT_READY',
    'AB_TEST',
    'AB_TEST_READY',
    'SUCCESS_DECISION',
    'REMOVE_DEAD_CODE',
]
DISPLAYED_STATUSES = LEAD_TIME_STATUSES + ['FEEDBACK', 'STATUS_18203']
DEPRECATED_STATUSES = ['BACKLOG', 'STATUS_19697', 'AB_TEST_READY', 'STATUS_18203']
DISPLAYED_STATUSES_WITHOUT_DEPRECATED = [x for x in DISPLAYED_STATUSES if x not in DEPRECATED_STATUSES]

DISCOVERY_STATUSES_ACTIVE = [
    'STATUS_19695',
    'STATUS_19696',
    'STATUS_19697',
    'PLANNING',
]
DISCOVERY_STATUSES = [
    'STATUS_19695',
    'STATUS_19696',
    'STATUS_19697',
    'PLANNING',
    'PLANNING_READY',
]
DELIVERY_STATUSES_ACTIVE = [
    'ESTIMATION',
    'DEVELOPMENT',
    'AB_TEST',
    'REMOVE_DEAD_CODE',
]
DELIVERY_STATUSES = [
    'BACKLOG',
    'ESTIMATION',
    'ESTIMATION_READY',
    'DEVELOPMENT',
    'DEVELOPMENT_READY',
    'AB_TEST',
    'AB_TEST_READY',
    'REMOVE_DEAD_CODE',
]

Portfolio = namedtuple('Portfolio', [
    'key',
    'team',
    'summary',
    'created',
    'resolved',
    'lead_time',
    'labels',
    'status',
    'cfd_transitions',
    'table_transitions',
    'efficiency',
    'discovery_efficiency',
    'delivery_efficiency',
    *DISPLAYED_STATUSES,
    *('{}_work_time'.format(x) for x in LEAD_TIME_STATUSES),
    *('{}_wait_time'.format(x) for x in LEAD_TIME_STATUSES),
    *('{}_work_time_with_block_time'.format(x) for x in LEAD_TIME_STATUSES),
    *('{}_wait_time_with_block_time'.format(x) for x in LEAD_TIME_STATUSES),
])
