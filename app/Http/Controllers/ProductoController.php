<?php

namespace App\Http\Controllers;

use App\Http\Requests\GuardarProductoRequest;
use App\Models\Producto;
use App\Services\ProductoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function __construct(private ProductoService $productoService) {}

    public function index(): JsonResponse
    {
        return response()->json($this->productoService->listar());
    }

    public function store(GuardarProductoRequest $request): JsonResponse
    {
        return response()->json(Producto::query()->create($request->validated()), 201);
    }

    public function update(GuardarProductoRequest $request, int $id): JsonResponse
    {
        $producto = Producto::query()->find($id);

        if ($producto === null) {
            return response()->json(['message' => 'Producto no encontrado.'], 404);
        }

        $producto->update($request->validated());

        return response()->json($producto);
    }

    public function destroy(int $id): JsonResponse
    {
        $producto = Producto::query()->find($id);

        if ($producto === null) {
            return response()->json(['message' => 'Producto no encontrado.'], 404);
        }

        $producto->delete();

        return response()->json(['message' => 'Producto eliminado correctamente.']);
    }

    public function show(int $id): JsonResponse
    {
        $producto = $this->productoService->buscarPorId($id);

        if ($producto === null) {
            return response()->json(['message' => 'Producto no encontrado.'], 404);
        }

        return response()->json($producto);
    }

    public function calcularTotal(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'producto_id' => ['required', 'integer', 'min:1', 'max:2147483647'],
            'cantidad' => ['required', 'integer', 'min:1', 'max:2147483647'],
        ]);

        $resultado = $this->productoService->calcularTotal(
            (int) $datos['producto_id'],
            (int) $datos['cantidad'],
        );

        if ($resultado === null) {
            return response()->json(['message' => 'Producto no encontrado.'], 404);
        }

        return response()->json($resultado);
    }
}
