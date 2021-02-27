<?php
header("Access-Control-allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
require '../model/MDDorm.php';
if(!(isset($_GET['dorm_id']))){
    echo json_encode(array("status" => "ok", "data" => getAllDorm()));
}else{
    echo json_encode(array("status" => "ok", "data" => getDorm($_GET['dorm_id'])));
}
?>