exports.createTables = async function () {
    try {
        // FIXME: not a tested code though, just wanted to create a visualization of table structure
        // create actor movie map
        let createActorMovieMapTable = `CREATE TABLE public.actor_movie_map ( \
        actor_id character varying COLLATE pg_catalog."default" NOT NULL DEFAULT nextval('actor_movie_map_actor_id_seq'::regclass), \
        movie_id character varying COLLATE pg_catalog."default" NOT NULL, \
        CONSTRAINT actor_movie_map_pkey PRIMARY KEY (actor_id, movie_id), \
        CONSTRAINT actor_movie_map_actor_id_movie_id_key UNIQUE (actor_id, movie_id) \
    )`;

        // create actors
        let createActorsTable = `CREATE TABLE public.actors ( \
        id character varying COLLATE pg_catalog."default" NOT NULL DEFAULT nextval('actors_id_seq'::regclass), \
        name character varying(200) COLLATE pg_catalog."default" NOT NULL, \
        CONSTRAINT actors_pkey PRIMARY KEY (id),\
        CONSTRAINT actors_name_key UNIQUE (name) \
    )`

        // create cities
        let createCitiesTable = `CREATE TABLE public.cities ( \
        id character varying COLLATE pg_catalog."default" NOT NULL DEFAULT nextval('cities_id_seq'::regclass), \
        name character varying(200) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying, 
        CONSTRAINT cities_pkey PRIMARY KEY (id), \
        CONSTRAINT cities_name_key UNIQUE (name) \
    )`;

        // create countries
        let createCountriesTable = `CREATE TABLE public.countries ( \
        id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT nextval('countries_id_seq'::regclass), \
        name character varying(200) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying, \
        CONSTRAINT countries_pkey PRIMARY KEY (id), \
        CONSTRAINT countries_name_key UNIQUE (name) \
    )`

        // create locations
        let createLocationsTable = `CREATE TABLE public.locations (\
        id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT nextval('locations_id_seq'::regclass),\
        name character varying(200) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,\
        country_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT nextval('locations_country_id_seq'::regclass),\
        city_id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT nextval('locations_cities_id_seq'::regclass),\
        longitude double precision NOT NULL,\
        latitude double precision NOT NULL,\
        CONSTRAINT locations_pkey PRIMARY KEY (id),\
        CONSTRAINT locations_longitude_latitude_key UNIQUE (longitude, latitude)\
    )`;

        // create movies
        let createMoviesTable = `CREATE TABLE public.movies (\
        id character varying COLLATE pg_catalog."default" NOT NULL,\
        release_year integer NOT NULL,\
        fun_facts character varying COLLATE pg_catalog."default",\
        production_company character varying(100) COLLATE pg_catalog."default" DEFAULT nextval('movies_production_company_id_seq'::regclass),\
        distributor character varying(100) COLLATE pg_catalog."default" DEFAULT nextval('movies_distributor_id_seq'::regclass),\
        director character varying(100) COLLATE pg_catalog."default" DEFAULT nextval('movies_director_id_seq'::regclass),\
        writers character varying COLLATE pg_catalog."default",\
        title character varying(200) COLLATE pg_catalog."default" NOT NULL,\
        location_id character varying(100) COLLATE pg_catalog."default",\
        CONSTRAINT movies_pkey PRIMARY KEY (id),\
        CONSTRAINT fk_location_id FOREIGN KEY (location_id)\
            REFERENCES public.locations (id) MATCH SIMPLE\
            ON UPDATE NO ACTION\
            ON DELETE NO ACTION\
    )`;

        await pgInstance.query(createCitiesTable);
        await pgInstance.query(createCountriesTable);
        await pgInstance.query(createLocationsTable);
        await pgInstance.query(createMoviesTable);
        await pgInstance.query(createActorsTable);
        await pgInstance.query(createActorMovieMapTable);
    } catch (e) {
        console.error(e);
    }
}