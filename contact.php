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

$configPath = dirname(__DIR__) . '/eldercare-contact-smtp.ini';
$config = @parse_ini_file($configPath, false, INI_SCANNER_RAW);
$host = $config['host'] ?? '';
$username = $config['username'] ?? '';
$password = $config['password'] ?? '';
$port = (int) ($config['port'] ?? 465);
if (!filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME)
    || !filter_var($username, FILTER_VALIDATE_EMAIL)
    || $password === '' || !in_array($port, [465, 587], true)
    || !extension_loaded('openssl')) {
    error_log('Elder Care Pakistan contact form: SMTP is not configured.');
    respond(503, 'The contact form is temporarily unavailable. Please use email or WhatsApp.');
}

takeRateLimitSlot();

require_once __DIR__ . '/Exception.php';
require_once __DIR__ . '/PHPMailer.php';
require_once __DIR__ . '/SMTP.php';

$mailer = new PHPMailer(true);
$mailer->isSMTP();
$mailer->Host = $host;
$mailer->Port = $port;
$mailer->SMTPSecure = $port === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
$mailer->SMTPAuth = true;
$mailer->Username = $username;
$mailer->Password = $password;
$mailer->Timeout = 10;
$mailer->CharSet = PHPMailer::CHARSET_UTF8;
$mailer->Subject = 'Website contact inquiry';
$mailer->Body = "Name: $name\r\nEmail: $email\r\nPhone: $phone\r\nCity: $city\r\n\r\n$message";

try {
    $mailer->setFrom($username, 'Elder Care Pakistan');
    $mailer->addAddress('eldercarepakistan@gmail.com');
    $mailer->addBCC('faizi.click2print@gmail.com');
    $mailer->addReplyTo($email);
    $mailer->send();
} catch (MailException $exception) {
    $smtpCode = $mailer->getSMTPInstance()->getError()['smtp_code'] ?? '';
    error_log('Elder Care Pakistan contact form: SMTP failed (code ' . (int) $smtpCode . ').');
    respond(503, 'We could not send your message. Please try again later or use email or WhatsApp.');
}
respond(202, 'Thank you. Our mail server accepted your message for delivery.');
