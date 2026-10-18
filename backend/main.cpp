#include <iostream>
#include <string>
#include "httplib.h"
#include "json.hpp"

using namespace std;
using json = nlohmann::json;

const int TABLE_SIZE = 10;

/* =========================================================
   BST - CATEGORY TREE
   ========================================================= */

struct CategoryNode
{
    string data;
    CategoryNode *left;
    CategoryNode *right;
};

CategoryNode *newCategoryNode(string category)
{
    CategoryNode *newNode = new CategoryNode();

    newNode->data = category;
    newNode->left = nullptr;
    newNode->right = nullptr;

    return newNode;
}

CategoryNode *insertCategory(
    CategoryNode *root,
    string category)
{
    if (root == nullptr)
        return newCategoryNode(category);

    if (category < root->data)
        root->left =
            insertCategory(root->left, category);

    else if (category > root->data)
        root->right =
            insertCategory(root->right, category);

    return root;
}

CategoryNode *findCategory(
    CategoryNode *root,
    string category)
{
    if (root == nullptr ||
        root->data == category)
        return root;

    if (category < root->data)
        return findCategory(
            root->left,
            category);

    return findCategory(
        root->right,
        category);
}

bool containsCategory(
    CategoryNode *root,
    string category)
{
    return findCategory(
               root,
               category) != nullptr;
}

/* =========================================================
   BST TRAVERSALS
   ========================================================= */

void printInOrder(
    CategoryNode *root,
    json &result)
{
    if (root == nullptr)
        return;

    printInOrder(root->left, result);

    result.push_back(root->data);

    printInOrder(root->right, result);
}

void printPreOrder(
    CategoryNode *root,
    json &result)
{
    if (root == nullptr)
        return;

    result.push_back(root->data);

    printPreOrder(root->left, result);

    printPreOrder(root->right, result);
}

void printPostOrder(
    CategoryNode *root,
    json &result)
{
    if (root == nullptr)
        return;

    printPostOrder(root->left, result);

    printPostOrder(root->right, result);

    result.push_back(root->data);
}

/* =========================================================
   BST - SEND ACTUAL TREE STRUCTURE TO FRONTEND
   ========================================================= */

void buildCategoryTree(
    CategoryNode *root,
    json &result)
{
    if (root == nullptr)
    {
        result = nullptr;
        return;
    }

    result["name"] = root->data;

    if (root->left != nullptr)
    {
        result["left"] = json::object();

        buildCategoryTree(
            root->left,
            result["left"]);
    }
    else
    {
        result["left"] = nullptr;
    }

    if (root->right != nullptr)
    {
        result["right"] = json::object();

        buildCategoryTree(
            root->right,
            result["right"]);
    }
    else
    {
        result["right"] = nullptr;
    }
}

/* =========================================================
   HASH TABLE - AGENTS
   SEPARATE CHAINING
   ========================================================= */

struct AgentNode
{
    int id;
    string name;
    string purpose;
    string category;
    string status;

    AgentNode *next;
};

int hashFn(
    int key,
    int tableSize)
{
    return key % tableSize;
}

void insertChain(
    AgentNode *table[],
    int size,
    int id,
    string name,
    string purpose,
    string category,
    string status)
{
    int i = hashFn(id, size);

    AgentNode *newNode =
        new AgentNode();

    newNode->id = id;
    newNode->name = name;
    newNode->purpose = purpose;
    newNode->category = category;
    newNode->status = status;

    newNode->next = table[i];

    table[i] = newNode;
}

AgentNode *searchChain(
    AgentNode *table[],
    int size,
    int id)
{
    int i = hashFn(id, size);

    AgentNode *temp = table[i];

    while (temp != nullptr)
    {
        if (temp->id == id)
            return temp;

        temp = temp->next;
    }

    return nullptr;
}

bool deleteChain(
    AgentNode *table[],
    int size,
    int id)
{
    int i = hashFn(id, size);

    AgentNode *temp = table[i];

    AgentNode *previous = nullptr;

    while (temp != nullptr)
    {
        if (temp->id == id)
        {
            if (previous == nullptr)
                table[i] = temp->next;

            else
                previous->next = temp->next;

            delete temp;

            return true;
        }

        previous = temp;

        temp = temp->next;
    }

    return false;
}

bool updateAgent(
    AgentNode *table[],
    int size,
    int id,
    string status)
{
    AgentNode *agent =
        searchChain(
            table,
            size,
            id);

    if (agent == nullptr)
        return false;

    agent->status = status;

    return true;
}

/* =========================================================
   CORS
   ========================================================= */

void setCors(
    httplib::Response &res)
{
    res.set_header(
        "Access-Control-Allow-Origin",
        "*");

    res.set_header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS");

    res.set_header(
        "Access-Control-Allow-Headers",
        "Content-Type");
}

/* =========================================================
   MAIN
   ========================================================= */

