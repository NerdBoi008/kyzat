import { drizzle } from "drizzle-orm/node-postgres";
import { cache } from "react";
import * as schema from "../schema/index";
import { Pool } from "pg";

// Singleton pool instance (reused across warm Lambda invocations)
let pool: Pool | null = null;

export const getDb = cache(() => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  // Reuse pool if it exists (Lambda warm start)
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Lambda: Keep minimal connections
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout if can't connect
    });
    
    // Handle errors
    pool.on('error', (err) => {
      console.error('Unexpected pool error', err);
    });
  }

  return drizzle({ client: pool, schema });
});

// For static routes (ISR/SSG)
export const createDB = cache(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected pool error', err);
    });
  }

  return drizzle({ client: pool, schema });
});

// import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
// import { eq, desc } from "drizzle-orm";
// import { Pool } from "pg";
// import { config } from "dotenv";
// import * as schema from "./schema";

// config({ 
//   path: "../../.env",
//   quiet: true,
// });

// type DBType = NodePgDatabase<typeof schema>;

// // Use a global identifier to share connection across the entire process
// const GLOBAL_DB_KEY = Symbol.for("app.database.connection");
// const GLOBAL_POOL_KEY = Symbol.for("app.database.pool");

// interface GlobalThis {
//   [GLOBAL_DB_KEY]?: DBType;
//   [GLOBAL_POOL_KEY]?: Pool;
// }

// // Extend global object
// declare const globalThis: GlobalThis;

// let isInitializing = false;

// export const createDB = async (): Promise<DBType> => {
//   // Check if we already have a global connection
//   if (globalThis[GLOBAL_DB_KEY] && globalThis[GLOBAL_POOL_KEY]) {
//     try {
//       // Test the existing pool
//       const client = await globalThis[GLOBAL_POOL_KEY].connect();
//       await client.query("SELECT 1");
//       client.release();
//       console.log("Reusing existing database connection pool");
//       return globalThis[GLOBAL_DB_KEY]!;
//     } catch (error) {
//       console.warn("Existing connection failed, creating new one:", error);
//       // Clean up failed connection
//       if (globalThis[GLOBAL_POOL_KEY]) {
//         try {
//           await globalThis[GLOBAL_POOL_KEY].end();
//         } catch {}
//       }
//       globalThis[GLOBAL_DB_KEY] = undefined;
//       globalThis[GLOBAL_POOL_KEY] = undefined;
//     }
//   }

//   // Prevent multiple simultaneous initialization attempts
//   if (isInitializing) {
//     console.log("Database initialization in progress, waiting...");
//     while (isInitializing) {
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }
//     if (globalThis[GLOBAL_DB_KEY]) {
//       return globalThis[GLOBAL_DB_KEY]!;
//     }
//   }

//   isInitializing = true;

//   try {
//     console.log(`Creating PostgreSQL connection pool (PID: ${process.pid})...`);

//     // const pool = new Pool({
//     //   host: process.env.DB_HOST!,
//     //   port: Number(process.env.DB_PORT!) || 5432,
//     //   user: process.env.DB_USER!,
//     //   password: process.env.DB_PASSWORD!,
//     //   database: process.env.DB_DATABASE!,
//     //   // Conservative settings for hosting environments
//     //   max: 1, // Maximum connections in pool
//     //   idleTimeoutMillis: 300000, // 5 minutes
//     //   connectionTimeoutMillis: 60000, // 60 seconds
//     //   // SSL configuration for production
//     //   // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
//     // });

//     const pool = new Pool({
//       connectionString: process.env.DATABASE_URL!,
//       // Conservative settings for hosting environments
//       max: 1, // Maximum connections in pool
//       idleTimeoutMillis: 300000, // 5 minutes
//       connectionTimeoutMillis: 60000, // 60 seconds
//       // SSL configuration for production
//       // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
//     });

//     const db = drizzle(process.env.DATABASE_URL!, {
//       schema: schema,
//     });

//     // Test the connection
//     const client = await pool.connect();
//     await client.query("SELECT 1");
//     client.release();

//     // Store globally
//     globalThis[GLOBAL_DB_KEY] = db;
//     globalThis[GLOBAL_POOL_KEY] = pool;

//     console.log(
//       `PostgreSQL pool initialized successfully (PID: ${process.pid})`
//     );

//     // Set up cleanup handlers (only once per process)
//     if (!process.listeners("SIGINT").length) {
//       process.on("SIGINT", gracefulShutdown);
//       process.on("SIGTERM", gracefulShutdown);
//       process.on("uncaughtException", (error) => {
//         console.error("Uncaught Exception:", error);
//         gracefulShutdown();
//       });
//     }

//     return db;
//   } catch (error) {
//     console.error(
//       `Failed to create database connection (PID: ${process.pid}):`,
//       error
//     );

//     // Add specific handling for PostgreSQL connection errors
//     const pgError = error as { code?: string };
//     if (pgError.code === "28000") {
//       console.error(
//         "PostgreSQL authentication failed. Check your credentials."
//       );
//     } else if (pgError.code === "ECONNREFUSED") {
//       console.error(
//         "PostgreSQL server connection refused. Check if the server is running."
//       );
//     } else if (pgError.code === "28P01") {
//       console.error("PostgreSQL password authentication failed.");
//     }

//     throw error;
//   } finally {
//     isInitializing = false;
//   }
// };

// export const getDB = (): DBType => {
//   if (!globalThis[GLOBAL_DB_KEY]) {
//     throw new Error("Database not initialized. Call createDB() first.");
//   }
//   return globalThis[GLOBAL_DB_KEY]!;
// };

// export const closeDB = async (): Promise<void> => {
//   if (globalThis[GLOBAL_POOL_KEY]) {
//     console.log(`Closing PostgreSQL connection pool (PID: ${process.pid})...`);
//     try {
//       await globalThis[GLOBAL_POOL_KEY].end();
//     } catch (error) {
//       console.error("Error closing pool:", error);
//     }
//     globalThis[GLOBAL_DB_KEY] = undefined;
//     globalThis[GLOBAL_POOL_KEY] = undefined;
//   }
// };

// // Graceful shutdown handler
// const gracefulShutdown = async () => {
//   console.log(
//     `Received shutdown signal (PID: ${process.pid}), closing database connection...`
//   );
//   await closeDB();
//   process.exit(0);
// };

// // Health check function
// export const healthCheck = async (): Promise<boolean> => {
//   try {
//     if (!globalThis[GLOBAL_POOL_KEY]) {
//       return false;
//     }

//     const client = await globalThis[GLOBAL_POOL_KEY].connect();
//     await client.query("SELECT 1");
//     client.release();
//     return true;
//   } catch (error) {
//     console.error("Database health check failed:", error);
//     return false;
//   }
// };

// // Check if database is connected
// export const isConnected = (): boolean => {
//   return !!(globalThis[GLOBAL_DB_KEY] && globalThis[GLOBAL_POOL_KEY]);
// };

// // For debugging - log which process is using the connection
// export const getConnectionInfo = () => {
//   return {
//     pid: process.pid,
//     hasConnection: !!globalThis[GLOBAL_DB_KEY],
//     hasPool: !!globalThis[GLOBAL_POOL_KEY],
//   };
// };

// // Common query helpers
// export const withPagination = (page: number = 1, pageSize: number = 10) => ({
//   limit: pageSize,
//   offset: (page - 1) * pageSize,
// });

// // Transaction helper
// export const withTransaction = async <T>(
//   callback: (tx: DBType) => Promise<T>
// ): Promise<T> => {
//   const db = getDB();
//   return await db.transaction(callback);
// };