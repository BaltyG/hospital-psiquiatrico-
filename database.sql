--
-- PostgreSQL database dump
--

\restrict OZlaPONcIYMnZLyaU3hTLTScVRt7pR0UcXBIhJrmzOVsYTOCDbruRPvWHhfG5V0

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administracion (
    id_administracion integer NOT NULL,
    id_prescripcion integer NOT NULL,
    id_profesional integer NOT NULL,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dosis_aplicada numeric(10,2) NOT NULL,
    observaciones text,
    notas_enfermeria text,
    CONSTRAINT administracion_dosis_aplicada_check CHECK ((dosis_aplicada > (0)::numeric))
);


ALTER TABLE public.administracion OWNER TO postgres;

--
-- Name: administracion_id_administracion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administracion_id_administracion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administracion_id_administracion_seq OWNER TO postgres;

--
-- Name: administracion_id_administracion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administracion_id_administracion_seq OWNED BY public.administracion.id_administracion;


--
-- Name: alerta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerta (
    id_alerta integer NOT NULL,
    expediente character varying(20) NOT NULL,
    id_ingreso integer,
    id_prescripcion integer,
    revisado_por integer,
    tipo_alerta character varying(50) NOT NULL,
    severidad character varying(20) NOT NULL,
    fecha_generacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado character varying(20) DEFAULT 'Pendiente'::character varying NOT NULL,
    descripcion text NOT NULL,
    CONSTRAINT chk_severidad CHECK (((severidad)::text = ANY ((ARRAY['Baja'::character varying, 'Media'::character varying, 'Alta'::character varying, 'Crítica'::character varying])::text[])))
);


ALTER TABLE public.alerta OWNER TO postgres;

--
-- Name: alerta_id_alerta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerta_id_alerta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerta_id_alerta_seq OWNER TO postgres;

--
-- Name: alerta_id_alerta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerta_id_alerta_seq OWNED BY public.alerta.id_alerta;


--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id_auditoria bigint NOT NULL,
    id_profesional integer NOT NULL,
    tabla_afectada character varying(50) NOT NULL,
    accion character varying(20) NOT NULL,
    id_registro integer NOT NULL,
    valor_anterior jsonb,
    valor_nuevo jsonb,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_origen character varying(45) NOT NULL,
    CONSTRAINT auditoria_accion_check CHECK (((accion)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying, 'READ'::character varying])::text[])))
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_id_auditoria_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNER TO postgres;

--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNED BY public.auditoria.id_auditoria;


--
-- Name: diagnostico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnostico (
    id_diagnostico integer NOT NULL,
    codigo_cie10 character varying(10) NOT NULL,
    nombre_diagnostico character varying(255) NOT NULL,
    categoria character varying(100) NOT NULL
);


ALTER TABLE public.diagnostico OWNER TO postgres;

--
-- Name: diagnostico_id_diagnostico_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diagnostico_id_diagnostico_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diagnostico_id_diagnostico_seq OWNER TO postgres;

--
-- Name: diagnostico_id_diagnostico_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diagnostico_id_diagnostico_seq OWNED BY public.diagnostico.id_diagnostico;


--
-- Name: diagnostico_paciente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnostico_paciente (
    id_ingreso integer NOT NULL,
    id_diagnostico integer NOT NULL,
    fecha_diagnostico timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_psiquiatra integer NOT NULL,
    tipo character varying(50) DEFAULT 'Principal'::character varying NOT NULL
);


ALTER TABLE public.diagnostico_paciente OWNER TO postgres;

--
-- Name: evidencia_clinica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evidencia_clinica (
    id_evidencia integer NOT NULL,
    id_ingreso integer NOT NULL,
    id_prescripcion integer,
    id_profesional integer NOT NULL,
    tipo_archivo character varying(20) NOT NULL,
    url_almacenamiento character varying(500) NOT NULL,
    nombre_original character varying(255) NOT NULL,
    descripcion text NOT NULL,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.evidencia_clinica OWNER TO postgres;

--
-- Name: evidencia_clinica_id_evidencia_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evidencia_clinica_id_evidencia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evidencia_clinica_id_evidencia_seq OWNER TO postgres;

--
-- Name: evidencia_clinica_id_evidencia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evidencia_clinica_id_evidencia_seq OWNED BY public.evidencia_clinica.id_evidencia;


--
-- Name: ingreso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingreso (
    id_ingreso integer NOT NULL,
    expediente character varying(20) NOT NULL,
    id_psiquiatra integer NOT NULL,
    fecha_ingreso timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_egreso timestamp without time zone,
    motivo_ingreso text NOT NULL,
    tipo_ingreso character varying(50) NOT NULL,
    area character varying(50) NOT NULL,
    cama character varying(20),
    tipo_egreso character varying(50)
);


ALTER TABLE public.ingreso OWNER TO postgres;

--
-- Name: ingreso_id_ingreso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingreso_id_ingreso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingreso_id_ingreso_seq OWNER TO postgres;

--
-- Name: ingreso_id_ingreso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingreso_id_ingreso_seq OWNED BY public.ingreso.id_ingreso;


--
-- Name: medicamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicamento (
    id_medicamento integer NOT NULL,
    nombre_generico character varying(150) NOT NULL,
    nombre_comercial character varying(150),
    grupo_farmacologico character varying(100) NOT NULL,
    presentacion character varying(100) NOT NULL,
    stock_actual integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.medicamento OWNER TO postgres;

--
-- Name: medicamento_id_medicamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicamento_id_medicamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicamento_id_medicamento_seq OWNER TO postgres;

--
-- Name: medicamento_id_medicamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicamento_id_medicamento_seq OWNED BY public.medicamento.id_medicamento;


--
-- Name: nota_clinica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_clinica (
    id_nota integer NOT NULL,
    id_ingreso integer NOT NULL,
    id_profesional integer NOT NULL,
    tipo_nota character varying(50) NOT NULL,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    contenido text NOT NULL,
    gravedad_evento character varying(20)
);


ALTER TABLE public.nota_clinica OWNER TO postgres;

--
-- Name: nota_clinica_id_nota_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_clinica_id_nota_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nota_clinica_id_nota_seq OWNER TO postgres;

--
-- Name: nota_clinica_id_nota_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_clinica_id_nota_seq OWNED BY public.nota_clinica.id_nota;


--
-- Name: paciente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paciente (
    expediente character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    fecha_nacimiento date NOT NULL,
    sexo character varying(10) NOT NULL,
    tipo_paciente character varying(50) NOT NULL,
    alergias text DEFAULT 'Ninguna'::text NOT NULL,
    antecedentes_familiares text DEFAULT 'Sin antecedentes'::text NOT NULL,
    antecedentes_personales text DEFAULT 'Sin antecedentes'::text NOT NULL,
    CONSTRAINT paciente_sexo_check CHECK (((sexo)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying, 'OTRO'::character varying])::text[])))
);


ALTER TABLE public.paciente OWNER TO postgres;

