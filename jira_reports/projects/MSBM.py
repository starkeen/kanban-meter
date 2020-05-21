# coding=utf-8
from collections import namedtuple, OrderedDict

STATUS_NAME_TO_VALUE = OrderedDict([
    ('OPEN', '1'),
    ('STATUS_10488', '10488'),  # Оценка
    ('STATUS_10305', '10305'),  # Концепция
    ('STATUS_11192', '11192'),  # Тексты
    ('STATUS_10375', '10375'),  # Дизайн
    ('STATUS_11193', '11193'),  # Верстка/продакшн/размещение
    ('STATUS_11194', '11194'),  # Демо/снятие статистики
    ('STATUS_10037', '10037'),  # Ожидание
    ('STATUS_15691', '15691'),  # design
    ('STATUS_10136', '10136'),  # На согласовании
    ('STATUS_16391', '16391'),  # Согласование у бренд-менеджера
    ('STATUS_11593', '11593'),  # На оценке у заказчика
    ('CLOSED', '6'),
])

STATUS_VALUE_TO_NAME = {STATUS_NAME_TO_VALUE[x]: x for x in STATUS_NAME_TO_VALUE.keys()}
STATUS_VALUE_TO_NAME.update({
    '4': 'OPEN',                # Reopened
})

ALL_STATUSES = STATUS_NAME_TO_VALUE.keys()

MSBM_task = namedtuple('MSBM', [
    'key',
    'summary',
    'reporter',
    'created',
    'resolved',
    *ALL_STATUSES,
])
