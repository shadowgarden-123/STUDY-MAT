/**
 * Generated `api` utility.
 *
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import { anyApi } from "convex/server";
import type * as auth from "../auth.js";
import type * as auth_config from "../auth.config.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as config_campus from "../config/campus.js";
import type * as conversations from "../conversations.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_normalize from "../lib/normalize.js";
import type * as lib_validation from "../lib/validation.js";
import type * as listings from "../listings.js";
import type * as profile from "../profile.js";
import type * as schema from "../schema.js";
import type * as seed from "../seed.js";
import type * as stats from "../stats.js";
import type * as users from "../users.js";

const fullApi: ApiFromModules<{
  "auth": typeof auth;
  "auth.config": typeof auth_config;
  "auth/emailOtp": typeof auth_emailOtp;
  "config/campus": typeof config_campus;
  "conversations": typeof conversations;
  "events": typeof events;
  "files": typeof files;
  "http": typeof http;
  "lib/normalize": typeof lib_normalize;
  "lib/validation": typeof lib_validation;
  "listings": typeof listings;
  "profile": typeof profile;
  "schema": typeof schema;
  "seed": typeof seed;
  "stats": typeof stats;
  "users": typeof users;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;
