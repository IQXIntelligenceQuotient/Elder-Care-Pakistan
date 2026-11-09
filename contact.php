<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message): never
{
    http_response_code($status);
    if (str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['accepted' => $status === 202, 'message' => $message], JSON_THROW_ON_ERROR);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width,initial-scale=1">'
            . '<title>Contact Elder Care Pakistan</title></head><body><main>'
            . '<h1>Contact Elder Care Pakistan</h1><p>' . $safe . '</p>'
            . '<p><a href="/Contact-Us.html#ecpContactForm">Return to the contact form</a></p>'
            . '<p><a href="mailto:eldercarepakistan@gmail.com">Email Elder Care Pakistan</a></p>'
            . '</main></body></html>';
    }
    exit;
}

function field(string $name, int $maxBytes, bool $required = true): string
{
    $value = $_POST[$name] ?? '';
    if (!is_string($value) || strlen($value) > $maxBytes || preg_match('//u', $value) !== 1) {
        respond(422, 'Check the form fields and shorten any long entries.');
    }
    $value = trim($value);
    if ($required && $value === '') {
        respond(422, 'Enter your name, email, city, and message.');
    }
    return $value;
}

function takeRateLimitSlot(): void
{
    // Keep one bounded counter file outside the document root.
    $path = sys_get_temp_dir() . '/ecp-contact-' . hash('sha256', __DIR__) . '.json';
    $file = @fopen($path, 'c+');
    if ($file === false || !flock($file, LOCK_EX)) {
        respond(503, 'The contact form is temporarily unavailable. Please use email or WhatsApp.');
    }
    $now = time();
    $window = intdiv($now, 900);
    $state = json_decode(stream_get_contents($file), true);
    if (!is_array($state) || ($state['window'] ?? null) !== $window) {
        $state = ['window' => $window, 'total' => 0, 'clients' => []];
    }
    $client = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $count = $state['clients'][$client] ?? 0;
    if ($count >= 4 || $state['total'] >= 40) {
        fclose($file);
        header('Retry-After: ' . (900 - $now % 900));
        respond(429, 'Too many messages were attempted. Please wait or contact us by email.');
    }
    $state['clients'][$client] = $count + 1;
    $state['total']++;
    $data = json_encode($state, JSON_THROW_ON_ERROR);
    $saved = rewind($file) && fwrite($file, $data) === strlen($data) && ftruncate($file, strlen($data));
    fclose($file);
    if (!$saved) {
        respond(503, 'The contact form is temporarily unavailable. Please use email or WhatsApp.');
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'Open the contact page to send a message.');
}
if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
    respond(403, 'Please submit the message from the contact page.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 65536) {
    respond(413, 'Your message is too large. Please shorten it and try again.');
}
if (field('website', 300, false) !== '') {
    respond(422, 'Please submit the message from the contact page.');
}

$name = field('name', 400);
$email = field('email', 254);
$phone = field('phone_number', 120, false);
$city = field('city', 320);
$message = field('message', 12000);
if (preg_match('/[\r\n]/', $email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, 'Enter a valid email address so we can reply.');
}

$captureDirectory = PHP_SAPI === 'cli-server' ? (getenv('ECP_CONTACT_CAPTURE') ?: '') : '';
$configPath = dirname(__DIR__) . '/eldercare-contact-smtp.ini';
$config = $captureDirectory === '' ? @parse_ini_file($configPath, false, INI_SCANNER_RAW) : [];
$host = $config['host'] ?? '';
$username = $config['username'] ?? ($captureDirectory !== '' ? 'care@eldercarepakistan.org' : '');
$password = $config['password'] ?? '';
$port = (int) ($config['port'] ?? 465);
if ($captureDirectory === '' && (!filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME)
    || !filter_var($username, FILTER_VALIDATE_EMAIL)
    || $password === '' || $password === 'REPLACE_WITH_MAILBOX_PASSWORD' || !in_array($port, [465, 587], true)
    || !extension_loaded('openssl'))) {
    error_log('Elder Care Pakistan contact form: SMTP is not configured.');
    if (PHP_SAPI === 'cli-server') {
        respond(503, 'Local email delivery needs valid SMTP settings in the private configuration file.');
    }
    respond(503, 'The contact form is temporarily unavailable. Please use email or WhatsApp.');
}