--
-- Name: prescripcion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescripcion (
    id_prescripcion integer NOT NULL,
    id_ingreso integer NOT NULL,
    id_medicamento integer NOT NULL,
    id_psiquiatra integer NOT NULL,
    dosis_cantidad numeric(10,2) NOT NULL,
    dosis_unidad character varying(20) NOT NULL,
    frecuencia_horas integer NOT NULL,
    via_administracion character varying(30) CONSTRAINT prescripcion_via_not_null NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    activo boolean DEFAULT true NOT NULL,
    justificacion_exceso text,
    autorizado_por integer,
    motivo_suspension text,
    CONSTRAINT prescripcion_dosis_cantidad_check CHECK ((dosis_cantidad > (0)::numeric)),
    CONSTRAINT prescripcion_frecuencia_horas_check CHECK ((frecuencia_horas > 0))
);


ALTER TABLE public.prescripcion OWNER TO postgres;

--
-- Name: prescripcion_id_prescripcion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescripcion_id_prescripcion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescripcion_id_prescripcion_seq OWNER TO postgres;

--
-- Name: prescripcion_id_prescripcion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescripcion_id_prescripcion_seq OWNED BY public.prescripcion.id_prescripcion;


--
-- Name: profesional_salud; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesional_salud (
    id_profesional integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    rut character varying(15),
    especialidad character varying(100),
    cedula_profesional character varying(50),
    rol character varying(30) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT profesional_salud_rol_check CHECK (((rol)::text = ANY ((ARRAY['PSIQUIATRA'::character varying, 'ENFERMERA'::character varying, 'PSICOLOGO'::character varying, 'AUDITOR'::character varying, 'ADMIN'::character varying])::text[])))
);


ALTER TABLE public.profesional_salud OWNER TO postgres;

--
-- Name: profesional_salud_id_profesional_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesional_salud_id_profesional_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesional_salud_id_profesional_seq OWNER TO postgres;

--
-- Name: profesional_salud_id_profesional_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesional_salud_id_profesional_seq OWNED BY public.profesional_salud.id_profesional;


--
-- Name: psiquiatra_tratante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.psiquiatra_tratante (
    id_psiquiatra integer NOT NULL,
    id_profesional integer NOT NULL,
    numero_colegiado character varying(50) NOT NULL,
    subespecialidad character varying(100),
    anios_experiencia integer,
    es_jefe_servicio boolean DEFAULT false NOT NULL
);


ALTER TABLE public.psiquiatra_tratante OWNER TO postgres;

--
-- Name: psiquiatra_tratante_id_psiquiatra_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.psiquiatra_tratante_id_psiquiatra_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.psiquiatra_tratante_id_psiquiatra_seq OWNER TO postgres;

--
-- Name: psiquiatra_tratante_id_psiquiatra_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.psiquiatra_tratante_id_psiquiatra_seq OWNED BY public.psiquiatra_tratante.id_psiquiatra;


--
-- Name: tutor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutor (
    id_tutor integer NOT NULL,
    expediente character varying(20) NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    parentesco character varying(50) NOT NULL,
    telefono character varying(30),
    correo character varying(100),
    direccion text,
    es_principal boolean DEFAULT false NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date
);


ALTER TABLE public.tutor OWNER TO postgres;

--
-- Name: tutor_id_tutor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tutor_id_tutor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tutor_id_tutor_seq OWNER TO postgres;

--
-- Name: tutor_id_tutor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tutor_id_tutor_seq OWNED BY public.tutor.id_tutor;


--
-- Name: administracion id_administracion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administracion ALTER COLUMN id_administracion SET DEFAULT nextval('public.administracion_id_administracion_seq'::regclass);


--
-- Name: alerta id_alerta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta ALTER COLUMN id_alerta SET DEFAULT nextval('public.alerta_id_alerta_seq'::regclass);


--
-- Name: auditoria id_auditoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id_auditoria SET DEFAULT nextval('public.auditoria_id_auditoria_seq'::regclass);


--
-- Name: diagnostico id_diagnostico; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico ALTER COLUMN id_diagnostico SET DEFAULT nextval('public.diagnostico_id_diagnostico_seq'::regclass);


--
-- Name: evidencia_clinica id_evidencia; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencia_clinica ALTER COLUMN id_evidencia SET DEFAULT nextval('public.evidencia_clinica_id_evidencia_seq'::regclass);


--
-- Name: ingreso id_ingreso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingreso ALTER COLUMN id_ingreso SET DEFAULT nextval('public.ingreso_id_ingreso_seq'::regclass);


--
-- Name: medicamento id_medicamento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamento ALTER COLUMN id_medicamento SET DEFAULT nextval('public.medicamento_id_medicamento_seq'::regclass);


--
-- Name: nota_clinica id_nota; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_clinica ALTER COLUMN id_nota SET DEFAULT nextval('public.nota_clinica_id_nota_seq'::regclass);


--
-- Name: prescripcion id_prescripcion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescripcion ALTER COLUMN id_prescripcion SET DEFAULT nextval('public.prescripcion_id_prescripcion_seq'::regclass);


--
-- Name: profesional_salud id_profesional; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesional_salud ALTER COLUMN id_profesional SET DEFAULT nextval('public.profesional_salud_id_profesional_seq'::regclass);


--
-- Name: psiquiatra_tratante id_psiquiatra; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.psiquiatra_tratante ALTER COLUMN id_psiquiatra SET DEFAULT nextval('public.psiquiatra_tratante_id_psiquiatra_seq'::regclass);


--
-- Name: tutor id_tutor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor ALTER COLUMN id_tutor SET DEFAULT nextval('public.tutor_id_tutor_seq'::regclass);


--
-- Data for Name: administracion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administracion (id_administracion, id_prescripcion, id_profesional, fecha_hora, dosis_aplicada, observaciones, notas_enfermeria) FROM stdin;
1	1	4	2026-01-10 20:00:00	50.00	Sin novedad	\N
2	1	5	2026-01-11 08:00:00	50.00	Sin novedad	\N
3	2	4	2026-01-10 22:00:00	2.00	Paciente somnoliento	\N
4	3	6	2026-02-06 08:00:00	20.00	Sin novedad	\N
5	4	4	2026-02-21 09:00:00	300.00	Sin novedad	\N
6	5	5	2026-02-21 21:00:00	10.00	Leve temblor	\N
7	6	18	2026-03-13 07:00:00	1.00	Sin novedad	\N
8	7	19	2026-03-25 21:00:00	2.00	Sin novedad	\N
9	8	20	2026-04-06 08:00:00	10.00	Sin novedad	\N
10	10	18	2026-05-03 09:00:00	300.00	Sin novedad	\N
\.


