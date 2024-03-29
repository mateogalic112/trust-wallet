import sql from "./sql";

const databaseInit = async () => {
  await sql`DROP TABLE IF EXISTS transactions`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY, 
        balance INTEGER DEFAULT 0, 
        email VARCHAR(255) UNIQUE NOT NULL, 
        deposit_address VARCHAR(255) NOT NULL, 
        private_key TEXT NOT NULL, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id SERIAL PRIMARY KEY, 
        amount INTEGER NOT NULL, 
        wallet VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        transaction_hash VARCHAR(255),
        transaction_index INTEGER,
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
