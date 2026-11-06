import "dotenv/config";

import { defineConfig } from "prisma/config";

const testDatabaseUrl = process.env["TEST_DATABASE_URL"];

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL is required. Configure a dedicated PostgreSQL test database before applying test migrations.",
  );
}

const testUrl = new URL(testDatabaseUrl);
const testDatabaseName = decodeURIComponent(testUrl.pathname.replace(/^\/+/, ""));

if (!/test/i.test(testDatabaseName)) {
  throw new Error(
    "Safety check failed: TEST_DATABASE_URL database name must contain 'test'. Use a separate database such as ankush_arya_casting_test.",
  );
}

if (process.env["DATABASE_URL"]) {
  const developmentUrl = new URL(process.env["DATABASE_URL"]);
  const sameDatabase =
    developmentUrl.hostname === testUrl.hostname &&
    (developmentUrl.port || "5432") === (testUrl.port || "5432") &&
    decodeURIComponent(developmentUrl.pathname) === decodeURIComponent(testUrl.pathname);

  if (sameDatabase) {
    throw new Error(
      "Safety check failed: TEST_DATABASE_URL points to the same database as DATABASE_URL.",
    );
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: testDatabaseUrl,
  },
});
