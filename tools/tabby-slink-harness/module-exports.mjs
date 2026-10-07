/**
 * Re-exports from the experiment checkout the harness is pointed at
 * (TABBY_MODULE_ROOT), so the legacy round-2 snapshots can use that checkout's
 * own room.js collision helpers instead of a copy.
 */
import { pathToFileURL } from "node:url";

const root = process.env.TABBY_MODULE_ROOT;
if (!root) throw new Error("TABBY_MODULE_ROOT is not set (run.mjs sets it)");

const room = await import(new URL("room.js", pathToFileURL(root.replace(/\/?$/, "/"))).href);

export const CAMERA_RADIUS = room.CAMERA_RADIUS;
export const collideCameraPose = room.collideCameraPose;
export const cameraClearance = room.cameraClearance;
export const createRoom = room.createRoom;
