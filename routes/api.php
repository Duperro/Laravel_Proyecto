<?php

use App\Http\Controllers\ProductoController;
use Illuminate\Support\Facades\Route;

Route::get('/productos', [ProductoController::class, 'index']);
Route::post('/productos', [ProductoController::class, 'store']);
Route::get('/productos/{id}', [ProductoController::class, 'show'])->whereNumber('id');
Route::put('/productos/{id}', [ProductoController::class, 'update'])->whereNumber('id');
Route::delete('/productos/{id}', [ProductoController::class, 'destroy'])->whereNumber('id');
Route::post('/calcular-total', [ProductoController::class, 'calcularTotal']);
