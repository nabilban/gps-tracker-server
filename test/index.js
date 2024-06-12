const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "46.17.173.186",
  user: "u9479210_gps_tracker_user",
  password: "*(qn&Fv8h60%",
  database: "u9479210_gps_tracker",
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});

connection.end();
