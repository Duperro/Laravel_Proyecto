import { Head, Link } from '@inertiajs/react';
import {
    index as listarProductos,
    show,
    store,
    update,
    destroy,
    calcularTotal,
} from '@/actions/App/Http/Controllers/ProductoController';
import { home } from '@/routes';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    ArrowRight,
    Check,
    Headphones,
    Keyboard,
    Monitor,
    Mouse,
    Package,
    RefreshCw,
    Search,
    ShoppingBag,
    Video,
    Plus,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import '../../css/productos.css';

type Producto = { id: number; nombre: string; precio: number; stock: number };
type CamposProducto = { nombre: string; precio: string; stock: string };
class ErrorApi extends Error {
    constructor(
        message: string,
        public campos: Record<string, string[]> = {},
    ) {
        super(message);
    }
}
type Total = {
    producto: string;
    precio_unitario: number;
    cantidad: number;
    total: number;
};
const moneda = (valor: number) =>
    new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
    }).format(valor);
const iconos = [Keyboard, Mouse, Monitor, Headphones, Video];

async function consultar<T>(url: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);
    headers.set('Accept', 'application/json');
    const respuesta = await fetch(url, {
        ...options,
        headers,
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) {
        throw new ErrorApi(
            respuesta.status === 422
                ? 'Revisa los campos indicados.'
                : datos.message || 'No se pudo completar la solicitud.',
            datos.errors || {},
        );
    }
    return datos as T;
}

