<?php
// public/index.php

// Basic error reporting for development (keep this)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set content type for HTML responses for the main page
header('Content-Type: text/html');

// Serve the main HTML file for the frontend application
echo file_get_contents(__DIR__ . '/index.html');
?>