--
-- Data for Name: alerta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerta (id_alerta, expediente, id_ingreso, id_prescripcion, revisado_por, tipo_alerta, severidad, fecha_generacion, estado, descripcion) FROM stdin;
1	EXP-0003	3	5	1	Reacción Adversa	Media	2026-02-25 14:00:00	Revisada	Paciente presentó temblor tras administración de Olanzapina.
2	EXP-0001	1	1	1	Interacción	Baja	2026-01-11 08:00:00	Descartada	Interacción leve entre Sertralina y Clonazepam.
3	EXP-0005	5	7	1	Exceso Medicamentos	Alta	2026-03-26 10:00:00	Revisada	Paciente con más de 2 psicofármacos activos simultáneamente.
4	EXP-0008	8	10	1	Exceso Medicamentos	Crítica	2026-05-03 11:00:00	Pendiente	Paciente con 3 psicofármacos activos sin justificación registrada.
5	EXP-0002	2	3	1	Reacción Adversa	Media	2026-02-08 16:00:00	Revisada	Paciente presentó náuseas tras Fluoxetina.
6	EXP-0004	4	6	\N	Interacción	Baja	2026-03-13 09:00:00	Pendiente	Interacción entre Lorazepam y consumo de cafeína.
7	EXP-0006	6	8	\N	Reacción Adversa	Media	2026-04-07 10:00:00	Pendiente	Menor presentó insomnio tras Metilfenidato.
8	EXP-0007	7	9	1	Interacción	Baja	2026-04-20 11:00:00	Descartada	Interacción leve con alimentos.
9	EXP-0009	9	\N	\N	Exceso Medicamentos	Media	2026-05-20 09:00:00	Pendiente	Paciente con historial de cambios frecuentes de medicación.
10	EXP-0010	10	\N	\N	Exceso Medicamentos	Alta	2026-06-02 10:00:00	Pendiente	Menor con más de 2 psicofármacos activos.
\.


--
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria (id_auditoria, id_profesional, tabla_afectada, accion, id_registro, valor_anterior, valor_nuevo, fecha_hora, ip_origen) FROM stdin;
1	1	prescripcion	INSERT	1	\N	{"activo": true, "dosis_cantidad": 50}	2026-01-10 10:30:00	192.168.1.10
2	1	prescripcion	UPDATE	1	{"dosis_cantidad": 25}	{"dosis_cantidad": 50}	2026-01-11 09:00:00	192.168.1.10
3	3	prescripcion	INSERT	5	\N	{"dosis_cantidad": 10, "justificacion_exceso": "Reacción adversa leve"}	2026-02-20 11:30:00	192.168.1.15
4	4	administracion	INSERT	1	\N	{"dosis_aplicada": 50}	2026-01-10 20:00:00	192.168.1.20
5	5	administracion	INSERT	2	\N	{"dosis_aplicada": 50}	2026-01-11 08:00:00	192.168.1.21
6	2	prescripcion	UPDATE	3	{"activo": true}	{"activo": false}	2026-02-15 16:00:00	192.168.1.11
7	8	prescripcion	INSERT	10	\N	{"activo": true, "dosis_cantidad": 300}	2026-05-02 13:30:00	192.168.1.18
8	1	alerta	UPDATE	1	{"estado": "Pendiente"}	{"estado": "Revisada"}	2026-02-25 15:00:00	192.168.1.10
9	9	paciente	UPDATE	5	{"telefono": "3311111111"}	{"telefono": "3356789012"}	2026-03-01 10:00:00	192.168.1.25
10	10	auditoria	READ	1	\N	\N	2026-06-01 16:00:00	192.168.1.30
11	10	paciente	READ	0	\N	{"filas": 10, "alcance": "tabla completa (id_registro=0)", "archivo": "pacientes_20261113_181443.csv", "operacion": "exportar_csv"}	2026-11-13 18:14:43.953896	127.0.0.1
\.


--
-- Data for Name: diagnostico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diagnostico (id_diagnostico, codigo_cie10, nombre_diagnostico, categoria) FROM stdin;
1	F32.0	Episodio depresivo leve	Trastornos del estado de ánimo
2	F32.1	Episodio depresivo moderado	Trastornos del estado de ánimo
3	F33.0	Trastorno depresivo recurrente	Trastornos del estado de ánimo
4	F20.0	Esquizofrenia paranoide	Trastornos psicóticos
5	F20.9	Esquizofrenia no especificada	Trastornos psicóticos
6	F31.0	Trastorno bipolar, episodio maníaco	Trastornos del estado de ánimo
7	F41.0	Trastorno de pánico	Trastornos de ansiedad
8	F41.1	Trastorno de ansiedad generalizada	Trastornos de ansiedad
9	F43.1	Trastorno de estrés postraumático	Trastornos relacionados con trauma
10	F90.0	Trastorno por déficit de atención	Trastornos del neurodesarrollo
\.


--
-- Data for Name: diagnostico_paciente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diagnostico_paciente (id_ingreso, id_diagnostico, fecha_diagnostico, id_psiquiatra, tipo) FROM stdin;
1	1	2026-01-10 10:00:00	1	Principal
1	8	2026-01-10 10:00:00	1	Secundario
2	2	2026-02-05 16:00:00	2	Principal
3	6	2026-02-20 11:00:00	3	Principal
4	7	2026-03-12 17:30:00	4	Principal
5	4	2026-03-25 09:00:00	5	Principal
6	10	2026-04-05 12:00:00	6	Principal
7	9	2026-04-18 15:00:00	7	Principal
8	6	2026-05-02 13:00:00	8	Principal
9	1	2026-05-15 10:00:00	9	Principal
\.


--
-- Data for Name: evidencia_clinica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evidencia_clinica (id_evidencia, id_ingreso, id_prescripcion, id_profesional, tipo_archivo, url_almacenamiento, nombre_original, descripcion, fecha_subida) FROM stdin;
1	3	5	3	IMAGEN	s3://hospital/evidencias/ev001.jpg	temblor_paciente.jpg	Registro fotográfico del temblor tras Olanzapina.	2026-02-25 14:30:00
2	5	7	5	PDF	s3://hospital/evidencias/ev002.pdf	analisis_laboratorio.pdf	Análisis de laboratorio con niveles elevados de prolactina.	2026-03-28 10:00:00
3	2	3	2	IMAGEN	s3://hospital/evidencias/ev003.jpg	erupcion_cutanea.jpg	Erupción cutánea tras Fluoxetina.	2026-02-09 09:00:00
4	8	10	8	PDF	s3://hospital/evidencias/ev004.pdf	justificacion_medica.pdf	Justificación médica por exceso de medicamentos.	2026-05-03 11:30:00
5	6	8	6	IMAGEN	s3://hospital/evidencias/ev005.jpg	insomnio_registro.jpg	Registro de episodios de insomnio del menor.	2026-04-08 08:00:00
6	4	6	4	PDF	s3://hospital/evidencias/ev006.pdf	consentimiento.pdf	Consentimiento informado firmado por tutor.	2026-03-12 18:00:00
7	7	9	7	IMAGEN	s3://hospital/evidencias/ev007.jpg	evolucion_paciente.jpg	Fotografía de evolución del paciente.	2026-04-22 10:00:00
8	9	\N	9	PDF	s3://hospital/evidencias/ev008.pdf	historial_medico.pdf	Historial médico completo del paciente.	2026-05-16 11:00:00
9	10	\N	10	PDF	s3://hospital/evidencias/ev009.pdf	evaluacion_inicial.pdf	Evaluación inicial del menor.	2026-06-02 12:00:00
10	1	1	1	IMAGEN	s3://hospital/evidencias/ev010.jpg	estado_inicial.jpg	Fotografía del estado inicial del paciente.	2026-01-10 11:00:00
\.


