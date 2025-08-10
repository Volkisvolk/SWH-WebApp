module.exports = {

"[project]/.next-internal/server/app/api/assignments/[id]/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/node:fs [external] (node:fs, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}}),
"[externals]/node:path [external] (node:path, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}}),
"[externals]/node:url [external] (node:url, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}}),
"[externals]/fs [external] (fs, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/path [external] (path, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}}),
"[project]/src/lib/db.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// Simple JSON file DB using lowdb for users, tasks, and assignments
__turbopack_context__.s({
    "adjustUserPoints": ()=>adjustUserPoints,
    "approveAssignment": ()=>approveAssignment,
    "assignTask": ()=>assignTask,
    "createTag": ()=>createTag,
    "createTask": ()=>createTask,
    "createUser": ()=>createUser,
    "deleteTag": ()=>deleteTag,
    "deleteUser": ()=>deleteUser,
    "findOrCreateUserByTag": ()=>findOrCreateUserByTag,
    "findUserByTag": ()=>findUserByTag,
    "getDB": ()=>getDB,
    "getTask": ()=>getTask,
    "getUser": ()=>getUser,
    "listAllAssignments": ()=>listAllAssignments,
    "listAssignmentsForUser": ()=>listAssignmentsForUser,
    "listTags": ()=>listTags,
    "listTasks": ()=>listTasks,
    "listUsers": ()=>listUsers,
    "seedAdminIfEmpty": ()=>seedAdminIfEmpty,
    "setAssignmentStatus": ()=>setAssignmentStatus,
    "setTaskTag": ()=>setTaskTag,
    "updateUserRole": ()=>updateUserRole
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lowdb$2f$lib$2f$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/lowdb/lib/node.js [app-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lowdb$2f$lib$2f$presets$2f$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lowdb/lib/presets/node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
const defaultData = {
    users: [],
    tasks: [],
    assignments: [],
    tags: [],
    nextIds: {
        user: 1,
        task: 1,
        assignment: 1,
        tag: 1
    }
};
let dbPromise = null;
async function getDB() {
    if (!dbPromise) {
        const file = process.env.DB_FILE || 'data/db.json';
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(file);
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(dir)) (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["mkdirSync"])(dir, {
            recursive: true
        });
        dbPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lowdb$2f$lib$2f$presets$2f$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JSONFilePreset"])(file, defaultData);
    }
    const db = await dbPromise;
    // Lightweight migration for older DB files missing new fields
    let migrated = false;
    if (!('tags' in db.data)) {
        // @ts-ignore - add missing field for older files
        ;
        db.data.tags = [];
        migrated = true;
    }
    if (!('nextIds' in db.data)) {
        // Should never happen, but ensure structure
        // @ts-ignore
        ;
        db.data.nextIds = {
            user: 1,
            task: 1,
            assignment: 1,
            tag: 1
        };
        migrated = true;
    } else if (!('tag' in db.data.nextIds)) {
        // initialize tag counter based on existing tags
        const tagsArr = db.data.tags || [];
        const nextTag = tagsArr.length > 0 ? Math.max(...tagsArr.map((t)=>Number(t.id) || 0)) + 1 : 1;
        // @ts-ignore
        db.data.nextIds.tag = nextTag;
        migrated = true;
    }
    if (migrated) await db.write();
    return db;
}
async function seedAdminIfEmpty(adminTagId) {
    const db = await getDB();
    const hasUsers = db.data.users.length > 0;
    if (!hasUsers) {
        const id = db.data.nextIds.user++;
        db.data.users.push({
            id,
            tagId: adminTagId || 'ADMIN_TAG',
            role: 'admin',
            points: 0
        });
        await db.write();
    }
}
async function findOrCreateUserByTag(tagId) {
    const db = await getDB();
    let user = db.data.users.find((u)=>u.tagId === tagId);
    if (!user) {
        const id = db.data.nextIds.user++;
        user = {
            id,
            tagId,
            role: 'user',
            points: 0
        };
        db.data.users.push(user);
        await db.write();
    }
    return user;
}
async function findUserByTag(tagId) {
    const db = await getDB();
    return db.data.users.find((u)=>u.tagId === tagId) || null;
}
async function createUser(tagId, name, role = 'user') {
    const db = await getDB();
    const exists = db.data.users.find((u)=>u.tagId === tagId);
    if (exists) return null;
    const id = db.data.nextIds.user++;
    const user = {
        id,
        tagId,
        name,
        role,
        points: 0
    };
    db.data.users.push(user);
    await db.write();
    return user;
}
async function getUser(id) {
    const db = await getDB();
    return db.data.users.find((u)=>u.id === id) || null;
}
async function createTask(title, points, description, tag) {
    const db = await getDB();
    const id = db.data.nextIds.task++;
    const task = {
        id,
        title,
        points,
        description,
        tag
    };
    db.data.tasks.push(task);
    await db.write();
    return task;
}
async function assignTask(taskId, userId) {
    const db = await getDB();
    const id = db.data.nextIds.assignment++;
    const assignment = {
        id,
        taskId,
        userId,
        status: 'assigned'
    };
    db.data.assignments.push(assignment);
    await db.write();
    return assignment;
}
async function listAssignmentsForUser(userId) {
    const db = await getDB();
    return db.data.assignments.filter((a)=>a.userId === userId);
}
async function listAllAssignments() {
    const db = await getDB();
    return db.data.assignments;
}
async function setAssignmentStatus(id, status) {
    const db = await getDB();
    const a = db.data.assignments.find((x)=>x.id === id);
    if (!a) return null;
    a.status = status;
    if (status === 'pending') a.completedAt = new Date().toISOString();
    await db.write();
    return a;
}
async function approveAssignment(id) {
    const db = await getDB();
    const a = db.data.assignments.find((x)=>x.id === id);
    if (!a) return null;
    const task = db.data.tasks.find((t)=>t.id === a.taskId);
    const user = db.data.users.find((u)=>u.id === a.userId);
    if (!task || !user) return null;
    a.status = 'approved';
    user.points += task.points;
    await db.write();
    return {
        assignment: a,
        task,
        user
    };
}
async function getTask(id) {
    const db = await getDB();
    return db.data.tasks.find((t)=>t.id === id) || null;
}
async function listTasks() {
    const db = await getDB();
    return db.data.tasks;
}
async function listUsers() {
    const db = await getDB();
    return db.data.users;
}
async function adjustUserPoints(userId, delta) {
    const db = await getDB();
    const user = db.data.users.find((u)=>u.id === userId);
    if (!user) return null;
    const newPoints = user.points + delta;
    if (newPoints < 0) return null;
    user.points = newPoints;
    await db.write();
    return user;
}
async function updateUserRole(userId, role) {
    const db = await getDB();
    const user = db.data.users.find((u)=>u.id === userId);
    if (!user) return null;
    user.role = role;
    await db.write();
    return user;
}
async function deleteUser(userId) {
    const db = await getDB();
    const idx = db.data.users.findIndex((u)=>u.id === userId);
    if (idx === -1) return false;
    db.data.users.splice(idx, 1);
    // remove assignments belonging to user
    db.data.assignments = db.data.assignments.filter((a)=>a.userId !== userId);
    await db.write();
    return true;
}
async function createTag(name, color) {
    const db = await getDB();
    const id = db.data.nextIds.tag++;
    const tag = {
        id,
        name,
        color
    };
    db.data.tags.push(tag);
    await db.write();
    return tag;
}
async function listTags() {
    const db = await getDB();
    return db.data.tags;
}
async function deleteTag(tagId) {
    const db = await getDB();
    const idx = db.data.tags.findIndex((t)=>t.id === tagId);
    if (idx === -1) return false;
    db.data.tags.splice(idx, 1);
    // unset tagId on tasks using this tag
    db.data.tasks.forEach((t)=>{
        if (t.tagId === tagId) t.tagId = undefined;
    });
    await db.write();
    return true;
}
async function setTaskTag(taskId, tagId) {
    const db = await getDB();
    const t = db.data.tasks.find((t)=>t.id === taskId);
    if (!t) return null;
    t.tagId = tagId;
    await db.write();
    return t;
}
}),
"[externals]/buffer [external] (buffer, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/util [external] (util, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}}),
"[externals]/crypto [external] (crypto, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "COOKIE_NAME": ()=>COOKIE_NAME,
    "signSession": ()=>signSession,
    "verifySession": ()=>verifySession
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
function signSession(session) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(session, JWT_SECRET, {
        expiresIn: '7d'
    });
}
function verifySession(token) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
    } catch  {
        return null;
    }
}
const COOKIE_NAME = 'beeapp_token';
}),
"[project]/src/app/api/assignments/[id]/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "PATCH": ()=>PATCH
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
;
;
;
async function PATCH(req, { params }) {
    const id = Number(params.id);
    const body = await req.json().catch(()=>null);
    if (!id || !body?.action) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'invalid'
    }, {
        status: 400
    });
    const token = req.cookies.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"])?.value;
    const session = token ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifySession"])(token) : null;
    if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'unauthorized'
    }, {
        status: 401
    });
    if (body.action === 'complete') {
        // ensure the assignment belongs to the user
        const all = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listAllAssignments"])();
        const a0 = all.find((a)=>a.id === id);
        if (!a0 || a0.userId !== session.id) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'forbidden'
        }, {
            status: 403
        });
        const a = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setAssignmentStatus"])(id, 'pending');
        if (!a) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'not found'
        }, {
            status: 404
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            assignment: a
        });
    }
    if (body.action === 'approve') {
        if (session.role !== 'admin') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'forbidden'
        }, {
            status: 403
        });
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["approveAssignment"])(id);
        if (!res) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'not found'
        }, {
            status: 404
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(res);
    }
    if (body.action === 'reject') {
        if (session.role !== 'admin') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'forbidden'
        }, {
            status: 403
        });
        const a = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setAssignmentStatus"])(id, 'rejected');
        if (!a) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'not found'
        }, {
            status: 404
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            assignment: a
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'unknown action'
    }, {
        status: 400
    });
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__3c7f471b._.js.map