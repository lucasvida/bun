#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U postgres; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# Recreate the user with proper authentication
psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
    DROP USER IF EXISTS docker;
    CREATE USER docker WITH PASSWORD 'docker' CREATEDB;
    GRANT ALL PRIVILEGES ON DATABASE pizzashop TO docker;
EOSQL

echo "User 'docker' created successfully with scram-sha-256 authentication"
