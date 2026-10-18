const API = "http://127.0.0.1:8080";

let allAgents = [];


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    const selectedPage =
        document.getElementById(pageName);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    const pageTitle =
        document.getElementById("pageTitle");

    const titles = {
        dashboard: "Dashboard",
        agents: "AI Agents",
        categories: "Categories",
        hashing: "Hash Table"
    };

    if (pageTitle) {
        pageTitle.textContent =
            titles[pageName] || "Dashboard";
    }

    if (pageName === "dashboard") {
        loadStatistics();
    }

    if (pageName === "agents") {
        loadAgents();
    }

    if (pageName === "categories") {
        loadCategories();
        loadBSTTraversal("inorder");
        loadBSTTree();
    }

    if (pageName === "hashing") {
        loadHashTable();
    }
}


/* =========================================================
   ADD AGENT MODAL
   ========================================================= */

function openAddAgent() {

    const modal =
        document.getElementById("agentModal");

    if (modal) {
        modal.classList.add("show");
    }
}


function closeAddAgent() {

    const modal =
        document.getElementById("agentModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


/* =========================================================
   ADD AGENT
   ========================================================= */

async function addAgent() {

    const id =
        document.getElementById("agentId").value.trim();

    const name =
        document.getElementById("agentName").value.trim();

    const purpose =
        document.getElementById("agentPurpose").value.trim();

    const category =
        document.getElementById("agentCategory").value;

    const status =
        document.getElementById("agentStatus").value;


    if (!id || !name || !purpose) {

        alert("Please fill all fields.");

        return;
    }


    try {

        const response =
            await fetch(
                API + "/api/agents",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        id: Number(id),
                        name: name,
                        purpose: purpose,
                        category: category,
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok ||
            !data.success) {

            alert(
                data.message ||
                "Failed to add agent."
            );

            return;
        }


        alert(
            "Agent added successfully!"
        );


        closeAddAgent();


        document.getElementById(
            "agentId"
        ).value = "";

        document.getElementById(
            "agentName"
        ).value = "";

        document.getElementById(
            "agentPurpose"
        ).value = "";


        await loadAgents();
        await loadCategories();
        await loadBSTTraversal("inorder");
        await loadBSTTree();
        await loadHashTable();
        await loadStatistics();

    }
    catch (error) {

        console.error(error);

        alert(
            "Could not connect to backend."
        );
    }
}


/* =========================================================
   LOAD AGENTS
   ========================================================= */

async function loadAgents() {

    try {

        const response =
            await fetch(
                API + "/api/agents"
            );

        allAgents =
            await response.json();

        displayAgents(allAgents);

    }
    catch (error) {

        console.error(
            "Error loading agents:",
            error
        );
    }
}


/* =========================================================
   DISPLAY AGENTS
   ========================================================= */

function displayAgents(agents) {

    const table =
        document.getElementById(
            "agentTable"
        );

    if (!table) {
        return;
    }

    table.innerHTML = "";


    if (agents.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;">
                    No agents found
                </td>
            </tr>
        `;

        return;
    }


    agents.forEach(agent => {

        const firstLetter =
            agent.name
                ? agent.name.charAt(0).toUpperCase()
                : "?";


        const statusClass =
            agent.status.toLowerCase() === "active"
                ? "active"
                : "inactive";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${agent.id}</td>

            <td>
                <div class="agent-name">

                    <div class="agent-avatar">
                        ${firstLetter}
                    </div>

                    ${agent.name}

                </div>
            </td>

            <td>
                ${agent.purpose}
            </td>

            <td>
                <span class="category-tag">
                    ${agent.category}
                </span>
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${agent.status}
                </span>
            </td>

            <td>

                <button
                    class="action-button"
                    onclick="agentAction(
                        ${agent.id},
                        '${agent.status}'
                    )">

                    ⋮

                </button>

            </td>
        `;


        table.appendChild(row);

    });
}


/* =========================================================
   SEARCH AGENTS
   ========================================================= */

function searchAgents() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    const searchText =
        input.value
            .toLowerCase()
            .trim();


    if (searchText === "") {

        displayAgents(allAgents);

        return;
    }


    const filtered =
        allAgents.filter(agent => {

            return (
                String(agent.id)
                    .includes(searchText) ||

                agent.name
                    .toLowerCase()
                    .includes(searchText)
            );

        });


    displayAgents(filtered);
}


