<?php
header('Access-Control-Allow-Origin: *');
require_once('config.php');
?>
<?php
if(isset($_POST)){
    error_reporting(0);//serve per evitare il notice array to string che finisce nell'echo
    $sender = $_POST['sender'];
    $mynickname = mysqli_real_escape_string($conn,$_POST['nickname']);
    $opera = $_POST['opera'];


    ////////////////////////SALVA DETTAGLIO//////////////////////
    if($sender == 'saveDetail') {
        $dettaglio = $_POST[dettaglio];

        $dettaglio_obj = json_decode($dettaglio);
        $dettaglio_nome = $dettaglio_obj->nome;

        $sql_check = "SELECT dettaglio FROM dettagli WHERE nickname = '$mynickname' AND opera = '$opera' ";


        $result = mysqli_query($conn,$sql_check);

        $count = 0;

        while($row = $result->fetch_assoc()) {

            $dettaglio_obbb = json_decode($row["dettaglio"]);

            if($dettaglio_obbb->nome === $dettaglio_nome){
                $count = 1;
                break;
            }
        }

        if($count >= 1) {
            $data = array("nickname" => "$mynickname", "alreadyInDB" => "true");
            echo json_encode($data);
        }else{
            $sql = "INSERT INTO dettagli (nickname, opera, dettaglio) VALUES ('".$mynickname."','".$opera."','".$dettaglio."')";

            if (mysqli_query($conn, $sql)) {
                $data = array("nickname" => "$mynickname", "alreadyInDB" => "false");
                echo json_encode($data);
            } else {
                echo "Error: " . $sql . "<br>" . mysqli_error($conn);
            }
        }
    }


    ////////////////////////CARICA DETTAGLI//////////////////////
    if($sender == 'loadDetail') {
        $sql = "SELECT dettaglio FROM dettagli WHERE nickname = '$mynickname' AND opera = '$opera' ";

        $result = mysqli_query($conn,$sql);

        if ($result->num_rows > 0) {

            $solutions = array();

            while($row = $result->fetch_assoc()) {
                $dettaglio_obj = json_decode($row["dettaglio"]);

                $solutions[] = array(
                    "nome" => $dettaglio_obj->nome,
                    "descrizione" => $dettaglio_obj->descrizione,
                    "x" => $dettaglio_obj->x,
                    "y" => $dettaglio_obj->y,
                    "width" => $dettaglio_obj->width,
                    "height" => $dettaglio_obj->height
                );
            }
            echo json_encode($solutions);

        } else {
            echo "0 results";
        }
    }



    ////////////////////////MODIFICA DETTAGLIO//////////////////////
    if($sender == 'modifyDetail') {

        $modifica = $_POST[modifica];
        $modifica_obj = json_decode($modifica);
        $modifica_old_nome = $modifica_obj->old_nome;
        $modifica_nome= $modifica_obj->nome;
        $modifica_descrizione = $modifica_obj->descrizione;

        $data = array("old_name"=>"$modifica_old_nome","oldNameisInDB" => "false","newNameisInDB" => "false", "modifyNome"=>"false", "modifyDescrizione"=>"false");

        $sql_check_new_name = "SELECT * FROM dettagli WHERE nickname = '$mynickname' AND opera = '$opera' ";
        $result2 = mysqli_query($conn,$sql_check_new_name);

        while($row2 = $result2->fetch_assoc()) {

            $dettaglio_obj2 = json_decode($row2["dettaglio"]);

            if( $dettaglio_obj2->nome === $modifica_nome){
                $data["newNameisInDB"] = "true";

            }
        }

        if($data["newNameisInDB"] === "false"){

            $sql_check_old_name = "SELECT * FROM dettagli WHERE nickname = '$mynickname' AND opera = '$opera' ";

            $result = mysqli_query($conn,$sql_check_old_name);


            if ($result->num_rows > 0) {

                while($row = $result->fetch_assoc()) {

                    $dettaglio_obj = json_decode($row["dettaglio"]);

                    if( $dettaglio_obj->nome === $modifica_old_nome){

                        $data["oldNameisInDB"] = "true";

                        if($modifica_old_nome !== $modifica_nome){
                            $dettaglio_obj->nome = $modifica_nome;
                            $data["modifyNome"] = "true";
                        }
                        if($modifica_descrizione !== $dettaglio_obj->descrizione){
                            $dettaglio_obj->descrizione = $modifica_descrizione;
                            $data["modifyDescrizione"] = "true";
                        }
                        $dettaglio_JSON = json_encode($dettaglio_obj);
                        $sql_update = "UPDATE dettagli
                                           SET dettaglio = '$dettaglio_JSON'
                                           WHERE nickname = '$mynickname' AND opera = '$opera' AND id = '$row[id]'";
                        $result2 = mysqli_query($conn,$sql_update);

                        break;
                    }
                }
            }

        }
        echo json_encode($data);
    }



    ////////////////////////ELIMINA DETTAGLI//////////////////////
    if($sender == 'deleteDetail') {
        $nome = $_POST[nome];
        $sql = "SELECT dettaglio FROM dettagli WHERE nickname = '$mynickname' AND opera = '$opera' ";

        $result = mysqli_query($conn,$sql);
        $data = array("nome"=>"$nome","deleteFromDB" => "false");

        if ($result->num_rows > 0) {

            while($row = $result->fetch_assoc()) {
                $dettaglio_obj = json_decode($row["dettaglio"]);

                if( $dettaglio_obj->nome == $nome){
                    $sql_delete = "DELETE FROM dettagli WHERE nickname = '$mynickname' AND opera = '$opera' AND dettaglio = '$row[dettaglio]'";
                    $result2 = mysqli_query($conn,$sql_delete);
                    $data = array("nome"=>"$nome","deleteFromDB" => "true");
                    break;
                }
            }
        }
        echo json_encode($data);
    }


    mysqli_close($conn);
}
