<?php
// Cargar las variables de entorno desde el archivo .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Configuración de la conexión a la base de datos
$servername = getenv('DB_SERVER');
$username = getenv('DB_USERNAME');
$password = getenv('DB_PASSWORD');
$dbname = getenv('DB_NAME');

// Crear la conexión a la base de datos
$db = new mysqli($servername, $username, $password, $dbname);

// Verificar si hay errores en la conexión
if ($db->connect_error) {
    die("Error de conexión a la base de datos: " . $db->connect_error);
}