/* =========================================================
   AGENT ACTION
   ========================================================= */

async function agentAction(
    id,
    currentStatus
) {

    const choice =
        confirm(
            "Press OK to change the agent status.\n" +
            "Press Cancel to delete the agent."
        );


    if (choice) {

        const newStatus =
            currentStatus === "Active"
                ? "Inactive"
                : "Active";


        await updateAgentStatus(
            id,
            newStatus
        );
    }

    else {

        const confirmDelete =
            confirm(
                "Are you sure you want to delete the agent?"
            );


        if (confirmDelete) {
            await deleteAgent(id);
        }
    }
}


/* =========================================================
   UPDATE STATUS
   ========================================================= */

async function updateAgentStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                API +
                "/api/agents/" +
                id +
                "/status",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok ||
            !data.success) {

            alert(
                data.message ||
                "Failed to update status."
            );

            return;
        }


        await loadAgents();
        await loadStatistics();
        await loadHashTable();

    }
    catch (error) {

        console.error(error);

        alert(
            "Could not connect to backend."
        );
    }
}


/* =========================================================
   DELETE AGENT
   ========================================================= */

async function deleteAgent(id) {

    try {

        const response =
            await fetch(
                API + "/api/agents/" + id,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok ||
            !data.success) {

            alert(
                data.message ||
                "Failed to delete agent."
            );

            return;
        }


        alert(
            "Agent deleted successfully!"
        );


        await loadAgents();
        await loadHashTable();
        await loadStatistics();

    }
    catch (error) {

        console.error(error);

        alert(
            "Could not connect to backend."
        );
    }
}


/* =========================================================
   STATISTICS
   ========================================================= */

async function loadStatistics() {

    try {

        const agentResponse =
            await fetch(
                API + "/api/agents"
            );


        const agents =
            await agentResponse.json();


        const categoryResponse =
            await fetch(
                API + "/api/categories"
            );


        const categories =
            await categoryResponse.json();


        const totalAgents =
            document.getElementById(
                "totalAgents"
            );


        const activeAgents =
            document.getElementById(
                "activeAgents"
            );


        const totalCategories =
            document.getElementById(
                "totalCategories"
            );


        if (totalAgents) {

            totalAgents.textContent =
                agents.length;
        }


        if (activeAgents) {

            const activeCount =
                agents.filter(
                    agent =>
                        agent.status === "Active"
                ).length;


            activeAgents.textContent =
                activeCount;
        }


        if (totalCategories) {

            totalCategories.textContent =
                categories.length;
        }

    }
    catch (error) {

        console.error(
            "Error loading statistics:",
            error
        );
    }
}


/* =========================================================
   ADD CATEGORY MODAL
   ========================================================= */

function createCategoryModal() {

    if (
        document.getElementById(
            "categoryModal"
        )
    ) {
        return;
    }


    const modal =
        document.createElement("div");


    modal.id =
        "categoryModal";


    modal.className =
        "modal";


    modal.innerHTML = `

        <div class="modal-content">

            <div class="modal-header">

                <div>

                    <p class="small-title">
                        NEW ENTRY
                    </p>

                    <h2>
                        Add Category
                    </h2>

                </div>


                <button
                    class="close-button"
                    onclick="closeAddCategory()">

                    ×

                </button>

            </div>


            <div class="form">

                <label>
                    Category Name
                </label>


                <input
                    type="text"
                    id="newCategory"
                    placeholder="Example: Cybersecurity"
                >


                <button
                    class="submit-button"
                    onclick="submitCategory()">

                    Add Category

                </button>

            </div>

        </div>
    `;


    document.body.appendChild(modal);
}


/* =========================================================
   OPEN ADD CATEGORY
   ========================================================= */

function addCategory() {

    createCategoryModal();


    const modal =
        document.getElementById(
            "categoryModal"
        );


    modal.classList.add("show");


    const input =
        document.getElementById(
            "newCategory"
        );


    input.value = "";


    setTimeout(
        () => input.focus(),
        100
    );
}


