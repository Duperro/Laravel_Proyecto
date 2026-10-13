<?php

test('lista cinco productos', function () {
    $this->getJson('/api/productos')->assertOk()->assertJsonCount(5)
        ->assertJsonStructure(['*' => ['id', 'nombre', 'precio']]);
});

test('consulta producto por id', function () {
    $this->getJson('/api/productos/1')->assertOk()
        ->assertExactJson(['id' => 1, 'nombre' => 'Teclado', 'precio' => 25]);
});

test('producto inexistente devuelve 404', function () {
    $this->getJson('/api/productos/999')->assertNotFound()
        ->assertExactJson(['message' => 'Producto no encontrado.']);
    $this->postJson('/api/calcular-total', ['producto_id' => 999, 'cantidad' => 3])
        ->assertNotFound()->assertExactJson(['message' => 'Producto no encontrado.']);
});

test('calcula total', function () {
    $this->postJson('/api/calcular-total', ['producto_id' => 1, 'cantidad' => 3])
        ->assertOk()->assertExactJson([
            'producto' => 'Teclado', 'precio_unitario' => 25, 'cantidad' => 3, 'total' => 75,
        ]);
});

test('calcula precio con decimales', function () {
    $this->postJson('/api/calcular-total', ['producto_id' => 4, 'cantidad' => 3])
        ->assertOk()->assertJsonPath('total', 106.5);
});

test('rechaza campos ausentes', function () {
    $this->postJson('/api/calcular-total', [])->assertUnprocessable()
        ->assertJsonValidationErrors(['producto_id', 'cantidad']);
});

test('rechaza cantidad invalida', function () {
    foreach ([0, -1, 1.5, 'abc', 2147483648] as $cantidad) {
        $this->postJson('/api/calcular-total', ['producto_id' => 1, 'cantidad' => $cantidad])
            ->assertUnprocessable()->assertJsonValidationErrors('cantidad');
    }
});

test('rechaza identificador invalido', function () {
    $this->postJson('/api/calcular-total', ['producto_id' => 'abc', 'cantidad' => 3])
        ->assertUnprocessable()->assertJsonValidationErrors('producto_id');
    $this->getJson('/api/productos/abc')->assertNotFound();
});
