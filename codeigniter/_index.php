<?php
class Database {
    private $dbHost = 'localhost';
    private $dbUsername = 'root';
    private $dbPassword = 'root';
    private $dbName = 'map_vue';
    private $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO("mysql:host=$this->dbHost;dbname=$this->dbName", $this->dbUsername, $this->dbPassword);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            throw new Exception("Błąd połączenia z bazą danych: " . $e->getMessage());
        }
    }

    public function getPDO() {
        return $this->pdo;
    }
}

class ErrorHandler {
    public static function handleException($exception) {
        http_response_code(500);
        echo json_encode(array("message" => "Wystąpił błąd: " . $exception->getMessage()));
    }
}

class Auth {
    public static function authenticate() {
        // Tutaj możesz dodać kod do autentykacji użytkownika
        // Na razie przyjmujemy, że każdy ma dostęp
        return true;
    }
}

function getMarkers() {
    try {
        $database = new Database();
        $pdo = $database->getPDO();

        if (!Auth::authenticate()) {
            http_response_code(401); // Unauthorized
            echo json_encode(array("message" => "Brak autoryzacji"));
            return;
        }

        $query = $pdo->prepare("SELECT id, lat, lng, name FROM blanc");
        $query->execute();
        $markers = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($markers);
    } catch (Exception $e) {
        ErrorHandler::handleException($e);
    }
}

// Ustawienie nagłówków HTTP
header("Content-Type: application/json");

// Sprawdzenie metody HTTP
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Obsługa zapytania GET
    getMarkers();
} else {
    // Obsługa innych metod (np. POST, PUT, DELETE)
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("message" => "Metoda nieobsługiwana"));
}
?>
