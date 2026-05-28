import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPath(...paths) {
    return path.join(__dirname, ...paths);
}

async function doesPathExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

async function createDirectory(foldername) {
    await fs.mkdir(foldername, { recursive: true })
}

async function createFile(pathname, content = "") {
    await fs.writeFile(pathname, content)
}

async function appendContent(pathname, content = "") {
    await fs.appendFile(pathname, content)
}

async function readFile(pathname) {
    return await fs.readFile(pathname, "utf-8")
}

export {
    doesPathExists,
    createPath,
    createDirectory,
    createFile,
    appendContent,
    readFile,
}