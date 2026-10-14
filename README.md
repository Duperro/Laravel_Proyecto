# Inventario de productos

Aplicación Laravel con interfaz React/Inertia para registrar, consultar, editar y eliminar productos almacenados en MySQL/MariaDB mediante Eloquent.

## Requisitos

PHP 8.4, Composer, Node.js 22.12 o superior, npm y MySQL/MariaDB. En el entorno local, MariaDB de XAMPP utiliza el puerto 3307.

## Configuración

1. Instala las dependencias con `composer install` y `npm install`.
2. Copia `.env.example` a `.env` si todavía no existe y ejecuta `php artisan key:generate`.
3. Crea la base de datos `db_inventario` y configura `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD` en `.env`.
4. Ejecuta `php artisan migrate` para crear las tablas.
5. Compila la interfaz con `npm run build`.
6. Inicia Laravel con `php artisan serve` y abre la dirección que muestre la terminal.

Mantén MySQL/MariaDB encendido mientras utilizas la aplicación. Durante el desarrollo puedes ejecutar `npm run dev` en otra terminal para actualizar la interfaz automáticamente.

## Funcionalidades

- Registrar productos con nombre, precio y stock.
- Consultar el catálogo y buscar productos por ID.
- Editar los datos de un producto.
- Eliminar productos desde la interfaz, previa confirmación.
- Calcular el importe de una cantidad de productos.

Los productos se leen y modifican en la base de datos. Si deseas cargar los cinco productos de ejemplo, ejecuta opcionalmente `php artisan db:seed --class=ProductoSeeder`.

## API

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | `/api/productos` | Listar productos |
| POST | `/api/productos` | Registrar producto |
| GET | `/api/productos/{id}` | Consultar producto |
| PUT | `/api/productos/{id}` | Actualizar producto |
| DELETE | `/api/productos/{id}` | Eliminar producto |
| POST | `/api/calcular-total` | Calcular importe |

Las solicitudes de registro y edición reciben `nombre`, `precio` y `stock`. La API devuelve respuestas JSON y errores de validación con estado 422.

## Archivos locales

Git excluye `.env`, las dependencias instaladas, los archivos compilados, los registros, las bases SQLite locales y la configuración local del editor/agente. `.env.example` contiene la plantilla de configuración que necesita quien clone el repositorio.
