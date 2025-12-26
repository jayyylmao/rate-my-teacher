#!/bin/sh
set -e

# Convert postgres:// URL to jdbc:postgresql:// if needed
if [ -n "$DATABASE_URL" ]; then
  # Check if URL starts with postgres://
  if echo "$DATABASE_URL" | grep -q "^postgres://"; then
    # Extract components using sed
    USER=$(echo "$DATABASE_URL" | sed -n 's/postgres:\/\/\([^:]*\):.*/\1/p')
    PASS=$(echo "$DATABASE_URL" | sed -n 's/postgres:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    HOST=$(echo "$DATABASE_URL" | sed -n 's/postgres:\/\/[^@]*@\([^\/]*\)\/.*/\1/p')
    DBPARAMS=$(echo "$DATABASE_URL" | sed -n 's/postgres:\/\/[^\/]*\/\(.*\)/\1/p')

    # Reconstruct as JDBC URL
    export DATABASE_URL="jdbc:postgresql://${HOST}/${DBPARAMS}&user=${USER}&password=${PASS}"
    echo "Converted DATABASE_URL to JDBC format"
  fi
fi

# Execute the Java application
exec java \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -Djava.security.egd=file:/dev/./urandom \
  -jar \
  app.jar
