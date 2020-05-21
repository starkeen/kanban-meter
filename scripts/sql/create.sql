DROP TABLE IF EXISTS task;
CREATE TABLE task (
    task_id VARCHAR(255) NOT NULL PRIMARY KEY,
    finished BOOLEAN,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    project VARCHAR(255) NOT NULL,
    fetched INTEGER,
    total INTEGER
);

DROP TABLE IF EXISTS hh_data;
CREATE TABLE hh_data (
	"key" VARCHAR NOT NULL,
	team VARCHAR,
	summary VARCHAR,
	created DATETIME,
	resolved DATETIME,
	resolution VARCHAR,
	"IN_PROGRESS" INTEGER,
	"NEED_REVIEW" INTEGER,
	"NEED_TESTING" INTEGER,
	"TESTING" INTEGER,
	"READY_TO_RELEASE" INTEGER,
	"MERGED_TO_RC" INTEGER,
	PRIMARY KEY ("key")
);

DROP TABLE IF EXISTS mob_data;
CREATE TABLE mob_data (
	"key" VARCHAR NOT NULL,
	team VARCHAR,
	summary VARCHAR,
	created DATETIME,
	resolved DATETIME,
	resolution VARCHAR,
	"IN_PROGRESS" INTEGER,
	"NEED_REVIEW" INTEGER,
	"NEED_TESTING" INTEGER,
	"TESTING" INTEGER,
	"READY_TO_RELEASE" INTEGER,
	"MERGED_TO_RC" INTEGER,
	PRIMARY KEY ("key")
);

DROP TABLE IF EXISTS bugs_data;
CREATE TABLE bugs_data (
	"key" VARCHAR NOT NULL,
	team VARCHAR,
	summary VARCHAR,
	created DATETIME,
	resolved DATETIME,
	priority VARCHAR,
	resolution VARCHAR,
	"OPEN" INTEGER,
	"CLOSED" INTEGER,
	PRIMARY KEY ("key")
);

DROP TABLE IF EXISTS comments_data;
CREATE TABLE comments_data (
	task VARCHAR NOT NULL,
	current_status VARCHAR,
	name VARCHAR,
	comment VARCHAR,
	date_from DATETIME NOT NULL,
	date_to DATETIME,
	status_from VARCHAR,
	status_to VARCHAR,
	count_days INTEGER,
	empty BOOLEAN,
	PRIMARY KEY (task, date_from),
	CHECK (empty IN (0, 1))
);

DROP TABLE IF EXISTS portfolio_data;
CREATE TABLE portfolio_data (
	"key" VARCHAR NOT NULL,
	team VARCHAR,
	summary VARCHAR,
	created DATETIME,
	resolved DATETIME,
	lead_time INTEGER,
	labels VARCHAR,
	status VARCHAR,
	cfd_transitions VARCHAR,
	table_transitions VARCHAR,
	efficiency INTEGER,
	discovery_efficiency INTEGER,
	delivery_efficiency INTEGER,
	"STATUS_19695" INTEGER,
	"STATUS_19696" INTEGER,
	"STATUS_19697" INTEGER,
	"PLANNING" INTEGER,
	"PLANNING_READY" INTEGER,
	"BACKLOG" INTEGER,
	"ESTIMATION" INTEGER,
	"ESTIMATION_READY" INTEGER,
	"DEVELOPMENT" INTEGER,
	"DEVELOPMENT_READY" INTEGER,
	"AB_TEST" INTEGER,
	"AB_TEST_READY" INTEGER,
	"FEEDBACK" INTEGER,
	"STATUS_18203" INTEGER,
	"STATUS_19695_work_time" INTEGER,
	"STATUS_19696_work_time" INTEGER,
    "STATUS_19697_work_time" INTEGER,
    "PLANNING_work_time" INTEGER,
    "PLANNING_READY_work_time" INTEGER,
    "BACKLOG_work_time" INTEGER,
    "ESTIMATION_work_time" INTEGER,
    "ESTIMATION_READY_work_time" INTEGER,
    "DEVELOPMENT_work_time" INTEGER,
    "DEVELOPMENT_READY_work_time" INTEGER,
    "AB_TEST_work_time" INTEGER,
    "AB_TEST_READY_work_time" INTEGER,
    "STATUS_19696_wait_time" INTEGER,
    "STATUS_19697_wait_time" INTEGER,
    "PLANNING_wait_time" INTEGER,
    "PLANNING_READY_wait_time" INTEGER,
    "BACKLOG_wait_time" INTEGER,
    "ESTIMATION_wait_time" INTEGER,
    "ESTIMATION_READY_wait_time" INTEGER,
    "DEVELOPMENT_wait_time" INTEGER,
    "DEVELOPMENT_READY_wait_time" INTEGER,
    "AB_TEST_wait_time" INTEGER,
    "AB_TEST_READY_wait_time" INTEGER,
	PRIMARY KEY ("key")
);
