<?php
// Enable error reporting for debugging (disable in production)
//error_reporting(E_ALL);
//ini_set('display_errors', 1);

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize form data
    $fullName = filter_var($_POST['fullName'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $phone = filter_var($_POST['phone'], FILTER_SANITIZE_STRING);
    $institution = filter_var($_POST['institution'], FILTER_SANITIZE_STRING);
    $country = filter_var($_POST['country'], FILTER_SANITIZE_STRING);
    $package = filter_var($_POST['package'], FILTER_SANITIZE_STRING);
    $requirements = filter_var($_POST['requirements'], FILTER_SANITIZE_STRING);
    $workshops = isset($_POST['workshops']) ? implode(", ", $_POST['workshops']) : "None selected";

    // Validate required fields
    if (empty($fullName) || empty($email) || empty($phone) || empty($package)) {
        echo "Please fill all required fields.";
        exit;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format.";
        exit;
    }

    // Process file upload
    $uploadOk = 1;
    $targetDir = "uploads/";
    $fileName = time() . '_' . basename($_FILES["paymentProof"]["name"]);
    $targetFile = $targetDir . $fileName;
    $imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));

    // Check if image file is an actual image
    $check = getimagesize($_FILES["paymentProof"]["tmp_name"]);
    if ($check === false) {
        echo "File is not an image.";
        $uploadOk = 0;
    }

    // Check file size (2MB max)
    if ($_FILES["paymentProof"]["size"] > 2000000) {
        echo "Sorry, your file is too large. Max size is 2MB.";
        $uploadOk = 0;
    }

    // Allow certain file formats
    $allowedFormats = ["jpg", "jpeg", "png", "gif"];
    if (!in_array($imageFileType, $allowedFormats)) {
        echo "Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
        $uploadOk = 0;
    }

    // Check if $uploadOk is set to 0 by an error
    if ($uploadOk == 0) {
        echo "Sorry, your file was not uploaded.";
    } else {
        // Create uploads directory if it doesn't exist
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        // Try to upload file
        if (move_uploaded_file($_FILES["paymentProof"]["tmp_name"], $targetFile)) {
            // File uploaded successfully, now send email

            // Email configuration
            $to = "familycon@namewise.me"; // Change to your email
            $subject = "New Registration for FamilyCon : " . $fullName;

            // Email content
            $message = "
            <html>
            <head>
              <title>FamilyCon  Registration</title>
            </head>
            <body>
              <h2>New Registration for FamilyCon </h2>
              <p><strong>Name:</strong> $fullName</p>
              <p><strong>Email:</strong> $email</p>
              <p><strong>Phone:</strong> $phone</p>
              <p><strong>Institution/Organization:</strong> $institution</p>
              <p><strong>Country:</strong> $country</p>
              <p><strong>Selected Package:</strong> $package</p>
              <p><strong>Workshops:</strong> $workshops</p>
              <p><strong>Special Requirements:</strong> $requirements</p>
              <p><strong>Payment Proof:</strong> $fileName</p>
              <br>
              <p>This email was generated from the FamilyCon  registration form.</p>
            </body>
            </html>
            ";

            // Always set content-type when sending HTML email
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= "From: FamilyCon  <familycon@namewise.me>" . "\r\n";
            $headers .= "Reply-To: $email" . "\r\n";

            // Generate a boundary string
            $boundary = md5(time());

            // Change headers for multipart
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "From: FamilyCon  <familycon@namewise.me>\r\n";
            $headers .= "Reply-To: $email\r\n";
            $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

            // Multipart message body
            $body = "--$boundary\r\n";
            $body .= "Content-Type: text/html; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= $message . "\r\n\r\n";

            // Attach payment screenshot
            $fileContent = file_get_contents($targetFile);
            $body .= "--$boundary\r\n";
            $body .= "Content-Type: application/octet-stream; name=\"" . basename($targetFile) . "\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n";
            $body .= "Content-Disposition: attachment; filename=\"" . basename($targetFile) . "\"\r\n\r\n";
            $body .= chunk_split(base64_encode($fileContent)) . "\r\n";
            $body .= "--$boundary--";

            // Send email with attachment
            $mailSent = mail($to, $subject, $body, $headers);

            // Check if mail was sent successfully
            if ($mailSent) {
                echo "✅ Your registration has been submitted successfully. A confirmation email has been sent to your registered address. Our team will contact you shortly to guide you through the next steps.";

                // Optional: Send confirmation email to user
                $userSubject = "Confirmation of Your FamilyCon  Registration";
                $userMessage = "
                <html>
                <head>
                  <title>FamilyCon  Registration Confirmation</title>
                </head>
                <body>
                  <h2>Thank you for registering for FamilyCon !</h2>
                  <p>Dear $fullName,</p>
                  <p>We have received your registration for FamilyCon  with the following details:</p>
                  <p><strong>Package:</strong> $package</p>
                  <p><strong>Workshops:</strong> $workshops</p>
                  <p>We will contact you shortly with further information about the conference.</p>
                  <br>
                  <p>Best regards,<br>FamilyCon  Team</p>
                </body>
                </html>
                ";

                $userHeaders = "MIME-Version: 1.0" . "\r\n";
                $userHeaders .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                $userHeaders .= "From: FamilyCon  <familycon@namewise.me>" . "\r\n";

                mail($email, $userSubject, $userMessage, $userHeaders);
            } else {
                echo "There was an error processing your registration. Please try again later.";
            }
        } else {
            echo "Sorry, there was an error uploading your file.";
        }
    }
} else {
    echo "Invalid request method.";
}