--
-- Data for Name: ingreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingreso (id_ingreso, expediente, id_psiquiatra, fecha_ingreso, fecha_egreso, motivo_ingreso, tipo_ingreso, area, cama, tipo_egreso) FROM stdin;
1	EXP-0001	1	2026-01-10 08:30:00	2026-01-20 12:00:00	Episodio depresivo severo	Voluntario	Hospitalización	H-101	Alta médica
2	EXP-0002	2	2026-02-05 14:15:00	2026-02-15 10:30:00	Intento suicida	Involuntario	Urgencias	U-201	Alta médica
3	EXP-0003	3	2026-02-20 09:00:00	2026-03-05 11:00:00	Episodio maníaco	Involuntario	Hospitalización	H-102	Alta médica
4	EXP-0004	4	2026-03-12 16:45:00	\N	Crisis de pánico	Voluntario	Hospitalización	H-103	\N
5	EXP-0005	5	2026-03-25 07:00:00	2026-04-10 15:00:00	Descompensación psicótica	Involuntario	Hospitalización	H-104	Alta médica
6	EXP-0006	6	2026-04-05 10:20:00	2026-04-12 09:00:00	Desregulación conductual	Voluntario	Pediátrica	P-101	Alta médica
7	EXP-0007	7	2026-04-18 13:40:00	2026-04-28 14:00:00	Depresión postraumática	Voluntario	Hospitalización	H-105	Alta médica
8	EXP-0008	8	2026-05-02 11:30:00	\N	Recaída bipolar	Voluntario	Hospitalización	H-106	\N
9	EXP-0009	9	2026-05-15 08:00:00	2026-05-30 10:00:00	Depresión mayor	Voluntario	Hospitalización	H-107	Alta médica
10	EXP-0010	10	2026-06-01 15:20:00	\N	Ansiedad severa	Voluntario	Pediátrica	P-102	\N
\.


--
-- Data for Name: medicamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicamento (id_medicamento, nombre_generico, nombre_comercial, grupo_farmacologico, presentacion, stock_actual) FROM stdin;
1	Sertralina	Zoloft	Antidepresivo	Tableta 50mg	120
2	Fluoxetina	Prozac	Antidepresivo	Cápsula 20mg	95
3	Risperidona	Risperdal	Antipsicótico	Tableta 2mg	80
4	Olanzapina	Zyprexa	Antipsicótico	Tableta 10mg	75
5	Quetiapina	Seroquel	Antipsicótico	Tableta 100mg	60
6	Clonazepam	Rivotril	Ansiolítico	Tableta 2mg	150
7	Lorazepam	Ativan	Ansiolítico	Tableta 1mg	130
8	Litio	Carbolithium	Estabilizador del ánimo	Cápsula 300mg	90
9	Valproato	Depakene	Estabilizador del ánimo	Tableta 500mg	70
10	Metilfenidato	Ritalin	Estimulante	Tableta 10mg	40
11	Diazepam	Valium	Ansiolítico	Tableta 5mg	100
12	Fluor	Fluoerexetina	Florentina	10mg	20
13	Fluor	Fluoerexetina	Florentina	10mg	20
\.


--
-- Data for Name: nota_clinica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_clinica (id_nota, id_ingreso, id_profesional, tipo_nota, fecha_hora, contenido, gravedad_evento) FROM stdin;
1	1	1	Ingreso	2026-01-10 09:00:00	Paciente ingresa con episodio depresivo severo, refiere ideación suicida pasiva.	Grave
2	1	1	Evolución	2026-01-15 10:00:00	Paciente evoluciona favorablemente, disminución de sintomatología depresiva.	Leve
3	2	2	Ingreso	2026-02-05 15:00:00	Ingresa por intento suicida, se activa protocolo de seguridad.	Grave
4	3	3	Ingreso	2026-02-20 10:00:00	Paciente con episodio maníaco, agitación psicomotriz.	Grave
5	3	3	Evolución	2026-02-28 11:00:00	Estabilización del ánimo, sin episodios de agitación.	Leve
6	4	4	Ingreso	2026-03-12 17:00:00	Paciente con crisis de pánico recurrente.	Moderado
7	5	5	Ingreso	2026-03-25 08:30:00	Descompensación psicótica, alucinaciones auditivas.	Grave
8	6	6	Ingreso	2026-04-05 11:00:00	Menor con desregulación conductual, agresividad verbal.	Moderado
9	8	8	Ingreso	2026-05-02 12:00:00	Recaída bipolar con episodio mixto.	Grave
10	9	9	Ingreso	2026-05-15 09:00:00	Depresión mayor recurrente, sin ideación suicida actual.	Moderado
\.


--
-- Data for Name: paciente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paciente (expediente, nombre, fecha_nacimiento, sexo, tipo_paciente, alergias, antecedentes_familiares, antecedentes_personales) FROM stdin;
EXP-0001	Juan Pérez López	1985-03-15	M	Adulto	Penicilina	Madre con depresión	Episodio depresivo previo
EXP-0002	María López Ruiz	1992-07-22	F	Adulto	Ninguna	Padre con esquizofrenia	Sin antecedentes
EXP-0003	Carlos Ramírez Soto	1978-11-30	M	Adulto	Ninguna	Sin antecedentes	Trastorno bipolar previo
EXP-0004	Ana Morales Vega	2000-05-10	F	Adulto	Látex	Madre con ansiedad	Trastorno de pánico
EXP-0005	Luis Castillo Díaz	1965-09-08	M	Adulto	Ninguna	Sin antecedentes	Esquizofrenia crónica
EXP-0006	Paula González Luna	2010-02-14	F	Infantil	Ninguna	Padre con TDAH	TDAH diagnosticado
EXP-0007	Roberto Flores Cano	1995-12-01	M	Adulto	Mariscos	Sin antecedentes	Sin antecedentes
EXP-0008	Sofía Hernández Paz	1988-06-20	F	Adulto	Ninguna	Madre con bipolaridad	Trastorno bipolar
EXP-0009	Diego Benítez Mora	1972-04-25	M	Adulto	Ninguna	Sin antecedentes	Depresión mayor
EXP-0010	Verónica Suárez Peña	2005-08-18	F	Infantil	Ninguna	Madre con ansiedad	Trastorno de ansiedad
\.


