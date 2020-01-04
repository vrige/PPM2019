<?php
$db_user = "id11750818_ppm_2019";
$db_pass = 'ppm_2019!';
$db_name = "id11750818_ppm_2019";

// Create connection
$conn = new mysqli("localhost", $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
