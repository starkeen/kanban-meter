# coding=utf-8
from json.decoder import JSONDecodeError
from requests.exceptions import RequestException

from jira_reports.jira_client.fetch import fetch_data
from jira_reports.jira_client.parse import parse_data
from jira_reports.jira_client.db_service import save_data


def get_data(config, project, error_callback=None, fetch_callback=None):
    file_name = getattr(config, '{}_DATA_PATH'.format(project))
    if file_name is None:
        return

    try:
        data = fetch_data(project, config, fetch_callback)
    except (JSONDecodeError, RequestException) as e:
        if error_callback is not None:
            error_callback(e)
    else:
        parsed_data = parse_data(project, data)
        if parsed_data is not None:
            save_data(parsed_data, project)
            # parsed_data.to_pickle(file_name)