--
-- Data for Name: prescripcion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescripcion (id_prescripcion, id_ingreso, id_medicamento, id_psiquiatra, dosis_cantidad, dosis_unidad, frecuencia_horas, via_administracion, fecha_inicio, fecha_fin, activo, justificacion_exceso, autorizado_por, motivo_suspension) FROM stdin;
1	1	1	1	50.00	mg	24	Oral	2026-01-10	2026-01-20	f	\N	\N	\N
2	1	6	1	2.00	mg	12	Oral	2026-01-10	2026-01-18	f	\N	\N	\N
3	2	2	2	20.00	mg	24	Oral	2026-02-05	2026-02-15	f	\N	\N	\N
4	3	8	3	300.00	mg	12	Oral	2026-02-20	2026-03-05	f	\N	\N	\N
5	3	4	3	10.00	mg	24	Oral	2026-02-20	2026-03-01	f	Reacción adversa leve	1	Cambio por efectos secundarios
6	4	7	4	1.00	mg	8	Oral	2026-03-12	\N	t	\N	\N	\N
7	5	3	5	2.00	mg	12	Oral	2026-03-25	2026-04-10	f	\N	\N	\N
8	6	10	6	10.00	mg	24	Oral	2026-04-05	2026-04-12	f	\N	\N	\N
9	7	1	7	50.00	mg	24	Oral	2026-04-18	2026-04-28	f	\N	\N	\N
10	8	8	8	300.00	mg	12	Oral	2026-05-02	\N	t	\N	\N	\N
12	1	1	1	50.00	mg	24	Oral	2026-11-06	\N	t	\N	\N	\N
13	1	1	1	50.00	mg	24	Oral	2026-11-06	\N	t	\N	\N	\N
14	1	2	1	20.00	mg	12	Oral	2026-11-06	\N	t	El paciente no responde al tratamiento actual, se requiere un tercer fármaco para estabilizarlo.	1	\N
15	1	1	1	50.00	mg	24	Oral	2026-11-06	\N	t	Justificación de prueba desde el frontend	1	\N
16	1	1	1	50.00	mg	24	Oral	2026-11-06	\N	t	Justificación de prueba desde el frontend	1	\N
17	6	2	1	50.00	mg	24	Oral	2026-11-07	\N	t	\N	\N	\N
18	7	1	1	100.00	mg	24	Oral	2026-11-07	\N	t	\N	\N	\N
19	7	3	1	90.00	mg	24	Oral	2026-11-07	\N	t	\N	\N	\N
\.


--
-- Data for Name: profesional_salud; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesional_salud (id_profesional, username, password_hash, nombre_completo, rut, especialidad, cedula_profesional, rol, activo) FROM stdin;
1	jperez	$2b$12$abc123	Juan Pérez López	12345678-9	Psiquiatría	PSI-1001	PSIQUIATRA	t
2	mlopez	$2b$12$def456	María López Ruiz	23456789-0	Psiquiatría	PSI-1002	PSIQUIATRA	t
3	cramirez	$2b$12$ghi789	Carlos Ramírez Soto	34567890-1	Psiquiatría	PSI-1003	PSIQUIATRA	t
4	amorales	$2b$12$jkl012	Ana Morales Vega	45678901-2	Enfermería	ENF-2001	ENFERMERA	t
5	lcastillo	$2b$12$mno345	Luis Castillo Díaz	56789012-3	Enfermería	ENF-2002	ENFERMERA	t
6	pgonzalez	$2b$12$pqr678	Paula González Luna	67890123-4	Enfermería	ENF-2003	ENFERMERA	t
7	rflores	$2b$12$stu901	Roberto Flores Cano	78901234-5	Psicología	PSI-3001	PSICOLOGO	t
8	shernandez	$2b$12$vwx234	Sofía Hernández Paz	89012345-6	Psicología	PSI-3002	PSICOLOGO	t
9	dbenitez	$2b$12$yza567	Diego Benítez Mora	90123456-7	Auditoría	AUD-4001	AUDITOR	t
10	vsuarez	$2b$12$bcd890	Verónica Suárez Peña	01234567-8	Administración	ADM-5001	ADMIN	t
11	fmedina	$2b$12$efg123	Fernando Medina Ríos	11111111-1	Psiquiatría	PSI-1004	PSIQUIATRA	t
12	gortega	$2b$12$hij456	Gabriela Ortega Lima	22222222-2	Psiquiatría	PSI-1005	PSIQUIATRA	t
13	hnunez	$2b$12$klm789	Héctor Núñez Castro	33333333-3	Psiquiatría	PSI-1006	PSIQUIATRA	t
14	ivargas	$2b$12$nop012	Irene Vargas Mena	44444444-4	Psiquiatría	PSI-1007	PSIQUIATRA	t
15	jcabrera	$2b$12$qrs345	Jorge Cabrera Ponce	55555555-5	Psiquiatría	PSI-1008	PSIQUIATRA	t
16	krojas	$2b$12$tuv678	Karla Rojas Fuentes	66666666-6	Psiquiatría	PSI-1009	PSIQUIATRA	t
17	lmoreno	$2b$12$wxy901	Laura Moreno Silva	77777777-7	Psiquiatría	PSI-1010	PSIQUIATRA	t
18	mcortes	$2b$12$zab234	Miguel Cortés Peña	88888888-8	Enfermería	ENF-2004	ENFERMERA	t
19	nsalinas	$2b$12$cde567	Natalia Salinas Vega	99999999-9	Enfermería	ENF-2005	ENFERMERA	t
20	orivera	$2b$12$fgh890	Oscar Rivera Lozano	10101010-0	Enfermería	ENF-2006	ENFERMERA	t
21  pmadrigal $2$12$ijk123	Pedro Madrigal Pena	12121212-1	Auditoría	AUD-4002	AUDITOR	t
\.


--
-- Data for Name: psiquiatra_tratante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.psiquiatra_tratante (id_psiquiatra, id_profesional, numero_colegiado, subespecialidad, anios_experiencia, es_jefe_servicio) FROM stdin;
1	1	COL-5001	Psiquiatría general	15	t
2	2	COL-5002	Psiquiatría infantil	10	f
3	3	COL-5003	Adicciones	8	f
4	11	COL-5004	Psiquiatría forense	12	f
5	12	COL-5005	Psiquiatría general	6	f
6	13	COL-5006	Psiquiatría infantil	9	f
7	14	COL-5007	Adicciones	7	f
8	15	COL-5008	Psiquiatría general	20	t
9	16	COL-5009	Psiquiatría forense	14	f
10	17	COL-5010	Psiquiatría general	5	f
\.


--
-- Data for Name: tutor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tutor (id_tutor, expediente, nombre_completo, parentesco, telefono, correo, direccion, es_principal, activo, fecha_inicio, fecha_fin) FROM stdin;
1	EXP-0001	Rosa López Martínez	Madre	3312345678	rosa.lopez@mail.com	Av. Juárez 123, Guadalajara	t	t	2023-01-15	\N
2	EXP-0002	Pedro López Ruiz	Padre	3323456789	pedro.lopez@mail.com	Calle Hidalgo 456, Zapopan	t	t	2023-02-20	\N
3	EXP-0003	Lucía Soto Ramírez	Esposa	3334567890	lucia.soto@mail.com	Av. Vallarta 789, Guadalajara	t	t	2022-11-10	\N
4	EXP-0004	Marta Vega Díaz	Madre	3345678901	marta.vega@mail.com	Calle Morelos 321, Tlaquepaque	t	t	2023-03-05	\N
5	EXP-0005	Jorge Castillo Ruiz	Hermano	3356789012	jorge.castillo@mail.com	Av. Chapultepec 654, Guadalajara	t	t	2021-08-12	\N
6	EXP-0006	Elena Luna Pérez	Madre	3367890123	elena.luna@mail.com	Calle Colón 987, Zapopan	t	t	2023-04-18	\N
7	EXP-0007	Andrés Flores Cano	Padre	3378901234	andres.flores@mail.com	Av. Patria 159, Zapopan	t	t	2023-05-22	\N
8	EXP-0008	Patricia Paz Ruiz	Madre	3389012345	patricia.paz@mail.com	Calle Reforma 753, Guadalajara	t	t	2022-09-14	\N
9	EXP-0009	Sandra Mora Luna	Esposa	3390123456	sandra.mora@mail.com	Av. Américas 852, Guadalajara	t	t	2023-06-08	\N
10	EXP-0010	Raúl Suárez Pérez	Padre	3301234567	raul.suarez@mail.com	Calle Independencia 147, Tonalá	t	t	2023-07-25	\N
\.


