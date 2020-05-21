FROM ubuntu:16.04

ENV TZ Eupore/Moscow

ARG JIRA_USERNAME
ARG JIRA_PASSWORD
ARG SENTRY_DSN

ENV OAUTH_TOKEN=${OAUTH_TOKEN}
ENV OAUTH_TOKEN_SECRET=${OAUTH_TOKEN_SECRET}
ENV SENTRY_DSN=${SENTRY_DSN}

EXPOSE 1488

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y --force-yes \
            nginx \
            python3-pip \
            python3-setuptools \
            nodejs \
            yarn \
            tzdata \
            sqlite3 \
            redis-server \
            curl \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN ln -fs /usr/share/zoneinfo/Europe/Moscow /etc/localtime && dpkg-reconfigure -f noninteractive tzdata

COPY requirements.txt /usr/share/jira-reports/requirements.txt
COPY jira_reports /usr/share/jira-reports/jira_reports
COPY run.py /usr/share/jira-reports/run.py
COPY static /usr/share/jira-reports/static
COPY scripts /usr/share/jira-reports/scripts
COPY usr/ /usr/
COPY etc/ /etc/
COPY var/ /var/
RUN chmod 755 /etc/init.d/celeryd
RUN chmod 640 /etc/default/celeryd
RUN adduser --system --ingroup www-data --shell /bin/bash celery

WORKDIR /usr/share/jira-reports/static
RUN NODE_ENV=production yarn && yarn build

WORKDIR /usr/share/jira-reports
RUN pip3 install -r /usr/share/jira-reports/requirements.txt
RUN sqlite3 /var/jira-reports/db.sqlite < /usr/share/jira-reports/scripts/sql/create.sql
RUN chown -R www-data:www-data /var/jira-reports /usr/share/jira-reports && \
    chmod 775 -R /var/jira-reports && \
    chmod 555 -R /usr/share/jira-reports

CMD service nginx start && \
    service redis-server start && \
    service celeryd start && \
    gunicorn -c /etc/gunicorn/config jira_reports.webapp:app