int main()
{
    CategoryNode *categoryRoot =
        nullptr;

    AgentNode *agentTable[TABLE_SIZE];

    for (int i = 0;
         i < TABLE_SIZE;
         i++)
    {
        agentTable[i] = nullptr;
    }

    /* =====================================================
       INITIAL CATEGORIES
       ===================================================== */

    categoryRoot =
        insertCategory(
            categoryRoot,
            "Education");

    categoryRoot =
        insertCategory(
            categoryRoot,
            "Coding");

    categoryRoot =
        insertCategory(
            categoryRoot,
            "Data Science");

    categoryRoot =
        insertCategory(
            categoryRoot,
            "Research");

    categoryRoot =
        insertCategory(
            categoryRoot,
            "Writing");

    /* =====================================================
       INITIAL AGENTS
       ===================================================== */

    insertChain(
        agentTable,
        TABLE_SIZE,
        101,
        "CodeAssist",
        "Helps with programming tasks",
        "Coding",
        "Active");

    insertChain(
        agentTable,
        TABLE_SIZE,
        102,
        "StudyMate",
        "Helps students with learning",
        "Education",
        "Active");

    insertChain(
        agentTable,
        TABLE_SIZE,
        103,
        "ResearchBot",
        "Assists with research work",
        "Research",
        "Active");

    insertChain(
        agentTable,
        TABLE_SIZE,
        104,
        "DataBot",
        "Analyzes data",
        "Data Science",
        "Inactive");

    httplib::Server svr;

    /* =====================================================
       CORS OPTIONS
       ===================================================== */

    svr.Options(
        R"(.*)",
        [](const httplib::Request &req,
           httplib::Response &res)
        {
            setCors(res);

            res.status = 200;
        });

    /* =====================================================
       HEALTH CHECK
       ===================================================== */

    svr.Get(
        "/api/health",
        [](const httplib::Request &req,
           httplib::Response &res)
        {
            setCors(res);

            json result;

            result["status"] =
                "Backend running";

            result["message"] =
                "AI Agent Task Registry API is working";

            res.set_content(
                result.dump(),
                "application/json");
        });

    /* =====================================================
       GET ALL AGENTS
       ===================================================== */

    svr.Get(
        "/api/agents",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            json agents =
                json::array();

            for (int i = 0;
                 i < TABLE_SIZE;
                 i++)
            {
                AgentNode *temp =
                    agentTable[i];

                while (temp != nullptr)
                {
                    json agent;

                    agent["id"] =
                        temp->id;

                    agent["name"] =
                        temp->name;

                    agent["purpose"] =
                        temp->purpose;

                    agent["category"] =
                        temp->category;

                    agent["status"] =
                        temp->status;

                    agents.push_back(agent);

                    temp =
                        temp->next;
                }
            }

            res.set_content(
                agents.dump(),
                "application/json");
        });

    /* =====================================================
       SEARCH AGENT
       ===================================================== */

    svr.Get(
        R"(/api/agents/(\d+))",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            int id =
                stoi(req.matches[1]);

            AgentNode *agent =
                searchChain(
                    agentTable,
                    TABLE_SIZE,
                    id);

            if (agent == nullptr)
            {
                res.status = 404;

                json result;

                result["success"] =
                    false;

                result["message"] =
                    "Agent not found";

                res.set_content(
                    result.dump(),
                    "application/json");

                return;
            }

            json result;

            result["id"] =
                agent->id;

            result["name"] =
                agent->name;

            result["purpose"] =
                agent->purpose;

            result["category"] =
                agent->category;

            result["status"] =
                agent->status;

            res.set_content(
                result.dump(),
                "application/json");
        });

    /* =====================================================
       ADD AGENT
       ===================================================== */

    svr.Post(
        "/api/agents",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            try
            {
                json data =
                    json::parse(req.body);

                int id =
                    data["id"];

                if (
                    searchChain(
                        agentTable,
                        TABLE_SIZE,
                        id) != nullptr)
                {
                    res.status = 400;

                    json result;

                    result["success"] =
                        false;

                    result["message"] =
                        "Agent ID already exists";

                    res.set_content(
                        result.dump(),
                        "application/json");

                    return;
                }

                string name =
                    data["name"];

                string purpose =
                    data["purpose"];

                string category =
                    data["category"];

                string status =
                    data["status"];

                insertChain(
                    agentTable,
                    TABLE_SIZE,
                    id,
                    name,
                    purpose,
                    category,
                    status);

                /*
                   If a new category is used
                   while adding an agent,
                   automatically insert it
                   into the BST.
                */

                if (
                    !containsCategory(
                        categoryRoot,
                        category))
                {
                    categoryRoot =
                        insertCategory(
                            categoryRoot,
                            category);
                }

                json result;

                result["success"] =
                    true;

                result["message"] =
                    "Agent added successfully";

                res.set_content(
                    result.dump(),
                    "application/json");
            }

            catch (...)
            {
                res.status = 400;

                json result;

                result["success"] =
                    false;

                result["message"] =
                    "Invalid data";

                res.set_content(
                    result.dump(),
                    "application/json");
            }
        });

    /* =====================================================
       UPDATE AGENT STATUS
       ===================================================== */

    svr.Put(
        R"(/api/agents/(\d+)/status)",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            int id =
                stoi(req.matches[1]);

            try
            {
                json data =
                    json::parse(req.body);

                string status =
                    data["status"];

                bool updated =
                    updateAgent(
                        agentTable,
                        TABLE_SIZE,
                        id,
                        status);

                json result;

                if (updated)
                {
                    result["success"] =
                        true;

                    result["message"] =
                        "Agent status updated";

                    res.set_content(
                        result.dump(),
                        "application/json");
                }

                else
                {
                    res.status = 404;

                    result["success"] =
                        false;

                    result["message"] =
                        "Agent not found";

                    res.set_content(
                        result.dump(),
                        "application/json");
                }
            }

            catch (...)
            {
                res.status = 400;

                json result;

                result["success"] =
                    false;

                result["message"] =
                    "Invalid data";

                res.set_content(
                    result.dump(),
                    "application/json");
            }
        });

    /* =====================================================
       DELETE AGENT
       ===================================================== */

    svr.Delete(
        R"(/api/agents/(\d+))",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            int id =
                stoi(req.matches[1]);

            bool deleted =
                deleteChain(
                    agentTable,
                    TABLE_SIZE,
                    id);

            json result;

            if (deleted)
            {
                result["success"] =
                    true;

                result["message"] =
                    "Agent deleted successfully";
            }

            else
            {
                res.status = 404;

                result["success"] =
                    false;

                result["message"] =
                    "Agent not found";
            }

            res.set_content(
                result.dump(),
                "application/json");
        });

    /* =====================================================
       GET CATEGORIES
       ===================================================== */

    svr.Get(
        "/api/categories",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            json categories =
                json::array();

            printInOrder(
                categoryRoot,
                categories);

            res.set_content(
                categories.dump(),
                "application/json");
        });

    /* =====================================================
       ADD CATEGORY
       ===================================================== */

    svr.Post(
        "/api/categories",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            try
            {
                json data =
                    json::parse(req.body);

                string category =
                    data["category"];

                if (category.empty())
                {
                    res.status = 400;

                    json result;

                    result["success"] =
                        false;

                    result["message"] =
                        "Category name cannot be empty";

                    res.set_content(
                        result.dump(),
                        "application/json");

                    return;
                }

                if (
                    containsCategory(
                        categoryRoot,
                        category))
                {
                    res.status = 400;

                    json result;

                    result["success"] =
                        false;

                    result["message"] =
                        "Category already exists";

                    res.set_content(
                        result.dump(),
                        "application/json");

                    return;
                }

                /*
                   ACTUAL BST INSERTION
                */

                categoryRoot =
                    insertCategory(
                        categoryRoot,
                        category);

                json result;

                result["success"] =
                    true;

                result["message"] =
                    "Category added successfully";

                res.set_content(
                    result.dump(),
                    "application/json");
            }

            catch (...)
            {
                res.status = 400;

                json result;

                result["success"] =
                    false;

                result["message"] =
                    "Invalid data";

                res.set_content(
                    result.dump(),
                    "application/json");
            }
        });

    /* =====================================================
       GET ACTUAL BST TREE
       ===================================================== */

    svr.Get(
        "/api/categories/tree",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            json result;

            /*
               Send the REAL BST structure
               to JavaScript.
            */

            buildCategoryTree(
                categoryRoot,
                result);

            res.set_content(
                result.dump(),
                "application/json");
        });

    /* =====================================================
       BST TRAVERSAL
       ===================================================== */

    svr.Get(
        "/api/categories/traversal",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            string order =
                "inorder";

            if (req.has_param("order"))
            {
                order =
                    req.get_param_value(
                        "order");
            }

            json result =
                json::array();

            if (order == "preorder")
            {
                printPreOrder(
                    categoryRoot,
                    result);
            }

            else if (order == "postorder")
            {
                printPostOrder(
                    categoryRoot,
                    result);
            }

            else
            {
                printInOrder(
                    categoryRoot,
                    result);
            }

            res.set_content(
                result.dump(),
                "application/json");
        });

    /* =====================================================
       HASH TABLE DISPLAY
       ===================================================== */

    svr.Get(
        "/api/hash-table",
        [&](const httplib::Request &req,
            httplib::Response &res)
        {
            setCors(res);

            json table =
                json::array();

            for (int i = 0;
                 i < TABLE_SIZE;
                 i++)
            {
                json bucket;

                bucket["index"] =
                    i;

                bucket["agents"] =
                    json::array();

                AgentNode *temp =
                    agentTable[i];

                while (temp != nullptr)
                {
                    json agent;

                    agent["id"] =
                        temp->id;

                    agent["name"] =
                        temp->name;

                    bucket["agents"]
                        .push_back(agent);

                    temp =
                        temp->next;
                }

                table.push_back(bucket);
            }

            res.set_content(
                table.dump(),
                "application/json");
        });

    /* =====================================================
       SERVER START
       ===================================================== */

    cout << endl;

    cout << "===================================="
         << endl;

    cout << " AI Agent Task Registry Backend"
         << endl;

    cout << "===================================="
         << endl;

    cout << "Server running at:"
         << endl;

    cout << "http://127.0.0.1:8080"
         << endl;

    cout << endl;

    svr.listen(
        "127.0.0.1",
        8080);

    return 0;
}