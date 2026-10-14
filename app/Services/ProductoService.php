<?php

namespace App\Services;

use App\Models\Producto;

class ProductoService
{
    /** @return list<array<string, mixed>> */
    public function listar(): array
    {
        return array_values(Producto::query()->orderBy('id')->get()->map(function (Producto $producto): array {
            $datos = $producto->toArray();
            $datos['precio'] = (float) $producto->precio;

            return $datos;
        })->all());
    }

    /** @return array<string, mixed>|null */
    public function buscarPorId(int $id): ?array
    {
        $producto = Producto::query()->find($id);

        if ($producto === null) {
            return null;
        }

        $datos = $producto->toArray();
        $datos['precio'] = (float) $producto->precio;

        return $datos;
    }

    /** @return array{producto: string, precio_unitario: int|float, cantidad: int, total: int|float}|null */
    public function calcularTotal(int $productoId, int $cantidad): ?array
    {
        $producto = Producto::query()->find($productoId);

        if ($producto === null) {
            return null;
        }

        $precio = (float) $producto->precio;
        $precioCentavos = (int) round($precio * 100);

        return [
            'producto' => $producto->nombre,
            'precio_unitario' => $precio,
            'cantidad' => $cantidad,
            'total' => ($precioCentavos * $cantidad) / 100,
        ];
    }
}
