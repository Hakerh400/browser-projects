<?php
  function succ($data){
    echo json_encode([
      'data' => $data,
      'error' => null,
    ]);

    finish();
  }

  function err($msg){
    if(substr($msg, 0, 134) == 'You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ')
      $msg = substr($msg, 134);

    echo json_encode([
      'data' => null,
      'error' => $msg,
    ]);

    finish();
  }

  function finish(){
    global $con;

    if($con)
      $con->close();

    exit;
  }
?>