--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

--
-- Name: plpgsql; Type: PROCEDURAL LANGUAGE; Schema: -; Owner: postgres
--

CREATE OR REPLACE PROCEDURAL LANGUAGE plpgsql;


ALTER PROCEDURAL LANGUAGE plpgsql OWNER TO postgres;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Chores; Type: TABLE; Schema: public; Owner: shane; Tablespace: 
--

CREATE TABLE chores (
    type integer,
    person integer,
    date date NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.chores OWNER TO shane;

--
-- Name: Chores_id_seq; Type: SEQUENCE; Schema: public; Owner: shane
--

CREATE SEQUENCE chores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chores_id_seq OWNER TO shane;

--
-- Name: Chores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shane
--

ALTER SEQUENCE chores_id_seq OWNED BY chores.id;


--
-- Name: Chores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shane
--

SELECT pg_catalog.setval('chores_id_seq', 1, false);


--
-- Name: chore_types; Type: TABLE; Schema: public; Owner: shane; Tablespace: 
--

CREATE TABLE chore_types (
    name text NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.chore_types OWNER TO shane;

--
-- Name: chore_types_id_seq; Type: SEQUENCE; Schema: public; Owner: shane
--

CREATE SEQUENCE chore_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chore_types_id_seq OWNER TO shane;

--
-- Name: chore_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shane
--

ALTER SEQUENCE chore_types_id_seq OWNED BY chore_types.id;


--
-- Name: chore_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shane
--

SELECT pg_catalog.setval('chore_types_id_seq', 1, false);


--
-- Name: users; Type: TABLE; Schema: public; Owner: shane; Tablespace: 
--

CREATE TABLE users (
    "name" text,
    "email" text NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.users OWNER TO shane;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: shane
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO shane;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shane
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shane
--

SELECT pg_catalog.setval('users_id_seq', 1, false);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: shane
--

ALTER TABLE chores ALTER COLUMN id SET DEFAULT nextval('chores_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: shane
--

ALTER TABLE chore_types ALTER COLUMN id SET DEFAULT nextval('chore_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: shane
--

ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: Chores; Type: TABLE DATA; Schema: public; Owner: shane
--

COPY chores (type, person, date, id) FROM stdin;
\.


--
-- Data for Name: chore_types; Type: TABLE DATA; Schema: public; Owner: shane
--

COPY chore_types ("name", id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: shane
--

COPY users ("name", "email", id) FROM stdin;
\.


--
-- Name: Chores_pkey; Type: CONSTRAINT; Schema: public; Owner: shane; Tablespace: 
--

ALTER TABLE ONLY chores
    ADD CONSTRAINT chores_pkey PRIMARY KEY (id);


--
-- Name: chore_types_pkey; Type: CONSTRAINT; Schema: public; Owner: shane; Tablespace: 
--

ALTER TABLE ONLY chore_types
    ADD CONSTRAINT chore_types_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: shane; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: Chores_person_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shane
--

ALTER TABLE ONLY chores
    ADD CONSTRAINT chores_person_fkey FOREIGN KEY (person) REFERENCES users(id);


--
-- Name: Chores_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shane
--

ALTER TABLE ONLY chores
    ADD CONSTRAINT chores_type_fkey FOREIGN KEY (type) REFERENCES chore_types(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

