<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $navn = $_POST['navn'];
    $email = $_POST['email'];
    $land = $_POST['land'];
    $by = $_POST['by'];
    $adresse = isset($_POST['adresse']) ? $_POST['adresse'] : '';
    $telefonnummer = $_POST['telefonnummer'];
    $belop = $_POST['belop'];
    $ny_eller_avslutt = $_POST['ny-eller-avslutt'];
    $bevis = $_POST['bevis'];
    $katt = $_POST['katt'];
    $terms = isset($_POST['terms']) ? 'Yes' : 'No';
    $newsletters = isset($_POST['newsletters']) ? 'Yes' : 'No';

    $to = "hgramd@hotmail.com";
    $subject = "Ny fjernadopsjon forespørsel";
    $message = "
    Navn: $navn\n
    E-post: $email\n
    Land: $land\n
    By: $by\n
    Adresse: $adresse\n
    Telefonnummer: $telefonnummer\n
    Ønsket beløp: $belop\n
    Ny eller avslutte: $ny_eller_avslutt\n
    Bevis: $bevis\n
    Hvilken katt: $katt\n
    Terms accepted: $terms\n
    Wants newsletters: $newsletters
    ";
    $headers = "From: $email";

    if (mail($to, $subject, $message, $headers)) {
        echo "Takk for din forespørsel. Vi vil kontakte deg snart.";
    } else {
        echo "Noe gikk galt, vennligst prøv igjen senere.";
    }
}
?>
