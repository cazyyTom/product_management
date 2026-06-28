/**
 * src/api/index.js
 * Re-exports everything so consumers can import from a single path.
 *
 *   import { loginUser, getProjects, createTask } from "@/api";
 */
export { default as api, setAccessToken, getAccessToken, clearAccessToken, normaliseError } from "./axiosInstance";

export * from "./auth.api";
export * from "./projects.api";
export * from "./tasks.api";
export * from "./notes.api";
export * from "./healthcheck.api";
