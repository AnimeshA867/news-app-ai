#!/bin/sh

# 1. Check if we are in Production
if [ "$NODE_ENV" = "production" ]; then
    
    echo "Production mode detected. Checking for password file..."

    # Check if the password file exists (-f)
    if [ -f "$DATABASE_PASSWORD_FILE" ]; then
        # Read the password from the file
        export DATABASE_PASSWORD=$(cat "$DATABASE_PASSWORD_FILE")
        
        # Construct the URL using the variables
        # Note: We overwrite DATABASE_URL here
        export DATABASE_URL="postgres://${POSTGRES_USER}:${DATABASE_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DATABASE}"
        
        echo "Success: DATABASE_URL constructed from secrets."
    else
        echo "Error: NODE_ENV is production, but DATABASE_PASSWORD_FILE ($DATABASE_PASSWORD_FILE) was not found!"
        exit 1
    fi

# 2. If not production, assume Development
else
    echo "Development mode detected."

    # Check if DATABASE_URL is set (-n checks for non-empty string)
    if [ -n "$DATABASE_URL" ]; then
        echo "Success: Using provided DATABASE_URL."
    else
        echo "Error: DATABASE_URL is missing!"
        exit 1
    fi
fi

# 3. Execute the main command (Next.js)
exec "$@"