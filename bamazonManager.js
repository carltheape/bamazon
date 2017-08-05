var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require('console.table');
var keys = require("./keys.js");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: keys.mysqlKey.password,
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    runBam();
});

function runBam() {

    // connection.query("SELECT * FROM products", function(err, res) {
    //     console.log("-----------------------------------");
    //     if (err) throw err;
    //     for (var i = 0; i < res.length; i++) {
    //         console.log(res[i].product_name + " $" + res[i].price + " ||ID:" + res[i].item_id + "||");
    //         // console.log("ID: "+res[i].item_id);
    //         // console.log("$"+res[i].price);
    //     }
    //     console.log("-----------------------------------");

    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View products",
                "View low inventory",
                "Add to inventory",
                "Add new product",
                "Quit"
            ]
        })
        .then(function(answer) {
            switch (answer.action) {
                case "View products":
                    viewPro();
                    break;

                case "View low inventory":
                    viewLow();
                    break;
                case "Add to inventory":
                    addInv();
                    break;
                case "Add new product":
                    addNew();
                    break;
                case "Quit":
                    quitBam();
                    break;
            }
        });
};

function viewPro() {
    process.stdout.write('\033c');
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var currentInv = [];
          // Log all results of the SELECT statement
        for (var i = 0; i < res.length; i++) {
            currentInv.push(res[i])

        }
                console.table("current inventory",
                    currentInv
                // item_name: res[i].product_name,
                // price: " $" + res[i].price,
                // ID: res[i].item_id,
                // STOCK: res[i].stock
            );
        console.log("-----------------------------------");
        runBam();
    });
};

function viewLow() {
    connection.query("SELECT * FROM products", function(err, res) {
        process.stdout.write('\033c');
        var lowInv = [];
        if (err) throw err;
        // Log all results of the SELECT statement
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock <= 5) {
                lowInv.push(res[i])
            };
        }
        console.table("Low Inventory",lowInv);
        console.log("-----------------------------------");
        runBam();

    })
};

function addInv() {
    process.stdout.write('\033c');
    connection.query("SELECT * FROM products", function(err, res) {
        var currentInv = [];
        if (err) throw err;
        // Log all results of the SELECT statement
        for (var i = 0; i < res.length; i++) {
            currentInv.push(res[i])
        }
        console.table("Current Inventory", currentInv);
        console.log("-----------------------------------");

        inquirer
            .prompt([{
                name: "itemAdd",
                type: "input",
                message: "What item do you want to add more of? (id#) "
            }, {
                name: "qty",
                type: "input",
                message: "how many do you want to add?"
            }]).then(function(answer) {


                connection.query("SELECT * FROM products WHERE item_id =" + answer.itemAdd, function(err, response) {
                    if (response.length <= 0) {
                        process.stdout.write('\033c');
                        console.log("*INVALID ENTRY*");
                        return runBam();
                    };
                    if (err) throw err;
                    for (var i = 0; i < response.length; i++) {
                        var currentQty = response[i].stock;
                        connection.query(
                            "UPDATE products SET ? WHERE ?", [{
                                    stock: parseInt(currentQty, 10) + parseInt(answer.qty, 10)
                                },
                                {
                                    item_id: answer.itemAdd.toLowerCase()
                                }
                            ],

                            function(err, res) {
                                if (err) throw err;
                                console.log("item updated!");
                                runBam()
                            })
                    }

                })
            })

    })
};

function addNew() {
    process.stdout.write('\033c');
    inquirer
        .prompt([{
            name: "itemNew",
            type: "input",
            message: "What is the name of this new product?"
        }, {
            name: "qty",
            type: "input",
            message: "how many do you want to add?"
        }, {
            name: "price",
            type: "input",
            message: "what is the price of this new item?"
        }, {
            name: "dept",
            type: "input",
            message: "what department does this new product belong to?"
        }]).then(function(answer) {
            var query = connection.query(
                "INSERT INTO products SET ?", {
                    product_name: answer.itemNew.toLowerCase(),
                    stock: parseInt(answer.qty, 10),
                    price: parseInt(answer.price, 10),
                    dept_name: answer.dept.toLowerCase()
                },
                function(err, res) {
                    if (err) throw err;
                    console.log(answer.itemNew + " added!");
                    // Call updateProduct AFTER the INSERT completes
                    runBam();
                }
            );

        })


};

function quitBam() {
    process.stdout.write('\033c');
    process.exit();
}