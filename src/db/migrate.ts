import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "../../env";
import chalk from "chalk";

console.log(chalk.blue("Starting migration..."));
console.log(chalk.blue("Using Database URL:"), env.DATABASE_URL);

const connection = postgres(env.DATABASE_URL, { max: 1 });
const db = drizzle(connection);

try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log(chalk.green("Migration completed successfully."));
} catch (error) {
    console.error(chalk.red("Migration failed:"), error);
    process.exit(1);
} finally {
    await connection.end();
    process.exit(0);
}