--
-- Name: administracion_id_administracion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administracion_id_administracion_seq', 10, true);


--
-- Name: alerta_id_alerta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerta_id_alerta_seq', 10, true);


--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_id_auditoria_seq', 11, true);


--
-- Name: diagnostico_id_diagnostico_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diagnostico_id_diagnostico_seq', 10, true);


--
-- Name: evidencia_clinica_id_evidencia_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evidencia_clinica_id_evidencia_seq', 10, true);


--
-- Name: ingreso_id_ingreso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingreso_id_ingreso_seq', 10, true);


--
-- Name: medicamento_id_medicamento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicamento_id_medicamento_seq', 13, true);


--
-- Name: nota_clinica_id_nota_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_clinica_id_nota_seq', 10, true);


--
-- Name: prescripcion_id_prescripcion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescripcion_id_prescripcion_seq', 24, true);


--
-- Name: profesional_salud_id_profesional_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesional_salud_id_profesional_seq', 20, true);


--
-- Name: psiquiatra_tratante_id_psiquiatra_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.psiquiatra_tratante_id_psiquiatra_seq', 10, true);


--
-- Name: tutor_id_tutor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tutor_id_tutor_seq', 10, true);


--
-- Name: administracion administracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administracion
    ADD CONSTRAINT administracion_pkey PRIMARY KEY (id_administracion);


--
-- Name: alerta alerta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_pkey PRIMARY KEY (id_alerta);


--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria);


--
-- Name: diagnostico diagnostico_codigo_cie10_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico
    ADD CONSTRAINT diagnostico_codigo_cie10_key UNIQUE (codigo_cie10);


--
-- Name: diagnostico_paciente diagnostico_paciente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_paciente
    ADD CONSTRAINT diagnostico_paciente_pkey PRIMARY KEY (id_ingreso, id_diagnostico);


--
-- Name: diagnostico diagnostico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico
    ADD CONSTRAINT diagnostico_pkey PRIMARY KEY (id_diagnostico);


--
-- Name: evidencia_clinica evidencia_clinica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencia_clinica
    ADD CONSTRAINT evidencia_clinica_pkey PRIMARY KEY (id_evidencia);


--
-- Name: ingreso ingreso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingreso
    ADD CONSTRAINT ingreso_pkey PRIMARY KEY (id_ingreso);


--
-- Name: medicamento medicamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamento
    ADD CONSTRAINT medicamento_pkey PRIMARY KEY (id_medicamento);


--
-- Name: nota_clinica nota_clinica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_clinica
    ADD CONSTRAINT nota_clinica_pkey PRIMARY KEY (id_nota);


--
-- Name: paciente paciente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente
    ADD CONSTRAINT paciente_pkey PRIMARY KEY (expediente);


--
-- Name: prescripcion prescripcion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescripcion
    ADD CONSTRAINT prescripcion_pkey PRIMARY KEY (id_prescripcion);


--
-- Name: profesional_salud profesional_salud_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesional_salud
    ADD CONSTRAINT profesional_salud_pkey PRIMARY KEY (id_profesional);


--
-- Name: profesional_salud profesional_salud_rut_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesional_salud
    ADD CONSTRAINT profesional_salud_rut_key UNIQUE (rut);


--
-- Name: profesional_salud profesional_salud_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesional_salud
    ADD CONSTRAINT profesional_salud_username_key UNIQUE (username);


--
-- Name: psiquiatra_tratante psiquiatra_tratante_id_profesional_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.psiquiatra_tratante
    ADD CONSTRAINT psiquiatra_tratante_id_profesional_key UNIQUE (id_profesional);


--
-- Name: psiquiatra_tratante psiquiatra_tratante_numero_colegiado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.psiquiatra_tratante
    ADD CONSTRAINT psiquiatra_tratante_numero_colegiado_key UNIQUE (numero_colegiado);


--
-- Name: psiquiatra_tratante psiquiatra_tratante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.psiquiatra_tratante
    ADD CONSTRAINT psiquiatra_tratante_pkey PRIMARY KEY (id_psiquiatra);


--
-- Name: tutor tutor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor
    ADD CONSTRAINT tutor_pkey PRIMARY KEY (id_tutor);


--
-- Name: administracion administracion_id_prescripcion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administracion
    ADD CONSTRAINT administracion_id_prescripcion_fkey FOREIGN KEY (id_prescripcion) REFERENCES public.prescripcion(id_prescripcion);


--
-- Name: administracion administracion_id_profesional_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administracion
    ADD CONSTRAINT administracion_id_profesional_fkey FOREIGN KEY (id_profesional) REFERENCES public.profesional_salud(id_profesional);


--
-- Name: alerta alerta_expediente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_expediente_fkey FOREIGN KEY (expediente) REFERENCES public.paciente(expediente);


--
-- Name: alerta alerta_id_ingreso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_id_ingreso_fkey FOREIGN KEY (id_ingreso) REFERENCES public.ingreso(id_ingreso);


--
-- Name: alerta alerta_id_prescripcion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_id_prescripcion_fkey FOREIGN KEY (id_prescripcion) REFERENCES public.prescripcion(id_prescripcion);


--
-- Name: alerta alerta_revisado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_revisado_por_fkey FOREIGN KEY (revisado_por) REFERENCES public.profesional_salud(id_profesional);


--
-- Name: auditoria auditoria_id_profesional_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_id_profesional_fkey FOREIGN KEY (id_profesional) REFERENCES public.profesional_salud(id_profesional);


--
-- Name: diagnostico_paciente diagnostico_paciente_id_diagnostico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_paciente
    ADD CONSTRAINT diagnostico_paciente_id_diagnostico_fkey FOREIGN KEY (id_diagnostico) REFERENCES public.diagnostico(id_diagnostico);


--
-- Name: diagnostico_paciente diagnostico_paciente_id_ingreso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_paciente
    ADD CONSTRAINT diagnostico_paciente_id_ingreso_fkey FOREIGN KEY (id_ingreso) REFERENCES public.ingreso(id_ingreso);


