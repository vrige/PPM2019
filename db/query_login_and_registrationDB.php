<?php
header('Access-Control-Allow-Origin: *');
require_once('config.php');
?>
<?php
if(isset($_POST)){
    $sender = $_POST['sender'];
    $mynickname = mysqli_real_escape_string($conn,$_POST['nickname']);
    $mypassword = mysqli_real_escape_string($conn,$_POST['password']);


    ///////////////////////////REGISTRATION/////////////////////////////////////
    if($sender == 'registration') {

        $sql_check = "SELECT * FROM users WHERE nickname = '$mynickname' ";
        $result = mysqli_query($conn,$sql_check);
        $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
        $count = mysqli_num_rows($result);

        if($count == 1) {
            $data = array("nickname" => "$mynickname", "alreadyInDB" => "true");
            echo json_encode($data);
        }else {
            $sql = "INSERT INTO users (nickname, password) VALUES ('".$mynickname."','".$mypassword."')";
            if (mysqli_query($conn, $sql)) {
                $data = array("nickname" => "$mynickname", "alreadyInDB" => "false");
                echo json_encode($data);
            } else {
                echo "Error: " . $sql . "<br>" . mysqli_error($conn);
            }
        }
    }



    ///////////////////////////LOGIM/////////////////////////////////////
    if($sender == 'login') {

        $sql = "SELECT * FROM users WHERE nickname = '$mynickname' AND password = '$mypassword' ";

        $result = mysqli_query($conn,$sql);
        $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
        $count = mysqli_num_rows($result);

        if($count == 1) {

            $data = array("nickname" => "$mynickname", "valid" => "true");
            echo json_encode($data);

        }else {
            $data = array("nickname" => "$mynickname", "valid" => "false");
            echo json_encode($data);

        }


    }

    mysqli_close($conn);
}