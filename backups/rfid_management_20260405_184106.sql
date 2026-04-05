--
-- PostgreSQL database dump
--

\restrict dBM914889dechl4HB09laisABxhDk30ADmeXHTdqMgf39GxPz3k0ACHOaRIgBkH

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ActionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActionType" AS ENUM (
    'SCAN',
    'PRINT',
    'REGISTER'
);


ALTER TYPE public."ActionType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id text NOT NULL,
    hospital_id text NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id text NOT NULL,
    department_id text NOT NULL,
    name character varying(50) NOT NULL,
    phone character varying(20),
    rfid_code character varying(50),
    rfid_registered_at timestamp(3) without time zone,
    memo text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    location character varying(100),
    uniform_type character varying(100)
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: hospital_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospital_users (
    user_id text NOT NULL,
    hospital_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.hospital_users OWNER TO postgres;

--
-- Name: hospitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospitals (
    id text NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.hospitals OWNER TO postgres;

--
-- Name: scan_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scan_logs (
    id text NOT NULL,
    employee_id text NOT NULL,
    action_type public."ActionType" NOT NULL,
    rfid_code character varying(50) NOT NULL,
    device_id character varying(50) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.scan_logs OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d82ef09b-b27b-446f-9169-8b4a61c91077	9749f738fc785c11f352677d0d091dab33400b88bee725bfafc5a02f58be352f	2026-03-06 03:18:05.951766+00	20260214102153_init	\N	\N	2026-03-06 03:18:05.921412+00	1
2087ec30-e6a6-4d93-a92d-e821ee7d2630	8c06bbc56b4dd7f4f555d56a7088482bc643c1bae35795e7ef0bccb91517e0fe	2026-03-06 03:18:05.956141+00	20260214124453_add_register_action_type	\N	\N	2026-03-06 03:18:05.952676+00	1
06545003-4693-423c-8eab-06c6581f5750	3fdaa400e624664dc4fdbeccececa846bf37625ac3bf3d1c11c8d08c73c12cc5	2026-03-06 03:18:05.960484+00	20260218065152_add_employee_location	\N	\N	2026-03-06 03:18:05.957036+00	1
920cc103-cbbe-4e76-910f-46fbe5b1502e	73b7e2b35fc9e8f3925aa0c7321ca346effbc8aca709af5779984bebd767943c	2026-03-06 03:18:05.969765+00	20260218065506_add_employee_uniform_type	\N	\N	2026-03-06 03:18:05.961357+00	1
62da1486-ffe9-4825-ab70-822bcae3e42d	f7c7911b4399488fc56aa1beb569576e71a505db24d9296a008af3d6690e1655	2026-04-05 02:49:58.754325+00	20260405024958_add_user_model	\N	\N	2026-04-05 02:49:58.733159+00	1
7ae9886d-6ebe-4799-861b-0fe0a3633f53	c68959fe28642fa797a5dd8853f593f08c90d6888ca1b4444b169cf0fedaf14b	\N	20260405031342_add_hospital_to_user	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260405031342_add_hospital_to_user\n\nDatabase error code: 42804\n\nDatabase error:\nERROR: foreign key constraint "users_hospital_id_fkey" cannot be implemented\nDETAIL: Key columns "hospital_id" and "id" are of incompatible types: uuid and text.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42804), message: "foreign key constraint \\"users_hospital_id_fkey\\" cannot be implemented", detail: Some("Key columns \\"hospital_id\\" and \\"id\\" are of incompatible types: uuid and text."), hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(9520), routine: Some("ATAddForeignKeyConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260405031342_add_hospital_to_user"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260405031342_add_hospital_to_user"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2026-04-05 03:13:54.029837+00	2026-04-05 03:13:42.855818+00	0
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, hospital_id, name, created_at, updated_at) FROM stdin;
6ed43dbe-339e-44c1-ab36-d4da09582d29	2b2895b8-baf6-4056-8e53-af5b28f99dc4	총무과	2026-03-18 09:57:00.734	2026-03-18 10:28:09.925
edd7e499-4b26-4607-a789-f710f49b4ed4	2b2895b8-baf6-4056-8e53-af5b28f99dc4	임상병리과	2026-03-06 13:56:30.934	2026-03-20 01:43:40.82
34f24911-af48-429e-9e62-bea12f545cb8	2b2895b8-baf6-4056-8e53-af5b28f99dc4	신속진단검사팀	2026-03-20 01:45:07.619	2026-03-20 01:45:07.619
4b956d8d-e40e-4399-bea5-2faa1fcaa30c	2b2895b8-baf6-4056-8e53-af5b28f99dc4	특수건강진단팀	2026-03-20 01:45:22.304	2026-03-20 01:45:22.304
cfe3683d-55d9-4689-b41c-4ab2f41eed77	2b2895b8-baf6-4056-8e53-af5b28f99dc4	정밀의료자원제작팀	2026-03-20 01:45:36.113	2026-03-20 01:45:36.113
eb3b1383-36a2-4d60-ab21-4bf5e9aab60e	2b2895b8-baf6-4056-8e53-af5b28f99dc4	면역방사선팀	2026-03-20 01:45:47.568	2026-03-20 01:45:47.568
c97ae97b-d2fc-411f-8518-b09dec7fa5be	2b2895b8-baf6-4056-8e53-af5b28f99dc4	E-대사의학팀	2026-03-20 01:46:09.276	2026-03-20 01:46:09.276
7bfed548-f7fd-4a44-87ae-d2c3fceb146d	2b2895b8-baf6-4056-8e53-af5b28f99dc4	인간유전팀	2026-03-20 01:46:18.188	2026-03-20 01:46:18.188
3c49295d-7837-4dcb-b2f2-397fcb89b2bb	2b2895b8-baf6-4056-8e53-af5b28f99dc4	면역효소팀	2026-03-20 01:46:29.569	2026-03-20 01:46:29.569
84670be5-6cb1-4a03-b73d-6eb42716d79e	2b2895b8-baf6-4056-8e53-af5b28f99dc4	세포유전팀	2026-03-20 01:46:42.86	2026-03-20 01:46:42.86
79bc4837-5e98-4505-bb67-2fdb0c475051	2b2895b8-baf6-4056-8e53-af5b28f99dc4	특수미생물팀	2026-03-20 01:46:58.013	2026-03-20 01:46:58.013
a4c59280-d199-4d6b-a334-5e87f193846d	2b2895b8-baf6-4056-8e53-af5b28f99dc4	미생물팀	2026-03-20 01:47:07.231	2026-03-20 01:47:07.231
17e3f316-8276-4e79-8da6-2825832b7922	2b2895b8-baf6-4056-8e53-af5b28f99dc4	검체관리1팀	2026-03-20 01:47:42.865	2026-03-20 01:47:42.865
d8253642-dbe4-4cd4-87a7-c9c307cbc6d2	cmnljcnav00018dlvxo2ifkwg	제1부서	2026-04-05 09:06:38.82	2026-04-05 09:06:38.82
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, department_id, name, phone, rfid_code, rfid_registered_at, memo, created_at, updated_at, location, uniform_type) FROM stdin;
c597246e-9821-46b0-8dfd-1db91c8e76ad	edd7e499-4b26-4607-a789-f710f49b4ed4	홍길동	010-1212-2323	\N	\N	\N	2026-03-06 13:58:45.277	2026-03-06 13:58:45.277	내과	간호복 상의
27c2a481-8174-4bb2-84ea-8e722c9cd93a	edd7e499-4b26-4607-a789-f710f49b4ed4	박재홍	010-2582-1198	E2806995000040009125A09E	2026-03-06 13:59:09.261	\N	2026-03-06 13:58:12.764	2026-03-06 13:59:09.262	본관 2층 채혈실	근무복 하의
5a20a873-8556-41ff-918a-2152f3f79208	34f24911-af48-429e-9e62-bea12f545cb8	강성호	01093360163	\N	\N	\N	2026-03-20 01:48:20.862	2026-03-20 01:52:48.019	임상병리	의사가운
e485d3ce-ebaa-47f6-aea8-b7a5a6ad760a	cfe3683d-55d9-4689-b41c-4ab2f41eed77	조연우	01036520327	3000E2806995000050028543D582	2026-03-20 03:10:39.47	\N	2026-03-20 01:54:14.032	2026-03-20 03:10:39.471	임상병이	의사가운
00fdd005-36f2-4018-b2e9-02623df1566c	4b956d8d-e40e-4399-bea5-2faa1fcaa30c	공혜빈	01051881521	3000E28069950000500285496D93	2026-03-20 03:28:51.465	\N	2026-03-20 01:53:25.612	2026-03-20 03:28:51.465	임상병리	의사가운
c85a4504-18e0-4210-99bd-8ee53195cb56	d8253642-dbe4-4cd4-87a7-c9c307cbc6d2	홍길동	010-1234-1234	\N	\N	\N	2026-04-05 09:07:03.596	2026-04-05 09:07:03.596	본관 12층	간호복 상의
\.


--
-- Data for Name: hospital_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospital_users (user_id, hospital_id, created_at) FROM stdin;
a7a8c287-b810-46c0-aca2-5b8017878b75	2b2895b8-baf6-4056-8e53-af5b28f99dc4	2026-04-05 09:14:16.11
3c806285-8bcf-44c3-ac61-54791dc52873	2b2895b8-baf6-4056-8e53-af5b28f99dc4	2026-04-05 09:14:16.122
cmnl6y1yo0000szxu41tc75n4	cmnljcnav00018dlvxo2ifkwg	2026-04-05 09:14:16.128
\.


--
-- Data for Name: hospitals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospitals (id, name, created_at, updated_at) FROM stdin;
2b2895b8-baf6-4056-8e53-af5b28f99dc4	녹십자의료재단	2026-03-06 13:56:12.41	2026-03-06 13:56:12.41
cmnljcnav00018dlvxo2ifkwg	우리종합병원	2026-04-05 09:04:56.311	2026-04-05 09:04:56.311
\.


--
-- Data for Name: scan_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scan_logs (id, employee_id, action_type, rfid_code, device_id, created_at) FROM stdin;
a0a9283c-1aa6-44bd-87a2-b0865459d365	27c2a481-8174-4bb2-84ea-8e722c9cd93a	SCAN	E2806995000040009125A09E	HC-PDA2-001	2026-03-06 13:59:09.274
e72da49b-1d00-4a76-8398-bec6fde6417d	27c2a481-8174-4bb2-84ea-8e722c9cd93a	REGISTER	E2806995000040009125A09E	HC-PDA2-001	2026-03-06 13:59:09.364
a9f10bec-bdbd-4bdc-bcab-5bce481815c0	e485d3ce-ebaa-47f6-aea8-b7a5a6ad760a	SCAN	3000E2806995000050028543D582	AT907-001	2026-03-20 03:10:39.483
fc13c0a2-ff2e-4018-8365-0a3710b554fc	e485d3ce-ebaa-47f6-aea8-b7a5a6ad760a	REGISTER	3000E2806995000050028543D582	AT907-001	2026-03-20 03:10:39.64
9746103f-42ed-4bd9-872e-3cea7c98faf9	00fdd005-36f2-4018-b2e9-02623df1566c	SCAN	3000E28069950000500285496D93	AT907-001	2026-03-20 03:28:51.482
6dae1d00-cd98-498e-88d5-1d95ca533715	00fdd005-36f2-4018-b2e9-02623df1566c	REGISTER	3000E28069950000500285496D93	AT907-001	2026-03-20 03:28:51.771
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, created_at, updated_at) FROM stdin;
a1658557-c5ce-44c4-b602-9fb6e81aa858	admin	$2b$10$0iPNdXEDxeqnekyHSxUL5eYomVPeGkDZGBxzkeoGecErlpuj6ihPS	admin	2026-04-05 02:50:27.349	2026-04-05 02:50:27.349
a7a8c287-b810-46c0-aca2-5b8017878b75	laon	$2b$10$EfFmvTQ4z.xlSzVlEu2iiOXcqnKxctys2k9ih5MZzppx9iXZ4FhfS	member	2026-04-05 02:56:58.149	2026-04-05 03:14:46.374
3c806285-8bcf-44c3-ac61-54791dc52873	green	$2b$10$s4Y2k/.uSM9mMv7cziQ3k.WTfcsLxoUigR3f68OFuGzgjGhD7kYsq	member	2026-04-05 03:12:28.136	2026-04-05 03:14:46.388
cmnl6y1yo0000szxu41tc75n4	haesung	$2b$10$DfZXrW7.ywgQfYUuvXY8xODGPd2XVkXy4nz2xUNm1d/m5EDtiTCH6	member	2026-04-05 03:17:40.081	2026-04-05 09:05:56.838
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: hospital_users hospital_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_users
    ADD CONSTRAINT hospital_users_pkey PRIMARY KEY (user_id, hospital_id);


--
-- Name: hospitals hospitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_pkey PRIMARY KEY (id);


--
-- Name: scan_logs scan_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_logs
    ADD CONSTRAINT scan_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: employees_rfid_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employees_rfid_code_key ON public.employees USING btree (rfid_code);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: departments departments_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hospital_users hospital_users_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_users
    ADD CONSTRAINT hospital_users_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hospital_users hospital_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_users
    ADD CONSTRAINT hospital_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scan_logs scan_logs_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_logs
    ADD CONSTRAINT scan_logs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dBM914889dechl4HB09laisABxhDk30ADmeXHTdqMgf39GxPz3k0ACHOaRIgBkH

