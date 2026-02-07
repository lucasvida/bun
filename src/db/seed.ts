/* eslint-disable drizzle/enforce-delete-with-where */

import { faker } from "@faker-js/faker";
import { db } from "./connection";
import { users, restaurants } from "./schema";
import chalk from "chalk";

/**
 * RESET DATABASE
 */

await db.delete(restaurants);
await db.delete(users);

console.log(chalk.yellow("🆗 Database reset successfully."));

/**
 * CREATE CUSTOMERS
 */

await db.insert(users).values([
    {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: "costumer",
    },
    {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: "costumer",
    },
]);

console.log(chalk.yellow("🆗 Customer created successfully."));

/**
 * CREATE MANAGERS
 */

const [manager] = await db.insert(users).values({
    name: faker.person.fullName(),
    email: "admin@admin.com",
    role: "manager",
}).returning({ id: users.id });



console.log(chalk.yellow("🆗 Manager created successfully."));

/**
 * CREATE RESTAURANTS
 */

await db.insert(restaurants).values({
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager?.id,
});

console.log(chalk.yellow("🆗 Restaurant created successfully."));

console.log(chalk.green("✅ Seed completed successfully."));

process.exit(0);
