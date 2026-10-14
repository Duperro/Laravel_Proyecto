<?php

namespace App\Models;

use Database\Factories\ProductoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $nombre
 * @property string $precio
 * @property int $stock
 */
class Producto extends Model
{
    /** @use HasFactory<ProductoFactory> */
    use HasFactory;

    protected $fillable = ['nombre', 'precio', 'stock'];

    protected function casts(): array
    {
        return ['precio' => 'decimal:2', 'stock' => 'integer'];
    }
}
