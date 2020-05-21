# coding=utf-8
import math
from functools import wraps

from flask import make_response


def add_headers(headers=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            resp = make_response(f(*args, **kwargs))
            h = resp.headers
            if headers is not None:
                for header, value in headers.items():
                    h[header] = value
            return resp
        return decorated_function
    return decorator


def float_or_none(value):
    if math.isfinite(value):
        return value
    return None
