<?php

namespace Database\Seeders;

use App\Models\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['nombre' => 'Teclado', 'precio' => 25],
            ['nombre' => 'Mouse', 'precio' => 15],
            ['nombre' => 'Monitor', 'precio' => 180],
            ['nombre' => 'Audífonos', 'precio' => 35.50],
            ['nombre' => 'Webcam', 'precio' => 45],
        ] as $producto) {
            Producto::query()->firstOrCreate(['nombre' => $producto['nombre']], $producto + ['stock' => 10]);
        }
    }
}
