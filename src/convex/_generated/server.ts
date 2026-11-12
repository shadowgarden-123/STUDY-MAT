/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * Functions are parameterised by the project's data model, so `ctx.db` is
 * type-safe.
 */
import {
  actionGeneric,
  httpActionGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import type {
  ActionBuilder,
  GenericActionCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
  GenericMutationCtx,
  GenericQueryCtx,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 */
export const query: QueryBuilder<DataModel, "public"> = queryGeneric;

/**
 * Define a query that is only accessible from other Convex functions.
 */
export const internalQuery: QueryBuilder<DataModel, "internal"> =
  internalQueryGeneric;

/**
 * Define a mutation in this Convex app's public API.
 */
export const mutation: MutationBuilder<DataModel, "public"> = mutationGeneric;

/**
 * Define a mutation that is only accessible from other Convex functions.
 */
export const internalMutation: MutationBuilder<DataModel, "internal"> =
  internalMutationGeneric;

/**
 * Define an action in this Convex app's public API.
 */
export const action: ActionBuilder<DataModel, "public"> = actionGeneric;

/**
 * Define an action that is only accessible from other Convex functions.
 */
export const internalAction: ActionBuilder<DataModel, "internal"> =
  internalActionGeneric;

/**
 * Define an HTTP action.
 */
export const httpAction: HttpActionBuilder = httpActionGeneric;

/**
 * Runtime environment variables of the deployment.
 */
export const env: Record<string, string | undefined> = (
  globalThis as unknown as {
    process: { env: Record<string, string | undefined> };
  }
).process.env;

/**
 * The query context passed as the first argument to a Convex query function.
 */
export type QueryCtx = GenericQueryCtx<DataModel>;

/**
 * The mutation context passed as the first argument to a Convex mutation function.
 */
export type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * The action context passed as the first argument to a Convex action function.
 */
export type ActionCtx = GenericActionCtx<DataModel>;

/**
 * An interface to read from the database within Convex query functions.
 */
export type DatabaseReader = GenericDatabaseReader<DataModel>;

/**
 * An interface to read from and write to the database within Convex mutation
 * functions.
 */
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
