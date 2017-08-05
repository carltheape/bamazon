var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require('console.table');
var keys = require("./keys.js");
var currentQty = 0;
var currentCost = 0;

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

    connection.query("SELECT * FROM products", function(err, res) {
        console.log("-----------------------------------");
        var currentInv = [];
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            currentInv.push(res[i])
            // console.log("ID: "+res[i].item_id);
            // console.log("$"+res[i].price);
        }
        console.table("currently for sale",currentInv);
        console.log("-----------------------------------");

        inquirer
            .prompt({
                name: "action",
                type: "list",
                message: "What would you like to do?",
                choices: [
                    "Buy",
                    "Quit Bamazon"
                ]
            })
            .then(function(answer) {
                switch (answer.action) {
                    case "Buy":
                        purchase();
                        break;

                    case "Quit Bamazon":
                        quitBam();
                        break;
                }
            });
    })
};

function purchase() {
    inquirer
        .prompt([{
            name: "itemBuy",
            type: "input",
            message: "What item do you want to buy? (id#) "
        }, {
            name: "qty",
            type: "input",
            message: "how many do you want to purchase?"
        }]).then(function(answer) {
            connection.query("SELECT * FROM products WHERE item_id =" + answer.itemBuy, function(err, response) {
                if (response.length <=0){process.stdout.write('\033c');console.log("*INVALID ENTRY*"); return purchase();
                runBam()};
                if (err) throw err;
                for (var i = 0; i < response.length; i++) {
                    var currentQty = response[i].stock;
                    var currentCost = response[i].price;
                    if (answer.qty <= currentQty) {
                        connection.query(
                            "UPDATE products SET ? WHERE ?", [{
                                    stock: currentQty - answer.qty
                                },
                                {
                                    item_id: answer.itemBuy
                                }
                            ],
                    
                    function(err, res) {
                        if (err) throw err;
                        console.log("item purchased!");
                        console.log("Your purchase was: $ "+currentCost*answer.qty);
                        runBam()
                    })} else { console.log("insufficient supply");
                    runBam() };
                
            }});
        });

};

function quitBam(){
	process.stdout.write('\033c');
	process.exit();
}