/* =========================================================
   CLOSE ADD CATEGORY
   ========================================================= */

function closeAddCategory() {

    const modal =
        document.getElementById(
            "categoryModal"
        );


    if (modal) {
        modal.classList.remove("show");
    }
}


/* =========================================================
   SUBMIT CATEGORY
   ========================================================= */

async function submitCategory() {

    const input =
        document.getElementById(
            "newCategory"
        );


    const category =
        input.value.trim();


    if (category === "") {

        alert(
            "Please enter a category name."
        );

        input.focus();

        return;
    }


    try {

        const response =
            await fetch(
                API + "/api/categories",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        category: category
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok ||
            !data.success) {

            alert(
                data.message ||
                "Failed to add category."
            );

            return;
        }


        closeAddCategory();


        alert(
            "Category added successfully!"
        );


        await loadCategories();
        await loadBSTTraversal("inorder");
        await loadBSTTree();
        await loadStatistics();

    }
    catch (error) {

        console.error(error);

        alert(
            "Could not connect to backend."
        );
    }
}


/* =========================================================
   LOAD CATEGORIES
   ========================================================= */

async function loadCategories() {

    try {

        const response =
            await fetch(
                API + "/api/categories"
            );


        const categories =
            await response.json();


        updateCategoryDropdown(
            categories
        );

    }
    catch (error) {

        console.error(
            "Error loading categories:",
            error
        );
    }
}


/* =========================================================
   CATEGORY DROPDOWN
   ========================================================= */

function updateCategoryDropdown(
    categories
) {

    const select =
        document.getElementById(
            "agentCategory"
        );


    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = "";


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            category;


        option.textContent =
            category;


        select.appendChild(
            option
        );

    });


    if (
        categories.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;
    }
}


/* =========================================================
   BST TRAVERSAL
   ========================================================= */

async function loadBSTTraversal(
    order
) {

    try {

        const response =
            await fetch(
                API +
                "/api/categories/traversal?order=" +
                order
            );


        const categories =
            await response.json();


        displayTraversal(
            categories
        );


        setActiveTraversal(
            order
        );

    }
    catch (error) {

        console.error(
            "Error loading BST traversal:",
            error
        );
    }
}


/* =========================================================
   DISPLAY TRAVERSAL
   ========================================================= */

function displayTraversal(
    categories
) {

    const nodes =
        document.querySelector(
            ".bst-result .nodes"
        );


    if (!nodes) {
        return;
    }


    nodes.innerHTML = "";


    categories.forEach(
        category => {

            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                category;


            nodes.appendChild(
                span
            );

        }
    );
}


/* =========================================================
   TRAVERSAL BUTTON ACTIVE
   ========================================================= */

function setActiveTraversal(
    order
) {

    const buttons =
        document.querySelectorAll(
            ".traversal"
        );


    buttons.forEach(button => {

        button.classList.remove(
            "active"
        );


        const text =
            button.textContent
                .trim()
                .toLowerCase();


        if (text === order) {

            button.classList.add(
                "active"
            );
        }

    });
}


/* =========================================================
   LOAD ACTUAL BST TREE
   ========================================================= */

async function loadBSTTree() {

    try {

        const response =
            await fetch(
                API +
                "/api/categories/tree"
            );


        const tree =
            await response.json();


        drawCategoryTree(tree);

    }
    catch (error) {

        console.error(
            "Error loading BST tree:",
            error
        );
    }
}


/* =========================================================
   DRAW ACTUAL BST TREE
   ========================================================= */

/* =========================================================
   DRAW ACTUAL BST TREE
   ========================================================= */

/* =========================================================
   DRAW ACTUAL BST TREE
   ========================================================= */