takeRateLimitSlot();

require_once __DIR__ . '/Exception.php';
require_once __DIR__ . '/PHPMailer.php';
require_once __DIR__ . '/SMTP.php';

$mailer = new PHPMailer(true);
if ($captureDirectory === '') {
    $mailer->isSMTP();
}
$mailer->Host = $host;
$mailer->Port = $port;
$mailer->SMTPSecure = $port === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
$mailer->SMTPAuth = true;
$mailer->Username = $username;
$mailer->Password = $password;
$mailer->Timeout = 10;
$mailer->CharSet = PHPMailer::CHARSET_UTF8;
$reference = 'ECP-' . strtoupper(bin2hex(random_bytes(6)));
$received = (new DateTimeImmutable('now', new DateTimeZone('Asia/Karachi')))->format('d M Y, g:i a') . ' PKT';
$details = [
    'Reference' => $reference,
    'Received' => $received,
    'Name' => $name,
    'Email' => $email,
    'Phone' => $phone !== '' ? $phone : 'Not provided',
    'City' => $city,
];
$escape = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeName = $escape($name);
$rows = '';
$plainDetails = '';
foreach ($details as $label => $value) {
    $rows .= '<tr><th scope="row" align="left" valign="top" style="padding:8px 12px;background-color:#eef3e9;border-bottom:1px solid #dbe3dd;color:#10382c;">'
        . $label . '</th><td valign="top" style="padding:8px 12px;border-bottom:1px solid #dbe3dd;overflow-wrap:anywhere;word-break:break-word;">'
        . $escape($value) . '</td></tr>';
    $plainDetails .= "$label: $value\r\n";
}
$safeMessage = nl2br($escape($message), false);
$formatEmail = static function (bool $forVisitor) use ($reference, $name, $safeName, $rows, $plainDetails, $message, $safeMessage): array {
    $title = $forVisitor ? 'We received your enquiry' : 'New website enquiry';
    $greeting = $forVisitor ? "Dear $name," : 'Dear Elder Care Pakistan team,';
    $htmlGreeting = $forVisitor ? "Dear $safeName," : $greeting;
    $intro = $forVisitor
        ? 'Thank you for contacting Elder Care Pakistan. Our team will review your enquiry.'
        : 'A new enquiry was submitted through the Elder Care Pakistan website.';
    $messageTitle = $forVisitor ? 'Your message' : 'Visitor’s message';
    $nextStep = $forVisitor
        ? 'Keep this reference handy. If you have anything to add, reply to this email.'
        : 'Reply to this email to contact the sender.';
    $html = <<<HTML
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background-color:#e1eee7;color:#172820;font:16px/1.5 Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e1eee7;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border:1px solid #cfdbd3;border-radius:12px;">
<tr><td style="padding:24px;border-bottom:4px solid #dfa723;">
    <img src="https://eldercarepakistan.org/assets/img/logos/logo.png" alt="Elder Care Pakistan" width="220" style="display:block;max-width:100%;height:auto;">
</td></tr>
<tr><td style="padding:20px 24px;background-color:#103e30;">
    <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;">$title</h1>
</td></tr>
<tr><td style="padding:24px;">
    <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#10382c;overflow-wrap:anywhere;word-break:break-word;">$htmlGreeting</p>
    <p style="margin:0 0 16px;">$intro</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #cbd7cf;">$rows</table>
    <h2 style="margin:24px 0 8px;font-size:20px;color:#10382c;">$messageTitle</h2>
    <div style="padding:16px;background-color:#faf3e3;border-left:4px solid #dfa723;overflow-wrap:anywhere;word-break:break-word;">$safeMessage</div>
    <p style="margin:16px 0 0;">$nextStep</p>
</td></tr>
<tr><td style="padding:20px 24px;background-color:#e9f2ec;border-top:3px solid #dfa723;border-radius:0 0 11px 11px;color:#10382c;font-size:14px;">
    <strong style="font-size:20px;">Elder Care Pakistan</strong>
    <p style="margin:8px 0 16px;">Phone <a style="color:#10382c;" href="tel:+923214277856">+92 321 427 7856</a>
    &nbsp;·&nbsp; <a style="color:#10382c;" href="https://wa.me/923214277856">WhatsApp</a></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;border-top:1px solid #abc5b4;">
    <tr><td width="50%" valign="top" style="padding:12px 12px 12px 0;"><strong>Head office</strong><br>11-UGF, Central Plaza, Garden Town, Lahore, Pakistan</td>
    <td width="50%" valign="top" style="padding:12px 0 12px 12px;"><strong>Care home</strong><br>17KM Neelum Valley Road, Pattika, Muzaffarabad, AJK</td></tr>
    </table>
    <a style="color:#10382c;font-weight:bold;" href="https://eldercarepakistan.org/Contact-Us.html">View contact page and directions</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
HTML;
    $plain = "$title\r\n\r\n$greeting\r\n$intro\r\n\r\n"
        . $plainDetails . "\r\n$messageTitle\r\n$message\r\n\r\n$nextStep\r\n\r\n"
        . "Elder Care Pakistan\r\nPhone: +92 321 427 7856\r\nWhatsApp: https://wa.me/923214277856\r\n"
        . "Head office: 11-UGF, Central Plaza, Garden Town, Lahore, Pakistan\r\n"
        . "Care home: 17KM Neelum Valley Road, Pattika, Muzaffarabad, AJK\r\n"
        . "Contact and directions: https://eldercarepakistan.org/Contact-Us.html";
    return ["$title | $reference", $html, $plain];
};

