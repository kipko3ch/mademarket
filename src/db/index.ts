import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

// During build time, DATABASE_URL may not be set.
// neon() requires a valid URL, so we provide a placeholder for build.
const sql = neon(url || "postgresql://placeholder:placeholder@localhost/placeholder");
export const db = drizzle(sql, { schema });

export type Database = typeof db;
