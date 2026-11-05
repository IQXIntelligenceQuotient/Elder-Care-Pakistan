<?php require("PHPMailer/PHPMailerAutoload.php");




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





// ADD your Email and Name
//$recipientEmail='info@horizonimplants.com';
//$recipientEmail='horizonimplants1@gmail.com';
//$recipientEmail='dbashahid@yahoo.com';
$recipientName='Dr.Fahad Warriach';

//collect the posted variables into local variables before calling $mail = new mailer

$senderName = $_POST['contact-name'];
$senderEmail = $_POST['contact-email'];
$senderSubject = 'New Message From ' . $senderName . $senderEmail;
$senderMessage = $_POST['contact_message'];
$purpose = $_POST['contact-purpose'];


$contact_date = $_POST['contact-date'];
$contact_time = $_POST['contact-time'];
$contact_phone = $_POST['contact-phone'];

if ($contact_date==""){$contact_date="N/A";}
if ($contact_time==""){$contact_time="N/A";}
if ($contact_phone==""){$contact_phone="N/A";}
if ($senderMessage==""){$senderMessage="N/A";}


//Create a new PHPMailer instance
//$mail = new PHPMailer();


$mail->From = 'noreply@horizonimplants.com';
$mail->FromName = $recipientName;
//$mail->addAddress('dbashahid@yahoo.com', 'shahid saleem');     // Add a recipient
$mail->addAddress('horizonimplants1@gmail.com');               // Name is optional  <------------------ admin receiver email
$mail->addReplyTo($senderEmail);



$mail->WordWrap = 50;                                 // Set word wrap to 50 characters
$mail->isHTML(true);                                  // Set email format to HTML

$mail->Subject = $senderSubject;

//$mail->Body    = 'Name:$senderName<br/>Email: $senderEmail<br/>Suburb: $senderSubject<br/>Message: $senderMessage';
//$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';




$mailbody = "<p>Hello,</p>

   <p> Your horizonimplants website's contact form has been submitted by: </p>

  <p>  Name: $senderName</p>
	
  <p>  E-mail: {$senderEmail}</p>
  
   <p>  Phone: {$contact_phone}</p>
	
	<p>	Department :  $purpose</p>
	
	<p>  Contact Date: {$contact_date}</p>
	
	<p>  Contact Time: {$contact_time}</p>

 <p>   Message:
    $senderMessage</p>

   
   
    ";

$mail->Body=$mailbody;


//Set who the message is to be sent from
//$mail->setFrom($recipientEmail, $recipientName);

//Set an alternative reply-to address
//$mail->addReplyTo($recipientEmail,$recipientName);
//Set who the message is to be sent to
//$mail->addAddress($recipientEmail, $senderName );
//Set the subject line
//$mail->Subject = $senderSubject;

//$mail->Body = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test

//$mail->MsgHTML($body);
//$mail->AddAddress($recipientEmail, $recipientName);

//$mail-&gt;AddAttachment("images/phpmailer.gif"); // attachment
//$mail-&gt;AddAttachment("images/phpmailer_mini.gif"); // attachment

//now make those variables the body of the emails

//$mail->Body="Name: $senderName<br/>Email: $senderEmail<br/>Suburb: $senderSubject<br/>Message: $senderMessage";

if(!$mail->Send()) {
	echo '<div class="alert alert-danger" role="alert">Error: '. $mail->ErrorInfo.'</div>';
} else {
	echo '<div class="alert alert-success" role="alert">Thank you. We will contact you shortly.</div>';
}
?>