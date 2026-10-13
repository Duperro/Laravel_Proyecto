<?php

use App\Http\Controllers\ProductoController;
use Illuminate\Support\Facades\Route;

Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/{id}', [ProductoController::class, 'show'])->whereNumber('id');
Route::post('/calcular-total', [ProductoController::class, 'calcularTotal']);
