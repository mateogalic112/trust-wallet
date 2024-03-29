import sql from "./sql";

const databaseInit = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY, 
        balance INTEGER, 
        email VARCHAR(255), 
        deposit_address VARCHAR(255), 
        private_key TEXT, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`;
};

// Execute the function and handle any errors
databaseInit()
  .then(() => {
    console.log("Tables created or already in place!");
    process.exit(); // Exit the script successfully
  })
  .catch((error) => {
    console.error("Error creating tables:", error);
    process.exit(1); // Exit with an error code
  });
