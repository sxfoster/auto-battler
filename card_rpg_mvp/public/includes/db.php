<?php
// includes/db.php

class Database {
    private $host = 'localhost'; // Usually 'localhost' on shared hosting
    private $db_name = 'card_rpg_game'; // Your database name from Task 1.1
    private $username = 'rpg_game'; // Replace with your MySQL username
    private $password = '8qVALVI#KUDL'; // Replace with your MySQL password
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                                  $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo json_encode(["message" => "Connection error: " . $exception->getMessage()]);
            exit(); // Stop execution on database connection failure
        }
        return $this->conn;
    }
}
?>
