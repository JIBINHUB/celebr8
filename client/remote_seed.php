<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Hostinger Remote Seeder Bridge</h2>";

// Check Node Version
$node_version = shell_exec('node -v 2>&1');
echo "<p><strong>Node Version:</strong> $node_version</p>";

// Define the path to the backend directory
$backend_dir = realpath(__DIR__ . '/../backend');
echo "<p><strong>Backend Dir:</strong> $backend_dir</p>";

// Execute the Node seeding script
if ($backend_dir && file_exists("$backend_dir/seed.js")) {
    $command = "cd " . escapeshellarg($backend_dir) . " && npm install && node seed.js 2>&1";
    echo "<p><strong>Executing:</strong> $command</p>";
    
    $output = [];
    $return_var = 0;
    exec($command, $output, $return_var);
    
    echo "<h3>Output:</h3><pre>";
    echo implode("\n", $output);
    echo "</pre>";
    
    echo "<p><strong>Exit code:</strong> $return_var</p>";
} else {
    echo "<p><strong>Error:</strong> Backend directory or seed.js not found.</p>";
}
?>
