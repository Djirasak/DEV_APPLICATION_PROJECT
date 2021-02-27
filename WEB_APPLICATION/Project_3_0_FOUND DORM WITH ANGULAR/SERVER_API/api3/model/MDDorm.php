<?php
include_once '../config/connectdb.php';
function getAllDorm(){
    $conn = database();
    $sql = "SELECT * FROM view_dorm;";
    $result = mysqli_query($conn,$sql);
    $data =array();
    while($row = mysqli_fetch_assoc($result)){
        $dorm_item = array(
                "dorm_id"     => $row['dorm_id'],
                "dorm_name"   => $row['name'],
                "category"    => $row['category'],
                "zone"        => $row['zone'],
                "price"       => $row['price'],
                "tn_path"     => "http://".$_SERVER['HTTP_HOST']."/api3/assets/thumbnail/".$row['dorm_id'].".jpg",
                //http://localhost/api3/assets/thumbnail/d0001.jpg
                "modify_date" => $row['modify_date'],
        );
        array_push($data,$dorm_item);
    }
    mysqli_close($conn);
    return $data;

}


function getDorm($dorm_id){
    $conn = database();
    $sql = "SELECT * FROM view_dorm WHERE dorm_id = '".$dorm_id."';";
    $result = mysqli_query($conn,$sql);
    $data =array();
    while($row = mysqli_fetch_assoc($result)){
        $dorm_item = array(
                "dorm_id"       =>  $row["dorm_id"],
                "dorm_name"     =>  $row["name"],
                "category"      =>  $row["category"],
                "zone"          =>  $row["zone"],
                "price"         =>  $row["price"],
                "tel"           =>  $row["tel"],
                "line"          =>  $row["line"],
                "facebook"      =>  $row["facebook"],
                "description"   =>  $row["description"],
                "modify_date"   =>  $row["modify_date"],
        );
        array_push($data,$dorm_item);
    }
    mysqli_close($conn);
    return $data;
}
?>