export default function Productos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);
    const [errorCatalogo, setErrorCatalogo] = useState('');
    const [idConsulta, setIdConsulta] = useState('1');
    const [detalle, setDetalle] = useState<Producto | null>(null);
    const [buscando, setBuscando] = useState(false);
    const [errorConsulta, setErrorConsulta] = useState('');
    const [productoId, setProductoId] = useState('1');
    const [cantidad, setCantidad] = useState('3');
    const [resultado, setResultado] = useState<Total | null>(null);
    const [calculando, setCalculando] = useState(false);
    const [errorCompra, setErrorCompra] = useState('');
    const versionCompra = useRef(0);
    const versionConsulta = useRef(0);
    const [formularioAbierto, setFormularioAbierto] = useState(false);
    const [editando, setEditando] = useState<Producto | null>(null);
    const [formulario, setFormulario] = useState<CamposProducto>({
        nombre: '',
        precio: '',
        stock: '0',
    });
    const [erroresCampos, setErroresCampos] = useState<
        Record<string, string[]>
    >({});
    const [errorGestion, setErrorGestion] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [porEliminar, setPorEliminar] = useState<Producto | null>(null);
    const [mensaje, setMensaje] = useState('');

    function abrirFormulario(producto: Producto | null = null) {
        setEditando(producto);
        setFormulario(
            producto
                ? {
                      nombre: producto.nombre,
                      precio: String(producto.precio),
                      stock: String(producto.stock),
                  }
                : { nombre: '', precio: '', stock: '0' },
        );
        setErroresCampos({});
        setErrorGestion('');
        setMensaje('');
        setFormularioAbierto(true);
    }

    function invalidarConsultas() {
        versionConsulta.current++;
        versionCompra.current++;
        setDetalle(null);
        setResultado(null);
        setErrorConsulta('');
        setErrorCompra('');
    }

    async function guardarProducto(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setGuardando(true);
        setErroresCampos({});
        setErrorGestion('');
        try {
            await consultar(editando ? update.url(editando.id) : store.url(), {
                method: editando ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario),
            });
            setFormularioAbierto(false);
            setMensaje(
                editando
                    ? 'Producto actualizado correctamente.'
                    : 'Producto registrado correctamente.',
            );
            invalidarConsultas();
            await cargarCatalogo();
        } catch (error) {
            if (error instanceof ErrorApi) setErroresCampos(error.campos);
            setErrorGestion(
                error instanceof Error
                    ? error.message
                    : 'No se pudo guardar el producto.',
            );
        } finally {
            setGuardando(false);
        }
    }

    async function eliminarProducto() {
        if (!porEliminar) return;
        setGuardando(true);
        setErrorGestion('');
        try {
            await consultar(destroy.url(porEliminar.id), { method: 'DELETE' });
            if (productoId === String(porEliminar.id)) setProductoId('');
            setPorEliminar(null);
            setMensaje('Producto eliminado correctamente.');
            invalidarConsultas();
            await cargarCatalogo();
        } catch (error) {
            setErrorGestion(
                error instanceof Error
                    ? error.message
                    : 'No se pudo eliminar el producto.',
            );
        } finally {
            setGuardando(false);
        }
    }

    async function cargarCatalogo() {
        setCargando(true);
        setErrorCatalogo('');
        try {
            const catalogo = await consultar<Producto[]>(listarProductos.url());
            setProductos(catalogo);
            setProductoId((actual) =>
                catalogo.some((producto) => String(producto.id) === actual)
                    ? actual
                    : String(catalogo[0]?.id ?? ''),
            );
        } catch (error) {
            setErrorCatalogo(
                error instanceof Error ? error.message : 'Error de conexión.',
            );
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        consultar<Producto[]>(listarProductos.url(), {
            signal: controller.signal,
        })
            .then((catalogo) => {
                if (controller.signal.aborted) return;
                setProductos(catalogo);
                setProductoId((actual) =>
                    catalogo.some((producto) => String(producto.id) === actual)
                        ? actual
                        : String(catalogo[0]?.id ?? ''),
                );
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted)
                    setErrorCatalogo(
                        error instanceof Error
                            ? error.message
                            : 'Error de conexión.',
                    );
            })
            .finally(() => {
                if (!controller.signal.aborted) setCargando(false);
            });
        return () => controller.abort();
    }, []);

    function cambiarCompra(id: string, unidades: string) {
        versionCompra.current++;
        setProductoId(id);
        setCantidad(unidades);
        setResultado(null);
        setErrorCompra('');
    }

    async function buscar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const version = ++versionConsulta.current;
        setBuscando(true);
        setDetalle(null);
        setErrorConsulta('');
        try {
            const producto = await consultar<Producto>(show.url(idConsulta));
            if (version === versionConsulta.current) setDetalle(producto);
        } catch (error) {
            if (version === versionConsulta.current)
                setErrorConsulta(
                    error instanceof Error
                        ? error.message
                        : 'Error de conexión.',
                );
        } finally {
            setBuscando(false);
        }
    }

    async function calcular(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const version = ++versionCompra.current;
        setCalculando(true);
        setResultado(null);
        setErrorCompra('');
        try {
            const total = await consultar<Total>(calcularTotal.url(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    producto_id: Number(productoId),
                    cantidad: Number(cantidad),
                }),
            });
            if (version === versionCompra.current) setResultado(total);
        } catch (error) {
            if (version === versionCompra.current)
                setErrorCompra(
                    error instanceof Error
                        ? error.message
                        : 'Error de conexión.',
                );
        } finally {
            setCalculando(false);
        }
    }

    return (
        <>
            <Head title="Productos" />
            <div className="tienda">
                <header className="tienda-header">
                    <Link href={home()} className="marca">
                        <span>
                            <Package size={23} />
                        </span>
                        Punto<b>Tech</b>
                    </Link>
                    <nav aria-label="Navegación principal">
                        <a href="#catalogo">Catálogo</a>
                        <a href="#consulta">Consultar producto</a>
                        <a href="#compra">
                            <ShoppingBag size={16} /> Calcular compra
                        </a>
                    </nav>
                </header>
                <main className="tienda-main">
                    <section className="hero">
                        <div>
                            <p className="eyebrow">GESTIÓN DE INVENTARIO</p>
                            <h1>
                                Tus productos.
                                <br />
                                <span>Todo bajo control.</span>
                            </h1>
                            <p>
                                Registra productos, actualiza precios y controla
                                <br className="desktop" /> las existencias de tu
                                inventario.
                            </p>
                        </div>
                        <div className="hero-sello">
                            <ShoppingBag size={32} />
                            <strong>Registra. Edita. Organiza.</strong>
                            <small>Tu inventario siempre disponible.</small>
                        </div>
                    </section>
                    <div className="tienda-grid">
                        <div>
                            <section id="catalogo">
                                <div className="section-heading">
                                    <div>
                                        <p className="eyebrow">01 / EXPLORA</p>
                                        <h2>
                                            Nuestro catálogo{' '}
                                            <span className="contador">
                                                {productos.length}
                                            </span>
                                        </h2>
                                    </div>
                                    <div className="catalogo-acciones">
                                        <button
                                            className="boton-oscuro"
                                            onClick={() => abrirFormulario()}
                                            disabled={cargando || guardando}
                                        >
                                            <Plus size={16} /> Nuevo producto
                                        </button>
                                        <button
                                            className="boton-texto"
                                            onClick={cargarCatalogo}
                                            disabled={cargando}
                                        >
                                            <RefreshCw size={15} /> Actualizar
                                        </button>
                                    </div>
                                </div>
                                {mensaje && (
                                    <p className="gestion-exito" role="status">
                                        {mensaje}
                                    </p>
                                )}
                                {cargando && (
                                    <p role="status">Cargando productos…</p>
                                )}
                                {errorCatalogo && (
                                    <p className="error" role="alert">
                                        {errorCatalogo}
                                    </p>
                                )}
                                {!cargando &&
                                    !errorCatalogo &&
                                    !productos.length && (
                                        <div className="catalogo-vacio">
                                            <Package size={32} />
                                            <h3>Tu inventario está vacío</h3>
                                            <p>
                                                Agrega tu primer producto para
                                                empezar.
                                            </p>
                                        </div>
                                    )}
                                <div className="productos-grid">
                                    {productos.map((producto, index) => {
                                        const Icono =
                                            iconos[index % iconos.length];
                                        const seleccionado =
                                            productoId === String(producto.id);
                                        return (
                                            <article
                                                className={`producto-card ${seleccionado ? 'seleccionado' : ''}`}
                                                key={producto.id}
                                            >
                                                <div
                                                    className={`producto-ilustracion tono-${index % 5}`}
                                                >
                                                    <Icono
                                                        size={56}
                                                        strokeWidth={1.25}
                                                    />
                                                    <small>
                                                        #
                                                        {String(
                                                            producto.id,
                                                        ).padStart(2, '0')}
                                                    </small>
                                                </div>
                                                <div className="producto-info">
                                                    <p>
                                                        ACCESORIOS & TECNOLOGÍA
                                                    </p>
                                                    <h3>{producto.nombre}</h3>
                                                    <p className="producto-stock">
                                                        {producto.stock === 0
                                                            ? 'Sin existencias'
                                                            : `${producto.stock} unidades disponibles`}
                                                    </p>
                                                    <div>
                                                        <strong>
                                                            {moneda(
                                                                producto.precio,
                                                            )}
                                                        </strong>
                                                        <button
                                                            aria-label={`Seleccionar ${producto.nombre}`}
                                                            aria-pressed={
                                                                seleccionado
                                                            }
                                                            onClick={() =>
                                                                cambiarCompra(
                                                                    String(
                                                                        producto.id,
                                                                    ),
                                                                    cantidad,
                                                                )
                                                            }
                                                        >
                                                            {seleccionado ? (
                                                                <Check
                                                                    size={17}
                                                                />
                                                            ) : (
                                                                <ArrowRight
                                                                    size={17}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="producto-acciones">
                                                        <button
                                                            className="accion-editar"
                                                            onClick={() =>
                                                                abrirFormulario(
                                                                    producto,
                                                                )
                                                            }
                                                            disabled={
                                                                guardando ||
                                                                cargando
                                                            }
                                                            aria-label={`Editar ${producto.nombre}`}
                                                        >
                                                            <Pencil size={14} />{' '}
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="accion-eliminar"
                                                            onClick={() => {
                                                                setPorEliminar(
                                                                    producto,
                                                                );
                                                                setErrorGestion(
                                                                    '',
                                                                );
                                                                setMensaje('');
                                                            }}
                                                            disabled={
                                                                guardando ||
                                                                cargando
                                                            }
                                                            aria-label={`Eliminar ${producto.nombre}`}
                                                        >
                                                            <Trash2 size={14} />{' '}
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                            <section id="consulta" className="consulta-panel">
                                <div className="section-heading">
                                    <div>
                                        <p className="eyebrow">02 / CONSULTA</p>
                                        <h2>Encuentra un producto</h2>
                                    </div>
                                    <Search size={23} />
                                </div>
                                <p className="texto-secundario">
                                    Ingresa su identificador para consultar el
                                    nombre, precio y stock.
                                </p>
                                <form
                                    onSubmit={buscar}
                                    className="consulta-form"
                                >
                                    <div>
                                        <label htmlFor="id-consulta">
                                            ID del producto
                                        </label>
                                        <input
                                            id="id-consulta"
                                            type="number"
                                            min="1"
                                            max="2147483647"
                                            step="1"
                                            required
                                            value={idConsulta}
                                            onChange={(event) => {
                                                versionConsulta.current++;
                                                setIdConsulta(
                                                    event.target.value,
                                                );
                                                setDetalle(null);
                                                setErrorConsulta('');
                                            }}
                                        />
                                    </div>
                                    <button
                                        className="boton-oscuro"
                                        disabled={buscando}
                                    >
                                        <Search size={16} />
                                        {buscando
                                            ? 'Consultando…'
                                            : 'Consultar'}
                                    </button>
                                </form>
                                <div aria-live="polite">
                                    {errorConsulta && (
                                        <p className="error" role="alert">
                                            {errorConsulta}
                                        </p>
                                    )}
                                    {detalle && (
                                        <div className="detalle">
                                            <div>
                                                <small>
                                                    PRODUCTO #{detalle.id}
                                                </small>
                                                <strong>
                                                    {detalle.nombre}
                                                </strong>
                                                <p className="producto-stock">
                                                    Stock: {detalle.stock}{' '}
                                                    unidades
                                                </p>
                                            </div>
                                            <strong>
                                                {moneda(detalle.precio)}
                                            </strong>
                                            <button
                                                className="boton-texto"
                                                onClick={() =>
                                                    cambiarCompra(
                                                        String(detalle.id),
                                                        cantidad,
                                                    )
                                                }
                                            >
                                                Elegir <ArrowRight size={15} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                        <aside id="compra" className="compra-panel">
                            <span className="compra-icono">
                                <ShoppingBag size={24} />
                            </span>
                            <p className="eyebrow">03 / CALCULA</p>
                            <h2>Tu próxima compra</h2>
                            <p className="texto-secundario">
                                Selecciona un producto y dinos cuántas unidades
                                necesitas.
                            </p>
                            <form onSubmit={calcular}>
                                <label htmlFor="producto-compra">
                                    Producto
                                </label>
                                <select
                                    id="producto-compra"
                                    required
                                    value={productoId}
                                    onChange={(event) =>
                                        cambiarCompra(
                                            event.target.value,
                                            cantidad,
                                        )
                                    }
                                >
                                    <option value="" disabled>
                                        Selecciona un producto
                                    </option>
                                    {productos.map((producto) => (
                                        <option
                                            value={producto.id}
                                            key={producto.id}
                                        >
                                            {producto.nombre} ·{' '}
                                            {moneda(producto.precio)}
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="cantidad-compra">
                                    Cantidad
                                </label>
                                <input
                                    id="cantidad-compra"
                                    type="number"
                                    min="1"
                                    max="2147483647"
                                    step="1"
                                    required
                                    value={cantidad}
                                    onChange={(event) =>
                                        cambiarCompra(
                                            productoId,
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="ayuda">
                                    Unidades enteras, desde 1.
                                </p>
                                <button
                                    className="boton-verde"
                                    disabled={
                                        calculando ||
                                        cargando ||
                                        !productos.length
                                    }
                                >
                                    <ShoppingBag size={17} />
                                    {calculando
                                        ? 'Calculando…'
                                        : 'Calcular total'}
                                    <ArrowRight size={17} />
                                </button>
                            </form>
                            <div aria-live="polite">
                                {errorCompra && (
                                    <p className="error" role="alert">
                                        {errorCompra}
                                    </p>
                                )}
                                {resultado ? (
                                    <div className="resumen">
                                        <p className="resumen-ok">
                                            <Check size={15} /> Cálculo
                                            completado
                                        </p>
                                        <dl>
                                            <div>
                                                <dt>Producto</dt>
                                                <dd>{resultado.producto}</dd>
                                            </div>
                                            <div>
                                                <dt>Precio unitario</dt>
                                                <dd>
                                                    {moneda(
                                                        resultado.precio_unitario,
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt>Cantidad</dt>
                                                <dd>
                                                    {resultado.cantidad}{' '}
                                                    unidades
                                                </dd>
                                            </div>
                                        </dl>
                                        <div className="resumen-total">
                                            <span>Total de tu compra</span>
                                            <strong>
                                                {moneda(resultado.total)}
                                            </strong>
                                            <small>
                                                USD · Dólares estadounidenses
                                            </small>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="resumen-vacio">
                                        <span>Tu total aparecerá aquí</span>
                                        <strong>—</strong>
                                        <p>
                                            Elige un producto y pulsa calcular.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <p className="compra-nota">
                                Esta es una calculadora de compra.
                                <br />
                                No se realiza ningún pago.
                            </p>
                        </aside>
                    </div>
                    <footer className="tienda-footer">
                        <span>PuntoTech · Catálogo de productos</span>
                        <span>Todos los precios en USD</span>
                    </footer>
                </main>
            </div>
            <Dialog
                open={formularioAbierto}
                onOpenChange={(abierto) => {
                    if (!guardando) setFormularioAbierto(abierto);
                }}
            >
                <DialogContent className="producto-dialog">
                    <DialogTitle>
                        {editando ? 'Editar producto' : 'Nuevo producto'}
                    </DialogTitle>
                    <DialogDescription>
                        {editando
                            ? 'Actualiza el nombre, precio y existencias.'
                            : 'Completa los datos para agregar un producto al inventario.'}
                    </DialogDescription>
                    <form onSubmit={guardarProducto} className="producto-form">
                        <fieldset disabled={guardando}>
                            <label htmlFor="producto-nombre">Nombre</label>
                            <input
                                id="producto-nombre"
                                value={formulario.nombre}
                                onChange={(event) =>
                                    setFormulario({
                                        ...formulario,
                                        nombre: event.target.value,
                                    })
                                }
                                required
                                minLength={3}
                                maxLength={100}
                                aria-invalid={!!erroresCampos.nombre}
                                aria-describedby="error-nombre"
                                placeholder="Ej. Teclado mecánico"
                            />
                            {erroresCampos.nombre && (
                                <p id="error-nombre" className="campo-error">
                                    {erroresCampos.nombre[0]}
                                </p>
                            )}
                            <div className="producto-form-fila">
                                <div>
                                    <label htmlFor="producto-precio">
                                        Precio (USD)
                                    </label>
                                    <input
                                        id="producto-precio"
                                        type="number"
                                        value={formulario.precio}
                                        onChange={(event) =>
                                            setFormulario({
                                                ...formulario,
                                                precio: event.target.value,
                                            })
                                        }
                                        required
                                        min="0.01"
                                        max="99999999.99"
                                        step="0.01"
                                        aria-invalid={!!erroresCampos.precio}
                                        aria-describedby="error-precio"
                                        placeholder="0.00"
                                    />
                                    {erroresCampos.precio && (
                                        <p
                                            id="error-precio"
                                            className="campo-error"
                                        >
                                            {erroresCampos.precio[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="producto-stock">
                                        Stock
                                    </label>
                                    <input
                                        id="producto-stock"
                                        type="number"
                                        value={formulario.stock}
                                        onChange={(event) =>
                                            setFormulario({
                                                ...formulario,
                                                stock: event.target.value,
                                            })
                                        }
                                        required
                                        min="0"
                                        max="2147483647"
                                        step="1"
                                        aria-invalid={!!erroresCampos.stock}
                                        aria-describedby="error-stock"
                                    />
                                    {erroresCampos.stock && (
                                        <p
                                            id="error-stock"
                                            className="campo-error"
                                        >
                                            {erroresCampos.stock[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </fieldset>
                        {errorGestion && (
                            <p className="error" role="alert">
                                {errorGestion}
                            </p>
                        )}
                        <div className="gestion-botones">
                            <button
                                type="button"
                                className="boton-cancelar"
                                onClick={() => setFormularioAbierto(false)}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                            <button
                                className="boton-oscuro"
                                disabled={guardando}
                            >
                                {guardando
                                    ? 'Guardando…'
                                    : editando
                                      ? 'Guardar cambios'
                                      : 'Registrar producto'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog
                open={!!porEliminar}
                onOpenChange={(abierto) => {
                    if (!abierto && !guardando) setPorEliminar(null);
                }}
            >
                <DialogContent className="producto-dialog">
                    <DialogTitle>Eliminar producto</DialogTitle>
                    <DialogDescription>
                        ¿Deseas eliminar “{porEliminar?.nombre}” del inventario?
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                    {errorGestion && (
                        <p className="error" role="alert">
                            {errorGestion}
                        </p>
                    )}
                    <div className="gestion-botones">
                        <button
                            className="boton-cancelar"
                            onClick={() => setPorEliminar(null)}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>
                        <button
                            className="boton-eliminar"
                            onClick={eliminarProducto}
                            disabled={guardando}
                        >
                            {guardando ? 'Eliminando…' : 'Eliminar producto'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
