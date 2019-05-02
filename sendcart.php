<?php
$to = 'olamideakomolafe@connarts.com';
$subject = 'ConnArts Order';

$content = $_POST;
$email_message = '';

$fullname = 'fullname';
$email_from = 'connarts website';
$phone = 'phone';
$email_message .= "Full Name: ".$content[$fullname]."\n";
$email_message .= "Email: ".$content[$email_from]."\n";
$email_message .= "Phone: ".$content[$phone]."\n";


$email_message .= "\n".'========================================================'."\n";
$email_message .= 'Has placed an order as per below:'."\n";

for($i=1; $i < $content['itemCount'] + 1; $i++) {
$name = 'item_name_'.$i;
$source = 'item_owner_'.$i;
$quantity = 'item_quantity_'.$i;
$price = 'item_price_'.$i;
$total = $content[$quantity]*$content[$price];
$grandTotal += $total;
$body .= 'Order #'.$i.': '.$content[$name].' --- Qty x '.$content[$quantity].' --- Unit Price $'.number_format($content[$price], 2, '.', '').' --- Subtotal $'.number_format($total, 2, '.', '')."\n";
$body .= '========================================================'."\n";
}

$headers = 'From: olamideakomolafe@connarts.com'."\r"."\n".
'Reply-To: olamideakomolafe@connarts.com' . "\r"."\n" .
'X-Mailer: PHP/' . phpversion();
mail($to, $subject, $body, $email_message, $headers);

Header('Location: index.html');
/**
 * 
 * Creating app... done, calm-bayou-17652
https://calm-bayou-17652.herokuapp.com/ | https://git.heroku.com/calm-bayou-17652.git

 */
?>