function drawCategoryTree(tree) {

    const diagram =
        document.querySelector(".tree-diagram");

    if (!diagram) {
        return;
    }

    diagram.innerHTML = "";

    if (!tree || !tree.name) {
        return;
    }


    /* ---------------------------------------------------------
       TREE SETTINGS
       --------------------------------------------------------- */

    const diagramWidth = 700;
    const diagramHeight = 390;

    const nodeWidth = 120;
    const nodeHeight = 44;

    const verticalGap = 75;
    const horizontalGap = 35;


    diagram.style.width =
        diagramWidth + "px";

    diagram.style.height =
        diagramHeight + "px";


    /* ---------------------------------------------------------
       First find inorder order
       --------------------------------------------------------- */

    const inorderNodes = [];


    function getInorder(node) {

        if (!node) {
            return;
        }

        getInorder(node.left);

        inorderNodes.push(node);

        getInorder(node.right);
    }


    getInorder(tree);


    /* ---------------------------------------------------------
       Give every node a basic horizontal position
       based on inorder order.
       --------------------------------------------------------- */

    const positions =
        new Map();


    const totalNodes =
        inorderNodes.length;


    let spacing = 0;


    if (totalNodes > 1) {

        spacing =
            (diagramWidth - nodeWidth) /
            (totalNodes - 1);

    }


    inorderNodes.forEach(
        (node, index) => {

            positions.set(
                node.name,
                {
                    x:
                        index * spacing,

                    y: 0
                }
            );

        }
    );


    /* ---------------------------------------------------------
       Calculate vertical level
       --------------------------------------------------------- */

    function setDepth(
        node,
        depth
    ) {

        if (!node) {
            return;
        }


        const position =
            positions.get(
                node.name
            );


        position.y =
            15 +
            depth * verticalGap;


        setDepth(
            node.left,
            depth + 1
        );


        setDepth(
            node.right,
            depth + 1
        );
    }


    setDepth(
        tree,
        0
    );


    /* ---------------------------------------------------------
       Make every parent sit between its children
       --------------------------------------------------------- */

    function adjustParentPosition(
        node
    ) {

        if (!node) {
            return;
        }


        adjustParentPosition(
            node.left
        );


        adjustParentPosition(
            node.right
        );


        const current =
            positions.get(
                node.name
            );


        if (
            node.left &&
            node.right
        ) {

            const left =
                positions.get(
                    node.left.name
                );


            const right =
                positions.get(
                    node.right.name
                );


            current.x =
                (
                    left.x +
                    right.x
                ) / 2;
        }


        else if (node.left) {

            const left =
                positions.get(
                    node.left.name
                );


            current.x =
                left.x +
                45;
        }


        else if (node.right) {

            const right =
                positions.get(
                    node.right.name
                );


            current.x =
                right.x -
                45;
        }
    }


    adjustParentPosition(
        tree
    );


    /* ---------------------------------------------------------
       Center the complete tree
       --------------------------------------------------------- */

    const rootPosition =
        positions.get(
            tree.name
        );


    if (rootPosition) {

        const rootCenter =
            rootPosition.x +
            nodeWidth / 2;


        const desiredCenter =
            diagramWidth / 2;


        const offset =
            desiredCenter -
            rootCenter;


        positions.forEach(
            position => {

                position.x +=
                    offset;

            }
        );
    }


    /* ---------------------------------------------------------
       SVG
       --------------------------------------------------------- */

    const svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );


    svg.setAttribute(
        "width",
        diagramWidth
    );


    svg.setAttribute(
        "height",
        diagramHeight
    );


    svg.style.position =
        "absolute";


    svg.style.left =
        "0";


    svg.style.top =
        "0";


    svg.style.zIndex =
        "1";


    svg.style.pointerEvents =
        "none";


    diagram.appendChild(
        svg
    );


    /* ---------------------------------------------------------
       Draw parent-child lines
       --------------------------------------------------------- */

    function drawLine(
        parent,
        child
    ) {

        if (!child) {
            return;
        }


        const parentPosition =
            positions.get(
                parent.name
            );


        const childPosition =
            positions.get(
                child.name
            );


        if (
            !parentPosition ||
            !childPosition
        ) {
            return;
        }


        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        line.setAttribute(
            "x1",
            parentPosition.x +
            nodeWidth / 2
        );


        line.setAttribute(
            "y1",
            parentPosition.y +
            nodeHeight
        );


        line.setAttribute(
            "x2",
            childPosition.x +
            nodeWidth / 2
        );


        line.setAttribute(
            "y2",
            childPosition.y
        );


        line.setAttribute(
            "stroke",
            "#cbd5e1"
        );


        line.setAttribute(
            "stroke-width",
            "2"
        );


        svg.appendChild(
            line
        );


        drawLine(
            child,
            child.left
        );


        drawLine(
            child,
            child.right
        );
    }


    drawLine(
        tree,
        tree.left
    );


    drawLine(
        tree,
        tree.right
    );


    /* ---------------------------------------------------------
       Create nodes
       --------------------------------------------------------- */

    function createNodes(
        node,
        depth
    ) {

        if (!node) {
            return;
        }


        const position =
            positions.get(
                node.name
            );


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "tree-node";


        element.textContent =
            node.name;


        element.style.left =
            position.x + "px";


        element.style.top =
            position.y + "px";


        element.style.width =
            nodeWidth + "px";


        element.style.height =
            nodeHeight + "px";


        element.style.boxSizing =
            "border-box";


        element.style.zIndex =
            "2";


        /* Root appearance */

        if (depth === 0) {

            element.style.background =
                "#6366f1";

            element.style.borderColor =
                "#6366f1";

            element.style.color =
                "white";
        }


        diagram.appendChild(
            element
        );


        createNodes(
            node.left,
            depth + 1
        );


        createNodes(
            node.right,
            depth + 1
        );
    }


    createNodes(
        tree,
        0
    );
}


