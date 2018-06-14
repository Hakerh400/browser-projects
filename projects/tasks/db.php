<?php
  include('header.php');

  $query = file_get_contents('php://input');
  $con = getCon();

  if(!$con->multi_query($query))
    err($con->error);

  $arr = [];

  do{
    $result = $con->store_result();
    $hasMore = $con->more_results();
    $error = $con->error;

    if($hasMore)
      $con->next_result();

    if($error)
      err($error);

    if($result)
      array_push($arr, $result->fetch_all(MYSQLI_ASSOC));
  }while($hasMore);

  succ($arr);
?>