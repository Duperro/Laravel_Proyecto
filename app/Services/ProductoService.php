<?php

namespace App\Services;

class ProductoService
{
    /** @var list<array{id: int, nombre: string, precio: int|float}> */
    private array $productos = [
        ['id' => 1, 'nombre' => 'Teclado', 'precio' => 25],
        ['id' => 2, 'nombre' => 'Mouse', 'precio' => 15],
        ['id' => 3, 'nombre' => 'Monitor', 'precio' => 180],
        ['id' => 4, 'nombre' => 'Audífonos', 'precio' => 35.50],
        ['id' => 5, 'nombre' => 'Webcam', 'precio' => 45],
    ];

    /** @return list<array{id: int, nombre: string, precio: int|float}> */
    public function listar(): array
    {
        return $this->productos;
    }

    /** @return array{id: int, nombre: string, precio: int|float}|null */
    public function buscarPorId(int $id): ?array
    {
        foreach ($this->productos as $producto) {
            if ($producto['id'] === $id) {
                return $producto;
            }
        }

        return null;
    }

    /** @return array{producto: string, precio_unitario: int|float, cantidad: int, total: int|float}|null */
    public function calcularTotal(int $productoId, int $cantidad): ?array
    {
        $producto = $this->buscarPorId($productoId);

        if ($producto === null) {
            return null;
        }

        // Calcular en centavos evita acumular errores de punto flotante.
        $precioCentavos = (int) round($producto['precio'] * 100);

        return [
            'producto' => $producto['nombre'],
            'precio_unitario' => $producto['precio'],
            'cantidad' => $cantidad,
            'total' => ($precioCentavos * $cantidad) / 100,
        ];
    }
}
