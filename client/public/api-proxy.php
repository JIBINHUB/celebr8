<?php
// API Proxy — forwards /api/* requests to Node.js at localhost:5000
// Clean rebuild v3.0 — Celebr8 Events

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Stripe-Signature');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Build the target URL path
$path = $_SERVER['REQUEST_URI'];
$queryString = '';
if (strpos($path, '?') !== false) {
    list($path, $queryString) = explode('?', $path, 2);
}

// Strip /api-proxy.php prefix if present
if (strpos($path, '/api-proxy.php') === 0) {
    $path = substr($path, strlen('/api-proxy.php'));
}

// Ensure path starts with /api/
if (strpos($path, '/api') !== 0) {
    $path = '/api' . $path;
}

$backendUrl = 'http://127.0.0.1:5000' . $path;
if (!empty($queryString)) {
    $backendUrl .= '?' . $queryString;
}

$method = $_SERVER['REQUEST_METHOD'];
$inputBody = file_get_contents('php://input');

$headers = ['Content-Type: application/json'];
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}
if (isset($_SERVER['HTTP_STRIPE_SIGNATURE'])) {
    $headers[] = 'Stripe-Signature: ' . $_SERVER['HTTP_STRIPE_SIGNATURE'];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backendUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

if ($method === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $inputBody);
} elseif ($method === 'PUT') {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $inputBody);
} elseif ($method === 'DELETE') {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Backend unavailable: ' . $error]);
    exit;
}

http_response_code($httpCode);
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
echo $response;
