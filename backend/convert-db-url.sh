#!/bin/bash
# Convert postgres:// URL to jdbc:postgresql:// format

INPUT_URL="$1"

# Remove postgres:// prefix
TEMP="${INPUT_URL#postgres://}"

# Extract credentials (username:password)
CREDS="${TEMP%%@*}"
USERNAME="${CREDS%%:*}"
PASSWORD="${CREDS#*:}"

# Extract host, port, database, and params
TEMP2="${TEMP#*@}"
HOST_PORT_DB="${TEMP2%%\?*}"
HOST_PORT="${HOST_PORT_DB%%/*}"
DATABASE="${HOST_PORT_DB#*/}"

# Extract params if they exist
if [[ "$TEMP2" == *"?"* ]]; then
    PARAMS="${TEMP2#*\?}"
    echo "jdbc:postgresql://${HOST_PORT}/${DATABASE}?user=${USERNAME}&password=${PASSWORD}&${PARAMS}"
else
    echo "jdbc:postgresql://${HOST_PORT}/${DATABASE}?user=${USERNAME}&password=${PASSWORD}"
fi