--
-- Name: diagnostico_paciente diagnostico_paciente_id_psiquiatra_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_paciente
    ADD CONSTRAINT diagnostico_paciente_id_psiquiatra_fkey FOREIGN KEY (id_psiquiatra) REFERENCES public.psiquiatra_tratante(id_psiquiatra);


--
-- Name: evidencia_clinica evidencia_clinica_id_ingreso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencia_clinica
    ADD CONSTRAINT evidencia_clinica_id_ingreso_fkey FOREIGN KEY (id_ingreso) REFERENCES public.ingreso(id_ingreso);


--
-- Name: evidencia_clinica evidencia_clinica_id_prescripcion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencia_clinica
    ADD CONSTRAINT evidencia_clinica_id_prescripcion_fkey FOREIGN KEY (id_prescripcion) REFERENCES public.prescripcion(id_prescripcion);


--
-- Name: evidencia_clinica evidencia_clinica_id_profesional_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencia_clinica
    ADD CONSTRAINT evidencia_clinica_id_profesional_fkey FOREIGN KEY (id_profesional) REFERENCES public.profesional_salud(id_profesional);


--
-- Name: ingreso ingreso_expediente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingreso
    ADD CONSTRAINT ingreso_expediente_fkey FOREIGN KEY (expediente) REFERENCES public.paciente(expediente);


--
-- Name: ingreso ingreso_id_psiquiatra_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingreso
    ADD CONSTRAINT ingreso_id_psiquiatra_fkey FOREIGN KEY (id_psiquiatra) REFERENCES public.psiquiatra_tratante(id_psiquiatra);


--
-- Name: nota_clinica nota_clinica_id_ingreso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_clinica
    ADD CONSTRAINT nota_clinica_id_ingreso_fkey FOREIGN KEY (id_ingreso) REFERENCES public.ingreso(id_ingreso);


--
-- Name: nota_clinica nota_clinica_id_profesional_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_clinica
    ADD CONSTRAINT nota_clinica_id_profesional_fkey FOREIGN KEY (id_profesional) REFERENCES public.profesional_salud(id_profesional);


--
-- Name: prescripcion prescripcion_autorizado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescripcion
    ADD CONSTRAINT prescripcion_autorizado_por_fkey FOREIGN KEY (autorizado_por) REFERENCES public.psiquiatra_tratante(id_psiquiatra);


--
-- Name: prescripcion prescripcion_id_ingreso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescripcion
    ADD CONSTRAINT prescripcion_id_ingreso_fkey FOREIGN KEY (id_ingreso) REFERENCES public.ingreso(id_ingreso);


--
-- Name: prescripcion prescripcion_id_medicamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescripcion
    ADD CONSTRAINT prescripcion_id_medicamento_fkey FOREIGN KEY (id_medicamento) REFERENCES public.medicamento(id_medicamento);


--
-- Name: prescripcion prescripcion_id_psiquiatra_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescripcion
    ADD CONSTRAINT prescripcion_id_psiquiatra_fkey FOREIGN KEY (id_psiquiatra) REFERENCES public.psiquiatra_tratante(id_psiquiatra);


--
-- Name: psiquiatra_tratante psiquiatra_tratante_id_profesional_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.psiquiatra_tratante
    ADD CONSTRAINT psiquiatra_tratante_id_profesional_fkey FOREIGN KEY (id_profesional) REFERENCES public.profesional_salud(id_profesional);


--
-- Name: tutor tutor_expediente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutor
    ADD CONSTRAINT tutor_expediente_fkey FOREIGN KEY (expediente) REFERENCES public.paciente(expediente);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO rol_medicos;
GRANT USAGE ON SCHEMA public TO rol_psicosocial;
GRANT USAGE ON SCHEMA public TO rol_administrativos;
GRANT USAGE ON SCHEMA public TO rol_enfermeria;
GRANT USAGE ON SCHEMA public TO rol_farmacia;
GRANT USAGE ON SCHEMA public TO rol_auditoria;
GRANT USAGE ON SCHEMA public TO u_pasante;
GRANT USAGE ON SCHEMA public TO u_soporte_it;


--
-- Name: TABLE administracion; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.administracion TO rol_medicos;
GRANT SELECT,INSERT ON TABLE public.administracion TO rol_enfermeria;
GRANT SELECT ON TABLE public.administracion TO rol_auditoria;


--
-- Name: SEQUENCE administracion_id_administracion_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT USAGE ON SEQUENCE public.administracion_id_administracion_seq TO rol_enfermeria;


--
-- Name: TABLE alerta; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,UPDATE ON TABLE public.alerta TO rol_medicos;
GRANT SELECT ON TABLE public.alerta TO rol_enfermeria;
GRANT SELECT ON TABLE public.alerta TO rol_auditoria;


--
-- Name: TABLE auditoria; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.auditoria TO rol_auditoria;
GRANT SELECT ON TABLE public.auditoria TO u_admin;


--
-- Name: TABLE diagnostico; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.diagnostico TO rol_medicos;
GRANT SELECT ON TABLE public.diagnostico TO rol_psicosocial;
GRANT SELECT ON TABLE public.diagnostico TO rol_enfermeria;
GRANT SELECT ON TABLE public.diagnostico TO u_pasante;


--
-- Name: TABLE diagnostico_paciente; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.diagnostico_paciente TO rol_medicos;
GRANT SELECT ON TABLE public.diagnostico_paciente TO rol_psicosocial;
GRANT SELECT ON TABLE public.diagnostico_paciente TO rol_enfermeria;
GRANT SELECT ON TABLE public.diagnostico_paciente TO rol_auditoria;


--
-- Name: TABLE evidencia_clinica; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE public.evidencia_clinica TO rol_medicos;
GRANT INSERT ON TABLE public.evidencia_clinica TO rol_enfermeria;


--
-- Name: SEQUENCE evidencia_clinica_id_evidencia_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT USAGE ON SEQUENCE public.evidencia_clinica_id_evidencia_seq TO rol_medicos;
GRANT USAGE ON SEQUENCE public.evidencia_clinica_id_evidencia_seq TO rol_enfermeria;


--
-- Name: TABLE ingreso; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.ingreso TO rol_medicos;
GRANT SELECT ON TABLE public.ingreso TO rol_psicosocial;
GRANT SELECT ON TABLE public.ingreso TO rol_administrativos;
GRANT SELECT ON TABLE public.ingreso TO rol_enfermeria;
GRANT SELECT ON TABLE public.ingreso TO rol_auditoria;


--
-- Name: SEQUENCE ingreso_id_ingreso_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT USAGE ON SEQUENCE public.ingreso_id_ingreso_seq TO rol_medicos;


--
-- Name: TABLE medicamento; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.medicamento TO rol_medicos;
GRANT SELECT ON TABLE public.medicamento TO rol_enfermeria;
GRANT SELECT ON TABLE public.medicamento TO rol_farmacia;
GRANT SELECT ON TABLE public.medicamento TO rol_auditoria;
GRANT SELECT ON TABLE public.medicamento TO u_pasante;


--
-- Name: COLUMN medicamento.stock_actual; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(stock_actual) ON TABLE public.medicamento TO rol_farmacia;


