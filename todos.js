import {
    doesPathExists,
    createPath,
    createDirectory,
    createFile,
    appendContent,
    readFile,
} from "./file-helpers.js"
import crypto from "crypto"


const constants = {
    mainFolder: "database",
    todosFile: "todos.json",
    categoryFile: "category.txt"
}

async function getCategories() {
    let categoryPath = createPath(constants.mainFolder, constants.categoryFile)
    const doesCategoryFileExists = await doesPathExists(categoryPath)
    if (!doesCategoryFileExists) {
        return false
    } else {
        let data = (await readFile(categoryPath)).split("\n")
        data.pop();
        return data;
    }
}

async function createTodo(todo, category = "personal", priority = "low") {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const categoryFile = createPath(constants.mainFolder, constants.categoryFile)
    const doesMainFolderExists = await doesPathExists(createPath(constants.mainFolder))
    const doesTodosFileExists = await doesPathExists(todosFile)
    const doesCategoryFileExists = await doesPathExists(categoryFile)

    const todoObject = {
        tid: crypto.randomUUID(),
        todo,
        category,
        priority,
        is_Completed: "no",
        createdAt: new Date().toLocaleString(),
        updatedAT: new Date().toLocaleString()
    }
    if (!doesMainFolderExists) {
        await createDirectory(createPath(constants.mainFolder))
        await createFile(todosFile, "[]")
        await createFile(categoryFile)
    } else if (!doesTodosFileExists) {
        await createFile(todosFile, "[]")
        await createFile(categoryFile)
    } else if (!doesCategoryFileExists) {
        await createFile(categoryFile)
    }
    const categoryContent = await readFile(categoryFile)
    let categoryArr = categoryContent.split("\n")

    let doesCategoryExists = false
    for (let i = 0; i < categoryArr.length - 1; i++) {
        if (category.toLowerCase() == categoryArr[i]) {
            doesCategoryExists = true;
            break;
        }
    }
    if (!doesCategoryExists) {
        (async () => {
            await appendContent(categoryFile, `${category}\n`);
        })();
    }
    let prevData = await readFile(todosFile)
    let jsonData = JSON.parse(prevData.toString())
    jsonData.push(todoObject)
    await createFile(todosFile, JSON.stringify(jsonData, null, 2))
}

async function getAllTodos() {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const doesMainFolderExists = await doesPathExists(createPath(constants.mainFolder))
    const doesTodosFileExists = await doesPathExists(todosFile)
    if (!doesMainFolderExists || !doesTodosFileExists) {
        return false
    }
    let obtainedData = await readFile(todosFile);
    let data = JSON.parse(obtainedData);
    if (data.length <= 0) return false
    return data
}


async function getSpecificPriorityTodos(priority) {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const doesMainFolderExists = await doesPathExists(createPath(constants.mainFolder))
    const doesTodosFileExists = await doesPathExists(todosFile)
    if (!doesMainFolderExists || !doesTodosFileExists) {
        return false
    }
    let obtainedData = await readFile(todosFile);
    let parsedData = JSON.parse(obtainedData);
    if (parsedData.length <= 0) return false
    let data = [];
    for (let i = 0; i < parsedData.length; i++) {
        if (parsedData[i].priority == priority) {
            data.push(parsedData[i])
        }
    }
    return data
}

async function getSpecificCategoryTodos(category) {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const doesMainFolderExists = await doesPathExists(createPath(constants.mainFolder))
    const doesTodosFileExists = await doesPathExists(todosFile)
    if (!doesMainFolderExists || !doesTodosFileExists) {
        return false
    }
    let obtainedData = await readFile(todosFile);
    let parsedData = JSON.parse(obtainedData);
    if (parsedData.length <= 0) return false
    let data = [];
    for (let i = 0; i < parsedData.length; i++) {
        if (parsedData[i].category == category) {
            data.push(parsedData[i])
        }
    }
    return data
}

async function getTodosByCategoryAndPriority(category, priority) {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const doesMainFolderExists = await doesPathExists(createPath(constants.mainFolder))
    const doesTodosFileExists = await doesPathExists(todosFile)
    if (!doesMainFolderExists || !doesTodosFileExists) {
        return false
    }
    let obtainedData = await readFile(todosFile);
    let parsedData = JSON.parse(obtainedData);
    if (parsedData.length <= 0) return false
    let data = [];
    for (let i = 0; i < parsedData.length; i++) {
        if (parsedData[i].priority == priority && parsedData[i].category == category) {
            data.push(parsedData[i])
        }
    }
    return data
}

async function getCompletedTodos() {
        let data = await getAllTodos();
        if (!data) return false
        let result = data.filter(elem => elem.is_Completed == "yes")
        return result
}

async function getInCompleteTodos() {
        let data = await getAllTodos();
        if (!data) return false
        let result = data.filter(elem => elem.is_Completed == "no")
        return result
}

async function deleteTodo(todoId) {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const doesTodosFileExists = await doesPathExists(todosFile)
    if (!doesTodosFileExists) {
        return false
    }

    let data = await readFile(todosFile)
    let parsedData = JSON.parse(data)
    if (parsedData.length <= 0) return false

    let filtered = parsedData.filter(elem => elem.tid != todoId)

    await createFile(todosFile, JSON.stringify(filtered, null, 2))
    return true;
}

async function deleteAllTodo() {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const doesTodosFileExists = await doesPathExists(todosFile)
    if (!doesTodosFileExists) {
        return true
    }
    await createFile(todosFile, JSON.stringify([], null, 2))
    return true
}

async function deleteSpecificPriorityTodos(priority) {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const doesTodosFileExists = await doesPathExists(todosFile)
    if (!doesTodosFileExists) {
        return false
    }

    let data = await readFile(todosFile)
    let parsedData = JSON.parse(data)
    if (parsedData.length <= 0) return false

    let filtered = parsedData.filter(elem => elem.priority != priority)

    await createFile(todosFile, JSON.stringify(filtered, null, 2))
    return true
}

async function deleteSpecificCategoryTodos(category) {
    const todosFile = createPath(constants.mainFolder, constants.todosFile)
    const doesTodosFileExists = await doesPathExists(todosFile)
    if (!doesTodosFileExists) {
        return false
    }

    let data = await readFile(todosFile)
    let parsedData = JSON.parse(data)
    if (parsedData.length <= 0) return false


    let filtered = parsedData.filter(elem => elem.category != category)

    await createFile(todosFile, JSON.stringify(filtered, null, 2))

    let categoryDat = await getCategories()
    let filterCategories = categoryDat.filter((elem) => elem != category)
    let finalData = `${filterCategories.join("\n")}\n`
    await createFile(createPath(constants.mainFolder, constants.categoryFile), finalData)
    return true
}

async function editTodo(todos,todoId, dataToBeEdited) {
    for (let i = 0; i < todos.length; i++) {
        if (todos[i].tid == todoId) {
            for (let key in dataToBeEdited) {
                todos[i][key] = dataToBeEdited[key]
            }
            todos.updatedAT = new Date().toLocaleString()
            break;
        }
    }
    await createFile(createPath(constants.mainFolder, constants.todosFile), JSON.stringify(todos, null, 2))
    return true
}


export {
    getCategories,
    createTodo,
    getAllTodos,
    getSpecificPriorityTodos,
    getSpecificCategoryTodos,
    getTodosByCategoryAndPriority,
    getCompletedTodos,
    getInCompleteTodos,
    deleteTodo,
    deleteAllTodo,
    deleteSpecificCategoryTodos,
    deleteSpecificPriorityTodos,
    editTodo
}