$sendEmail = static function (string $kind) use ($mailer, $captureDirectory, $reference): void {
    if ($captureDirectory === '') {
        $mailer->send();
        return;
    }
    $mailer->preSend();
    $path = $captureDirectory . DIRECTORY_SEPARATOR . "$reference-$kind.eml";
    $message = $mailer->getSentMIMEMessage();
    if (@file_put_contents($path, $message, LOCK_EX) !== strlen($message)) {
        throw new MailException('Could not save the local email preview.');
    }
};

try {
    $mailer->isHTML(true);
    [$mailer->Subject, $mailer->Body, $mailer->AltBody] = $formatEmail(false);
    $mailer->setFrom($username, 'Elder Care Pakistan');
    $mailer->addAddress('eldercarepakistan@gmail.com');
    $mailer->addBCC('faizi.click2print@gmail.com');
    $mailer->addReplyTo($email);
    $sendEmail('team');
} catch (MailException $exception) {
    $smtpCode = $mailer->getSMTPInstance()->getError()['smtp_code'] ?? '';
    error_log('Elder Care Pakistan contact form: SMTP failed (code ' . (int) $smtpCode . ').');
    respond(503, 'We could not send your message. Please try again later or use email or WhatsApp.');
}

try {
    $mailer->clearAllRecipients();
    $mailer->clearReplyTos();
    $mailer->addAddress($email);
    $mailer->addReplyTo('eldercarepakistan@gmail.com', 'Elder Care Pakistan');
    [$mailer->Subject, $mailer->Body, $mailer->AltBody] = $formatEmail(true);
    $sendEmail('visitor');
} catch (MailException $exception) {
    $smtpCode = $mailer->getSMTPInstance()->getError()['smtp_code'] ?? '';
    error_log('Elder Care Pakistan contact form: confirmation failed for ' . $reference . ' (code ' . (int) $smtpCode . ').');
    if ($captureDirectory !== '') {
        respond(503, 'The local visitor confirmation could not be saved.');
    }
}
respond(202, $captureDirectory !== ''
    ? "Local test complete. Team and visitor emails were saved as previews. Reference: $reference."
    : 'Thank you. Our mail server accepted your message for delivery.');
