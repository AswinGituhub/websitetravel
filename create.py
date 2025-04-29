import couchdb

# Connect to CouchDB with authentication (replace 'your_username' and 'your_password' with actual credentials)
couch = couchdb.Server('http://localhost:5984/')
couch.resource.credentials = ('nithish', 'nithish1456')  # Add your credentials here

# Try to connect to the 'users' database
try:
    # Connect to the 'users' database
    db = couch['users']  # Ensure the database exists
    print("Connected to the users database.")

    # Define the user document
    user_doc = {
        "_id": "user_22bit058@psgcas.ac.in",  # Unique ID for the document
        "name": "Tarun",
        "email": "22bit058@psgcas.ac.in",
        "password": "0987654321"
    }

    # Save the user document to the database
    try:
        # Check if the document with the same _id already exists
        if user_doc["_id"] in db:
            print("Document with this ID already exists!")
        else:
            db.save(user_doc)
            print("User document added successfully.")

    except Exception as e:
        print(f"Error saving user document: {e}")

except couchdb.http.Unauthorized:
    print("Authentication failed. Please check your username and password.")
except couchdb.http.ResourceNotFound:
    print("Database not found. Please check if the 'users' database exists.")
except Exception as e:
    print(f"An error occurred: {e}")
