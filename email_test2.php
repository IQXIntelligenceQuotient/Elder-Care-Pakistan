<?php
echo 'Email sender-';

//require 'PHPMailerAutoload.php';
require("assets/php/PHPMailer/PHPMailerAutoload.php");

$mail = new PHPMailer;

//$mail->SMTPDebug = 3;                               // Enable verbose debug output

$mail->isSMTP();   
//$mail->Host = 'mail.horizonimplants.com';  // Specify main and backup SMTP servers                                   // Set mailer to use SMTP
$mail->Host = 'premium185.web-hosting.com';  // Specify main and backup SMTP servers
$mail->SMTPAuth = true;                               // Enable SMTP authentication
$mail->Username = 'noreply@horizonimplants.com';                 // SMTP username
$mail->Password = 'G7HCq!hiJ1U)';                           // SMTP password
$mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
$mail->Port = 465;                                    // TCP port to connect to

$mail->From = 'noreply@horizonimplants.com';
$mail->FromName = 'Mailer';
$mail->addAddress('dbashahid@yahoo.com', 'shahid saleem');     // Add a recipient
$mail->addAddress('sirshahidsaleem@gmail.com');               // Name is optional
$mail->addReplyTo('info@horizonimplants.com', 'Information');


$mail->WordWrap = 50;                                 // Set word wrap to 50 characters
$mail->isHTML(true);                                  // Set email format to HTML

$mail->Subject = 'hello';
$mail->Body    = 'This is the HTML message body <b>in bold!</b>';
$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

if(!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Message has been sent';
}