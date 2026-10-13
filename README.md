# API de productos

Proyecto Laravel con tres endpoints JSON y un catálogo de cinco productos en memoria. La API no requiere base de datos, autenticación ni compilación del frontend.

## Instalar

Requisitos: PHP 8.3 o superior, Composer y las extensiones habituales de Laravel (`curl`, `fileinfo`, `mbstring`, `openssl`, `PDO`, `dom`, `xml` y `zip`). En este equipo se utiliza PHP 8.4 independiente de XAMPP.

Desde la carpeta del proyecto:

```powershell
cd Laravel_Proyecto
php -v
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Si ya existe `.env`, conserva ese archivo y omite la copia. No es necesario ejecutar migraciones para estos endpoints.

## Ejecutar

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

URL base: `http://127.0.0.1:8000`. Mantén la terminal abierta; usa Ctrl+C para detener el servidor.

## Separación de responsabilidades

- `routes/api.php`: define las rutas; Laravel añade el prefijo `/api`.
- `app/Http/Controllers/ProductoController.php`: recibe solicitudes, valida los campos HTTP y devuelve JSON con el estado correspondiente.
- `app/Services/ProductoService.php`: almacena el catálogo, busca por ID y calcula el total en centavos. El controlador no realiza cálculos ni contiene el catálogo.
- `bootstrap/app.php`: registra las rutas API y configura respuestas JSON para sus errores.

## Probar con Postman o Insomnia

Crea las siguientes solicitudes con el encabezado `Accept: application/json`. Para POST, selecciona Body → raw → JSON en Postman (o cuerpo JSON en Insomnia) y añade `Content-Type: application/json`.

### GET /api/productos

Solicitud: `GET http://127.0.0.1:8000/api/productos`, sin cuerpo.

Respuesta: **200 OK**.

```json
[
    { "id": 1, "nombre": "Teclado", "precio": 25 },
    { "id": 2, "nombre": "Mouse", "precio": 15 },
    { "id": 3, "nombre": "Monitor", "precio": 180 },
    { "id": 4, "nombre": "Audífonos", "precio": 35.5 },
    { "id": 5, "nombre": "Webcam", "precio": 45 }
]
```

### GET /api/productos/{id}

Solicitud: `GET http://127.0.0.1:8000/api/productos/1`, sin cuerpo.

Respuesta: **200 OK**.

```json
{ "id": 1, "nombre": "Teclado", "precio": 25 }
```

### POST /api/calcular-total

Solicitud: `POST http://127.0.0.1:8000/api/calcular-total`.

```json
{ "producto_id": 1, "cantidad": 3 }
```

Respuesta: **200 OK**.

```json
{
    "producto": "Teclado",
    "precio_unitario": 25,
    "cantidad": 3,
    "total": 75
}
```

### Errores

- ID inexistente (por ejemplo, `999`): **404 Not Found**, tanto en consulta como en cálculo.

```json
{ "message": "Producto no encontrado." }
```

- Campos ausentes o inválidos: **422 Unprocessable Content**, con `message` y `errors`. Ambos campos son obligatorios y deben ser enteros entre 1 y 2147483647. Las cantidades cero, negativas o fraccionarias se rechazan.
- Un ID no numérico en la ruta devuelve **404**.

## Probar desde PowerShell (herramienta equivalente)

Con el servidor en ejecución, abre otra terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/productos
Invoke-RestMethod http://127.0.0.1:8000/api/productos/1
Invoke-RestMethod http://127.0.0.1:8000/api/calcular-total `
  -Method Post -ContentType 'application/json' `
  -Body '{"producto_id":1,"cantidad":3}'
```

## Pruebas automatizadas

```powershell
php artisan test --filter=ProductoApiTest
```

Las pruebas de esta API no usan base de datos. Verifican listado, consulta, cálculo, decimales, productos inexistentes y validación de entradas. El starter kit también incluye pruebas de autenticación y frontend ajenas a esta API.

## Verificación realizada

- 8 pruebas automatizadas aprobadas, con 51 aserciones.
- Los tres endpoints probados por HTTP con PowerShell: respuestas 200 y cuerpos coincidentes con los ejemplos anteriores.
- Para la verificación HTTP se usó temporalmente el puerto 8001; puedes ejecutar el proyecto en 8000 como se indica arriba.
- Formato PHP verificado con Pint y análisis estático de los archivos de la API aprobado con PHPStan.
- El análisis estático general encontró una referencia a `app/Console/Commands/InstallFeaturesCommand.php`, ausente en el starter kit; la comprobación específica de esta API pasó sin errores.