--
-- Name: TABLE nota_clinica; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE public.nota_clinica TO rol_medicos;
GRANT SELECT,INSERT ON TABLE public.nota_clinica TO rol_psicosocial;
GRANT SELECT,INSERT ON TABLE public.nota_clinica TO rol_enfermeria;


--
-- Name: SEQUENCE nota_clinica_id_nota_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT USAGE ON SEQUENCE public.nota_clinica_id_nota_seq TO rol_medicos;
GRANT USAGE ON SEQUENCE public.nota_clinica_id_nota_seq TO rol_psicosocial;
GRANT USAGE ON SEQUENCE public.nota_clinica_id_nota_seq TO rol_enfermeria;


--
-- Name: TABLE paciente; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.paciente TO rol_medicos;
GRANT SELECT ON TABLE public.paciente TO rol_psicosocial;
GRANT SELECT,INSERT ON TABLE public.paciente TO rol_administrativos;
GRANT SELECT ON TABLE public.paciente TO rol_enfermeria;


--
-- Name: COLUMN paciente.expediente; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(expediente) ON TABLE public.paciente TO rol_administrativos;
GRANT SELECT(expediente) ON TABLE public.paciente TO rol_auditoria;


--
-- Name: COLUMN paciente.nombre; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(nombre) ON TABLE public.paciente TO rol_administrativos;


--
-- Name: COLUMN paciente.fecha_nacimiento; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(fecha_nacimiento) ON TABLE public.paciente TO rol_administrativos;
GRANT SELECT(fecha_nacimiento) ON TABLE public.paciente TO rol_auditoria;


--
-- Name: COLUMN paciente.sexo; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(sexo) ON TABLE public.paciente TO rol_administrativos;
GRANT SELECT(sexo) ON TABLE public.paciente TO rol_auditoria;


--
-- Name: COLUMN paciente.tipo_paciente; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(tipo_paciente) ON TABLE public.paciente TO rol_administrativos;
GRANT SELECT(tipo_paciente) ON TABLE public.paciente TO rol_auditoria;


--
-- Name: COLUMN paciente.alergias; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(alergias) ON TABLE public.paciente TO rol_medicos;


--
-- Name: COLUMN paciente.antecedentes_familiares; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(antecedentes_familiares) ON TABLE public.paciente TO rol_medicos;


--
-- Name: COLUMN paciente.antecedentes_personales; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(antecedentes_personales) ON TABLE public.paciente TO rol_medicos;


--
-- Name: TABLE prescripcion; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.prescripcion TO rol_medicos;
GRANT SELECT ON TABLE public.prescripcion TO rol_enfermeria;
GRANT SELECT ON TABLE public.prescripcion TO rol_farmacia;
GRANT SELECT ON TABLE public.prescripcion TO rol_auditoria;


--
-- Name: SEQUENCE prescripcion_id_prescripcion_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT USAGE ON SEQUENCE public.prescripcion_id_prescripcion_seq TO rol_medicos;


--
-- Name: TABLE profesional_salud; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT,UPDATE ON TABLE public.profesional_salud TO u_admin;


--
-- Name: COLUMN profesional_salud.id_profesional; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(id_profesional) ON TABLE public.profesional_salud TO rol_medicos;
GRANT SELECT(id_profesional) ON TABLE public.profesional_salud TO rol_psicosocial;
GRANT SELECT(id_profesional) ON TABLE public.profesional_salud TO rol_administrativos;
GRANT SELECT(id_profesional) ON TABLE public.profesional_salud TO rol_auditoria;
GRANT SELECT(id_profesional) ON TABLE public.profesional_salud TO u_admin;


--
-- Name: COLUMN profesional_salud.username; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(username) ON TABLE public.profesional_salud TO u_admin;


--
-- Name: COLUMN profesional_salud.nombre_completo; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(nombre_completo) ON TABLE public.profesional_salud TO rol_medicos;
GRANT SELECT(nombre_completo) ON TABLE public.profesional_salud TO rol_psicosocial;
GRANT SELECT(nombre_completo) ON TABLE public.profesional_salud TO rol_administrativos;
GRANT SELECT(nombre_completo) ON TABLE public.profesional_salud TO rol_auditoria;
GRANT SELECT(nombre_completo) ON TABLE public.profesional_salud TO u_admin;


--
-- Name: COLUMN profesional_salud.rut; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(rut) ON TABLE public.profesional_salud TO u_admin;


--
-- Name: COLUMN profesional_salud.especialidad; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(especialidad) ON TABLE public.profesional_salud TO rol_medicos;
GRANT SELECT(especialidad) ON TABLE public.profesional_salud TO rol_psicosocial;
GRANT SELECT(especialidad) ON TABLE public.profesional_salud TO rol_administrativos;
GRANT SELECT(especialidad) ON TABLE public.profesional_salud TO rol_auditoria;
GRANT SELECT(especialidad) ON TABLE public.profesional_salud TO u_admin;


--
-- Name: COLUMN profesional_salud.cedula_profesional; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(cedula_profesional) ON TABLE public.profesional_salud TO u_admin;


--
-- Name: COLUMN profesional_salud.rol; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(rol) ON TABLE public.profesional_salud TO rol_medicos;
GRANT SELECT(rol) ON TABLE public.profesional_salud TO rol_psicosocial;
GRANT SELECT(rol) ON TABLE public.profesional_salud TO rol_administrativos;
GRANT SELECT(rol) ON TABLE public.profesional_salud TO rol_auditoria;
GRANT SELECT(rol) ON TABLE public.profesional_salud TO u_admin;


--
-- Name: COLUMN profesional_salud.activo; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(activo) ON TABLE public.profesional_salud TO rol_medicos;
GRANT SELECT(activo) ON TABLE public.profesional_salud TO rol_psicosocial;
GRANT SELECT(activo) ON TABLE public.profesional_salud TO rol_administrativos;
GRANT SELECT(activo) ON TABLE public.profesional_salud TO rol_auditoria;
GRANT SELECT(activo) ON TABLE public.profesional_salud TO u_admin;


--
-- Name: SEQUENCE profesional_salud_id_profesional_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT USAGE ON SEQUENCE public.profesional_salud_id_profesional_seq TO u_admin;


--
-- Name: TABLE psiquiatra_tratante; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.psiquiatra_tratante TO rol_medicos;
GRANT SELECT ON TABLE public.psiquiatra_tratante TO rol_administrativos;


--
-- Name: TABLE tutor; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.tutor TO rol_medicos;
GRANT SELECT,UPDATE ON TABLE public.tutor TO rol_psicosocial;
GRANT SELECT,INSERT,UPDATE ON TABLE public.tutor TO rol_administrativos;


--
-- Name: SEQUENCE tutor_id_tutor_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT USAGE ON SEQUENCE public.tutor_id_tutor_seq TO rol_administrativos;


--
-- PostgreSQL database dump complete
--

\unrestrict OZlaPONcIYMnZLyaU3hTLTScVRt7pR0UcXBIhJrmzOVsYTOCDbruRPvWHhfG5V0

