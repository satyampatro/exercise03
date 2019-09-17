# SF Film Location mapper
Service that shows on a map where movies have been filmed in San Francisco. The user should be able to filter the view using autocompletion search.

### Start local server

`npm run dev`

### Env variables configuration

`
NODE_ENV=development
postgres_db_host=<postgres_db_host>
postgres_db_port=<postgres_db_port>
postgres_db=<postgres_db>
postgres_db_username=<postgres_db_username>
postgres_db_pass=<postgres_db_pass>
postgres_db_pool_size=<postgres_db_pool_size>
google_map_api_key=<google_map_api_key>
`

Exposed APIs

1. `/get_film_location` fetches films by location geo points
2. `/get_film_suggestions` fetches films name suggestions