/* =========================================================
   HASH TABLE
   ========================================================= */

async function loadHashTable() {

    try {

        const response =
            await fetch(
                API + "/api/hash-table"
            );


        const table =
            await response.json();


        displayHashTable(
            table
        );

    }
    catch (error) {

        console.error(
            "Error loading hash table:",
            error
        );
    }
}


/* =========================================================
   DISPLAY HASH TABLE
   ========================================================= */

function displayHashTable(
    table
) {

    const hashTable =
        document.querySelector(
            ".hash-table"
        );


    if (!hashTable) {
        return;
    }


    hashTable.innerHTML = `

        <div class="hash-header">

            <span>Bucket</span>

            <span>Chain</span>

        </div>
    `;


    table.forEach(
        bucket => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "hash-row";


            let chainHTML =
                "";


            if (
                !bucket.agents ||
                bucket.agents.length === 0
            ) {

                chainHTML =
                    `<span class="empty">
                        Empty
                    </span>`;
            }

            else {

                chainHTML =
                    `<div class="chain">`;


                bucket.agents.forEach(
                    (agent, index) => {

                        chainHTML += `

                            <span
                                class="hash-node">

                                ${agent.id}

                            </span>
                        `;


                        if (
                            index <
                            bucket.agents.length - 1
                        ) {

                            chainHTML += `

                                <span class="arrow">
                                    →
                                </span>
                            `;
                        }

                    }
                );


                chainHTML += `

                    <span class="arrow">
                        →
                    </span>

                    <span class="empty">
                        NULL
                    </span>

                    </div>
                `;
            }


            row.innerHTML = `

                <span class="bucket">
                    ${bucket.index}
                </span>

                ${chainHTML}
            `;


            hashTable.appendChild(
                row
            );

        }
    );
}


/* =========================================================
   REFRESH EVERYTHING
   ========================================================= */

async function refreshAll() {

    await loadAgents();

    await loadCategories();

    await loadBSTTraversal(
        "inorder"
    );

    await loadBSTTree();

    await loadHashTable();

    await loadStatistics();
}


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* -----------------------------------------
           Traversal buttons
           ----------------------------------------- */

        const traversalButtons =
            document.querySelectorAll(
                ".traversal"
            );


        traversalButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const order =
                            button.textContent
                                .trim()
                                .toLowerCase();


                        loadBSTTraversal(
                            order
                        );

                    }
                );

            }
        );


        /* -----------------------------------------
           Add Category button
           ----------------------------------------- */

        const categoryButtons =
            document.querySelectorAll(
                "#categories .primary-button"
            );


        categoryButtons.forEach(
            button => {

                button.onclick =
                    addCategory;

            }
        );


        /* -----------------------------------------
           Load everything
           ----------------------------------------- */

        refreshAll();

    }
);