# coding=utf-8
DEV_TEAM_FIELD = 'customfield_10961'
EPIC_FIELD = 'customfield_12311'
SECONDS_IN_DAY = 60 * 60 * 24
MAX_RESULTS = 300

PORTFOLIO_QUERY = "project = PORTFOLIO " \
                  "AND status NOT IN (Open, 'Идея: в работе', 'Идея: готово') " \
                  "AND (resolution IS EMPTY OR resolution NOT IN (Duplicate, Incomplete, \"Won't Fix\", 'Hold On')) " \
                  "AND NOT(resolution = Unresolved AND status = Closed) " \
                  "AND (resolutiondate IS EMPTY OR resolutiondate >= {start_date}) " \
                  "AND 'Development Team' IS NOT EMPTY " \
                  "ORDER BY resolutiondate"

HH_QUERY = "project = HH " \
           "AND resolution = Fixed " \
           "AND resolutiondate >= {start_date} " \
           "AND type = Task " \
           "AND 'Development Team' IS NOT EMPTY " \
           "ORDER BY resolutiondate"

MOB_QUERY = "project = MOB " \
            "AND resolution = Fixed " \
            "AND resolutiondate >= {start_date} " \
            "AND 'Development Team' IS NOT EMPTY " \
            "ORDER BY resolutiondate"

BUGS_QUERY = "(project = HH AND type = 'Production Bug' OR project = MOB AND type = Bug) " \
             "AND (resolutiondate IS EMPTY OR resolutiondate >= {start_date}) " \
             "AND 'Development Team' IS NOT EMPTY " \
             "ORDER BY resolutiondate"

ISSUE_INCLUDES_QUERY = "issue in ({})"

EPIC_ISSUES_QUERY = "'Epic Link' = {}"

WEBS_QUERY = "project = WEBS " \
             "AND resolution = Fixed " \
             "AND resolutiondate >= 2017-08-20 " \
             "ORDER BY resolutiondate ASC"

RDD_QUERY = "project = RDD " \
            "AND resolution = Fixed " \
            "AND resolutiondate >= 2017-08-20 " \
            "ORDER BY resolutiondate ASC"

MAR_QUERY = "project = MAR " \
            "AND resolution = Fixed " \
            "AND assignee IS NOT EMPTY " \
            "AND resolutiondate >= 2017-08-20 " \
            "ORDER BY resolutiondate ASC"

MSBM_QUERY = "project = MSBM " \
             "AND resolution = Fixed " \
             "AND assignee IS NOT EMPTY " \
             "AND resolutiondate >= 2017-08-20 " \
             "ORDER BY resolutiondate ASC"

PROJECTS = ('HH', 'PORTFOLIO', 'MOB', 'BUGS')
