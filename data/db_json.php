<?php
  $db = new PDO('mysql:host=localhost;dbname=timemap;charset=utf8', 'root', 'abc123');

  $results = $db->query('SELECT * FROM time_events');
  $a = array();

  foreach($results as $result){
    $a[] = $result;
  }
  
  print_r(json_encode($a));
  
?>