<?php
header("Access-Control-allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
require "./config/connectdb.php";
statusConnectionDB();
?>