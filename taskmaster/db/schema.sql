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
-- Name: chore_types; Type: TABLE; Schema: public; Owner: shane; Tablespace: 
--

CREATE TABLE chore_types (
    name text NOT NULL,
    id integer NOT NULL,
    created_at timestamp with time zone
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
-- Name: chores; Type: TABLE; Schema: public; Owner: shane; Tablespace: 
--

CREATE TABLE chores (
    type integer,
    person integer,
    id integer NOT NULL,
    done_date timestamp with time zone,
    created_at timestamp with time zone,
    time_taken integer DEFAULT 0
);


ALTER TABLE public.chores OWNER TO shane;

--
-- Name: chores_id_seq; Type: SEQUENCE; Schema: public; Owner: shane
--

CREATE SEQUENCE chores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chores_id_seq OWNER TO shane;

--
-- Name: chores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shane
--

ALTER SEQUENCE chores_id_seq OWNED BY chores.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: shane; Tablespace: 
--

CREATE TABLE users (
    name text,
    email text NOT NULL,
    id integer NOT NULL,
    created_at timestamp with time zone,
    points integer DEFAULT 0,
    registered boolean
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
-- Name: friends; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE friends (
    id integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    friend_user_id integer NOT NULL,
    approved boolean DEFAULT false,
    approved_at timestamp with time zone,
    created_at timestamp with time zone,
    denied boolean DEFAULT false
);


ALTER TABLE public.friends OWNER TO postgres;

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: shane
--

ALTER TABLE chore_types ALTER COLUMN id SET DEFAULT nextval('chore_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: shane
--

ALTER TABLE chores ALTER COLUMN id SET DEFAULT nextval('chores_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: shane
--

ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: chore_types_pkey; Type: CONSTRAINT; Schema: public; Owner: shane; Tablespace: 
--

ALTER TABLE ONLY chore_types
    ADD CONSTRAINT chore_types_pkey PRIMARY KEY (id);


--
-- Name: chores_pkey; Type: CONSTRAINT; Schema: public; Owner: shane; Tablespace: 
--

ALTER TABLE ONLY chores
    ADD CONSTRAINT chores_pkey PRIMARY KEY (id);


--
-- Name: friends_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: CONSTRAINT; Schema: public; Owner: shane; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: shane; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: name; Type: INDEX; Schema: public; Owner: shane; Tablespace: 
--

CREATE INDEX name ON chore_types USING btree (name);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: shane; Tablespace: 
--

CREATE INDEX users_email_idx ON users USING btree (email);


--
-- Name: chores_person_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shane
--

ALTER TABLE ONLY chores
    ADD CONSTRAINT chores_person_fkey FOREIGN KEY (person) REFERENCES users(id);


--
-- Name: chores_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shane
--

ALTER TABLE ONLY chores
    ADD CONSTRAINT chores_type_fkey FOREIGN KEY (type) REFERENCES chore_types(id);


--
-- Name: friends_friend_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY friends
    ADD CONSTRAINT friends_friend_user_id_fkey FOREIGN KEY (friend_user_id) REFERENCES users(id);


--
-- Name: friends_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY friends
    ADD CONSTRAINT friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


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

