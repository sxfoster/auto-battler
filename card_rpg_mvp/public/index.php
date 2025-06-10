<?php
// public/index.php

// Define basic paths for our project
define('ROOT_PATH', dirname(__DIR__));
define('PUBLIC_PATH', __DIR__);
define('INCLUDES_PATH', ROOT_PATH . '/includes');

// Basic error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set content type for JSON responses
header('Content-Type: application/json');

// Simple routing based on URL path
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathSegments = explode('/', trim($requestUri, '/'));

// Define the API base path if necessary, adjust for your GoDaddy domain/subfolder
// For example, if your app is at example.com/mygame/, then $apiBase = 'mygame/api';
$apiBase = 'api'; // Assuming your APIs will be under /api/

if (!empty($pathSegments) && $pathSegments[0] === $apiBase) {
    array_shift($pathSegments); // Remove 'api' segment
    $endpoint = $pathSegments[0] ?? ''; // Get the main endpoint (e.g., 'champions', 'player', 'battle')
    $action = $pathSegments[1] ?? ''; // Get action (e.g., 'setup', 'simulate', 'status')

    // Include the API handler
    require_once INCLUDES_PATH . '/api_handler.php';
    handleApiRequest($endpoint, $action);

} else {
    // For non-API requests, serve the main HTML file (frontend will handle routing)
    // For MVP, this might just be an empty HTML file that loads our JS
    header('Content-Type: text/html');
    echo file_get_contents(PUBLIC_PATH . '/index.html');
}

?>
