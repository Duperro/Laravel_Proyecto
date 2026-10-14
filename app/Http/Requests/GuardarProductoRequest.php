<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GuardarProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:3', 'max:100'],
            'precio' => ['required', 'numeric', 'gt:0', 'min:0.01', 'max:99999999.99', 'decimal:0,2'],
            'stock' => ['required', 'integer', 'min:0', 'max:2147483647'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser texto.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'nombre.max' => 'El nombre no puede superar los 100 caracteres.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser numérico.',
            'precio.gt' => 'El precio debe ser mayor que cero.',
            'precio.min' => 'El precio mínimo es 0.01.',
            'precio.max' => 'El precio máximo es 99999999.99.',
            'precio.decimal' => 'El precio debe tener como máximo 2 decimales.',
            'stock.required' => 'El stock es obligatorio.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock no puede ser negativo.',
            'stock.max' => 'El stock máximo es 2147483647.',
        ];
    }
}
