import readline from "readline/promises"
import {
    createTodo,
    deleteAllTodo,
    deleteSpecificCategoryTodos,
    deleteSpecificPriorityTodos,
    deleteTodo,
    editTodo,
    getAllTodos,
    getCategories,
    getCompletedTodos,
    getInCompleteTodos,
    getSpecificCategoryTodos,
    getSpecificPriorityTodos,
    getTodosByCategoryAndPriority
} from "./todos.js"

export const c = {
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    reset: "\x1b[0m"
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function displayArr(arr, columnWidth = 15, columns = 4) {
    for (let i = 0; i < arr.length; i++) {
        process.stdout.write(`${c.yellow}${i + 1}) ${arr[i].padEnd(columnWidth, " ")}${c.reset}\t`)

        if ((i + 1) % columns === 0) {
            process.stdout.write("\n");
        }
        if (i == arr.length - 1) { console.log("\n\n") }
    }
}

function displayCategories(data) {
    let categories = [];
    for (let i = 0; i < data.length; i++) {
        categories.push(data[i].charAt(0).toUpperCase() + data[i].slice(1))
    }
    console.log(`${c.cyan}Your Existing Categories are:${c.reset}\n`)
    displayArr(categories)
}

async function categorySelection(categoryData) {
    displayCategories(categoryData)
    console.log(`${c.yellow}Enter exit to abort${c.reset}\n`)
    let category = (await rl.question('Insert any category from above: ')).toLowerCase();
    if (category == "exit") return "exit";
    if (category == "") {
        return "default";
    }
    let doExit = false
    while (!categoryData.includes(category)) {
        console.log(`${c.yellow}No Such Category Exists${c.reset}`)
        category = (await rl.question('Insert existing category from above: ')).toLowerCase;
        if (category == "exit") {
            doExit = true;
            break;
        } else if (category == "") {
            return "default";
        }
    }
    if (doExit == true) { return "exit" }
    else return category
}

async function prioritySelection() {
    console.log(`${c.cyan}Priorities of the todo are:\n1) High\n2) Mid\n3) Low${c.reset}\n`)

    console.log(`${c.yellow}Enter exit to abort it${c.reset}\n`)

    let priority = (await rl.question(`Enter one of the priority from above: `)).toLowerCase();
    if (priority == "exit") return "exit";
    if (priority == "") {
        return "default";
    }
    let doExit = false;
    while (priority != "high" && priority != "mid" && priority != "low") {
        console.log(`${c.yellow}No Such priority Exists${c.reset}`)
        priority = await rl.question('Enter existing priority from above: ');
        if (priority == "exit") {
            doExit = true;
            break;
        } else if (priority == "") {
            return "default";
        }
    }
    if (doExit == true) { return "exit" }
    else return priority
}

async function obtainTodosData() {
    let todo = await rl.question('Enter the todo: ');
    while (todo.length < 4) {
        console.log(`${c.red}The Todo must be atleast of 4 characters${c.reset}`)
        todo = await rl.question('Enter the todo: ');
    }
    let data = await getCategories()
    let category;
    if (data.length <= 0) {
        console.log("No categories found")
        category = await rl.question(`Enter the category of todo  `);
    } else {
        displayCategories(data)
        category = (await rl.question('Enter any category from above or new: ')).toLowerCase();
        if (category == "") category = "personal"
    }

    let priority = await prioritySelection()
    if (priority == "default") {
        priority = "low"
    } else if (priority == "exit") {
        return false
    }

    return { todo, category, priority }
}

async function viewAllTodos() {
    let allTodos = await getAllTodos();
    if (!allTodos || allTodos.length == 0) {
        console.log(`${c.yellow}Sorry You dont have any todos${c.reset}`)
    } else {
        console.table(allTodos, ["todo", "category", "priority", "is_Completed", "createdAt"])
    }
}

async function viewSpecificCategoryTodos(data) {
    let category = await categorySelection(data)
    if (category == "default") {
        category = "personal";
    } else if (category == "exit") {
        return false
    }
    try {
        let categoryTodos = await getSpecificCategoryTodos(category);
        if (!categoryTodos) {
            console.log(`${c.yellow}Sorry You dont have ${category} todos${c.reset}\n`)
        } else {
            console.table(categoryTodos, ["todo", "priority", "is_Completed", "createdAt"])
        }
    } catch (error) {
        console.log("Error while getting categorical todos", error)
    }
}

async function viewSpecificPriorityTodos() {
    let viewPriority = await prioritySelection()
    if (viewPriority == "default") {
        viewPriority = "low";
    } else if (viewPriority == "exit") {
        return false
    }
    try {
        let priorityTodos = await getSpecificPriorityTodos(viewPriority);
        if (!priorityTodos) {
            console.log(`${c.yellow}Sorry You dont have ${viewPriority} priority todos${c.reset}`)
        } else {
            console.table(priorityTodos, ["todo", "category", "is_Completed", "createdAt"])
        }
    } catch (error) {
        console.log("Error while getting priority todos", error)
    }
}

async function viewSpecificCategoryPriorityTodos(categoryData) {
    let category = await categorySelection(data)
    if (category == "default") {
        category = "personal"
    } else if (category == "exit") {
        return false
    }

    let priority = await prioritySelection()
    if (priority == "default") {
        priority = "low"
    } else if (priority == "exit") {
        return false
    }

    try {
        let categoryPriorityTodos = await getTodosByCategoryAndPriority(category, priority);
        if (!categoryPriorityTodos) {
            console.log(`${c.yellow}Sorry You dont have ${"category"} todos of ${"priority"}${c.reset}`)
        } else {
            console.table(categoryPriorityTodos, ["todo", "is_Completed", "createdAt"])
        }
    } catch (error) {
        console.log("Error while getting categorical todos of specific priority", error)
    }
}

async function getEditedTodo() {
    let allTodos = await getAllTodos();
    if (!allTodos || allTodos.length == 0) {
        console.log(`${c.yellow}Sorry You dont have any todos${c.reset}`)
        return false
    } else {
        console.table(allTodos, ["todo", "category", "priority", "is_Completed", "createdAt"])
    }

    console.log("\nEnter exit to terminate")
    let editIndex = (await rl.question('Enter the index(from table) of the todo to edit: '))
    if (editIndex.toLowerCase() == "exit") return false;
    let regex = /^[0-9]+$/;

    let doExit = false
    while (!regex.test(editIndex)) {
        console.log(`${c.red}Please Input a valid Index or enter exit to terminate${c.reset}`);
        editIndex = (await rl.question('Enter the valid index of the todo: '))
        if (editIndex.toLowerCase() == "exit") {
            doExit = true;
            break
        }
    }
    if (doExit) return false;
    editIndex = Number(editIndex.replace(/^0+(?!$)/, ""))
    if (editIndex >= allTodos.length) {
        console.log("NO such Index exists")
    }

    let initialData = allTodos[editIndex]

    let dataToBeEdited = {};

    console.log(`${c.yellow}If you dont want to change just leave it as default${c.reset}`)

    let todo = await rl.question('Enter the new todo: ');
    while (todo.length < 4 && todo != "") {
        console.log(`${c.red}The Todo must be atleast of 4 characters${c.reset}`)
        todo = await rl.question('Enter the new todo: ');
    }
    if (todo != "" && todo != initialData) {
        dataToBeEdited.todo = todo
    }

    let data = await getCategories()
    let category = await categorySelection(data)
    if (category == "default") {
        category = ""
    } else if (category == "exit") {
        return false
    }

    if (category != "" && category != initialData.category) {
        dataToBeEdited.category = category
    }

    let priority = await prioritySelection()
    if (priority == "default") {
        priority = ""
    } else if (priority == "exit") {
        return false
    }

    if (priority != "" && category != initialData.priority) {
        dataToBeEdited.priority = priority
    }

    let completeStatus = await rl.question('Have you completed this todo?[y/no]: ');

    if (completeStatus == "yes" || completeStatus == "y") {
        if (initialData.is_Completed == "no") {
            completeStatus = "yes"
        } else {
            completeStatus = ""
        }
    } else if (completeStatus == "no" || completeStatus == "n") {
        if (initialData.is_Completed == "yes") {
            completeStatus = "no"
        } else {
            completeStatus = ""
        }
    }

    if (completeStatus != "" && completeStatus != initialData.is_Completed) {
        dataToBeEdited.is_Completed = completeStatus
    }
    return { allTodos, editIndex, dataToBeEdited }
}

async function getSpecificDeleteIndex(allTodos) {
    let deleteIndex = (await rl.question('Enter the index(from table) of the todo: '))
    if (deleteIndex.toLowerCase() == "exit") return false;
    let regex = /^[0-9]+$/;
    let doExit = false;
    while (!regex.test(deleteIndex)) {
        console.log(`${c.red}Invalid Input! please Input a valid Index or exit to terminate${c.reset}`);
        deleteIndex = (await rl.question('Enter the valid index of the todo: '))
        if (deleteIndex.toLowerCase() == "exit") {
            doExit = true;
            break
        }
    }
    if (doExit) return false;
    deleteIndex = Number(deleteIndex.replace(/^0+(?!$)/, ""))
    if (deleteIndex >= allTodos.length) {
        console.log("NO such Index exists")
    }
    return deleteIndex
}

async function start() {
    console.log(`${c.cyan}Welcome To Our TODO app.\n\nHere you can add, delete, edit you todos.\nSave todos based on your categories and priorities.${c.reset}\n`)

    while (true) {
        console.log(`${c.yellow}\n1) Insert Todos\n2) View Todos\n3) Modify Todos\n4) Delete Todos\n5) Exit\n${c.reset}`)
        const key = await rl.question('Insert one of the Key from above: ');
        if (key === "5") {
            console.log(`${c.red}Closing the program${c.reset}`);
            break;
        } else if (key === "1") {
            const { todo, category, priority } = await obtainTodosData()
            if (!priority || !category || !todo) break;
            try {
                await createTodo(todo, category.length > 0 ? category.toLowerCase() : "personal", priority)
                console.log(`${c.green}Todo Created Successfully.\nPerform the next operation you would like.${c.reset}\n`)
            } catch (error) {
                console.log(`${c.red}Error during the Insertion of Todo${c.reset}`, error)
            }

        } else if (key === "2") {
            while (true) {
                console.log(`\n${c.yellow}1) View All Todos\n2) View Specific Category Todos\n3) View Specific Priority Todos\n4) View Specific Category Todos of Specific Priority\n5) View Completed Todos\n6) View Incomplete Todos\n7) Exit${c.reset}\n`)
                const viewKey = await rl.question('Insert one of the Key from above: ');
                if (viewKey == "7") {
                    console.log(`${c.red}Exiting View Mode${c.reset}`)
                    break;
                } else if (viewKey == "1") {
                    await viewAllTodos();
                } else if (viewKey == "2") {
                    let data = await getCategories()
                    if (data.length <= 0) {
                        console.log("No categories found")
                    } else {
                        let status = await viewSpecificCategoryTodos(data)
                        if (!status) console.log(`${c.red}Exited${c.reset}`);
                    }
                } else if (viewKey == "3") {
                    let status = await viewSpecificPriorityTodos(data)
                    if (!status) console.log(`${c.red}Exited${c.reset}`);
                } else if (viewKey == "4") {
                    let categoryData = await getCategories()
                    if (categoryData.length <= 0) {
                        console.log("No categories found");
                        let allTodos = await getAllTodos();
                        if (!allTodos || allTodos.length == 0) {
                            console.log(`${c.yellow}Sorry You dont have any todos${c.reset}`)
                        } else {
                            console.table(allTodos, ["todo", "category", "priority", "is_Completed", "createdAt"])
                        }
                    } else {
                        let status = await viewSpecificCategoryPriorityTodos(data)
                        if (!status) console.log(`${c.red}Exited${c.reset}`);
                    }
                } else if (viewKey == "5") {
                    try {
                        let completedTodos = await getCompletedTodos()
                        if (completedTodos.length <= 0) {
                            console.log(`${c.cyan}Sorry You dont have any completed todos${c.reset}`)
                        } else {
                            console.table(completedTodos, ["todo", "category", "priority", "createdAt"])
                        }
                    } catch (error) {
                        console.log("Error in getting completed todos", error)
                    }
                } else if (viewKey == "6") {
                    try {
                        let inCompleteTodos = await getInCompleteTodos()
                        if (inCompleteTodos.length <= 0) {
                            console.log(`${c.yellow}Sorry You dont have any incomplete todos${c.reset}`)
                        } else {
                            console.table(inCompleteTodos, ["todo", "category", "priority", "createdAt"])
                        }
                    } catch (error) {
                        console.log("Error in getting incomplete todos", error)
                    }
                } else {
                    console.log(`${c.red}Invalid Key! Please press a Valid key from below${c.reset}`)
                }
            }
            console.log(`${c.green}Successfully Exited View Mode${c.reset}`)
        } else if (key == "3") {
            let data = await getEditedTodo()
            console.log("Data", data)
            let { allTodos, editIndex, dataToBeEdited } = await getEditedTodo()
            if (!allTodos || !editIndex || !dataToBeEdited) {
                console.log(`${c.red}Exited${c.reset}`);
                break;
            }
            try {
                await editTodo(allTodos, allTodos[editIndex].tid, dataToBeEdited)
                console.log(`${c.cyan}Successfully edited${c.reset}`)
            } catch (error) {
                console.log("Error editing todo", error)
            }

        } else if (key == "4") {
            while (true) {
                console.log(`${c.yellow}\n1) Delete Specific Todo\n2) Delete All Todos\n3) Delete Specific Priority Todos\n4) Delete Specific Category Todos\n5) Exit\n${c.reset}`)
                const deleteKey = await rl.question('Insert Key from above to delete: ');
                if (deleteKey === "5") {
                    console.log(`${c.red}Closing the deletion mode${c.reset}`);
                    break;
                } else if (deleteKey == "1") {
                    let allTodos = await getAllTodos();
                    if (!allTodos || allTodos.length == 0) {
                        console.log(`${c.yellow}Sorry You dont have any todos${c.reset}`)
                        break;
                    } else {
                        console.table(allTodos, ["todo", "category", "priority", "is_Completed", "createdAt"])
                    }
                    console.log("\nEnter exit to terminate")
                    let deleteIndex = await getSpecificDeleteIndex(allTodos);
                    if (deleteIndex == false) {
                        console.log(`${c.red}Exited${c.reset}`);
                        break;
                    }
                    try {
                        await deleteTodo(allTodos[deleteIndex].tid)
                        console.log(`${c.cyan}Successfully deleted${c.reset}`)
                    } catch (error) {
                        console.log("Error deleting todo", error)
                    }

                } else if (deleteKey == "2") {
                    let deleteSure = (await rl.question('Delete All Todos?[yes/no]: ')).toLowerCase();
                    if (deleteSure == "yes" || deleteSure == "" || deleteSure == "y") {
                        try {
                            await deleteAllTodo()
                            console.log(`${c.cyan}Successfully deleted All todos${c.reset}`)
                        } catch (Err) {
                            console.log("Error deleting all todos", error)
                        }

                    } else {
                        console.log(`${c.cyan}No Todos deleted${c.reset}`)
                    }

                } else if (deleteKey == "3") {
                    let deletePriority = await prioritySelection()
                    if (deletePriority == "default") {
                        deletePriority = "low"
                    } else if (deletePriority == "exit") {
                        break;
                    }
                    try {
                        await deleteSpecificPriorityTodos(deletePriority)
                        console.log(`${c.green}Successfully Deleted ${deletePriority[0].toUpperCase() + deletePriority.slice(1)} todos.\n${c.reset}`)
                    } catch (error) {
                        console.log("Error deleting specific priority todos", error)
                    }
                } else if (deleteKey == "4") {
                    let data = await getCategories()
                    let category = await categorySelection(data)
                    if (category == "default") {
                        category = "personal"
                    } else if (category == "exit") {
                        break;
                    }
                    await deleteSpecificCategoryTodos(category)
                    console.log(`${c.green}Successfully Deleted ${category} todos.\n${c.reset}`)
                } else {
                    console.log(`${c.red}Invalid Key! Please press a Valid key from below${c.reset}`)
                }
            }
        } else {
            console.log(`${c.red}Invalid Key! Please press a Valid key from below${c.reset}`)
        }

    }
    console.log(`\n${c.green}Program Closed${c.reset}`)
    rl.close();

}

start();



