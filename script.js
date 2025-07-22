const API_URL = 'http://localhost:8080/api/productos';
const API_PEDIDOS_URL = 'http://localhost:8080/api/pedidos';
const productosDiv = document.getElementById('productos');

// Cargar productos
async function cargarProductos(categoria = null) {
    try {
        const response = await fetch(API_URL);
        const productos = await response.json();

        if (!productosDiv) return; // Evitar error si no estamos en productos.html

        productosDiv.innerHTML = '';

        const productosFiltrados = categoria && categoria.toLowerCase() !== 'todas'
            ? productos.filter(p => p.categoria?.nombre === categoria)
            : productos;

        productosFiltrados.forEach(producto => {
            const productoCard = document.createElement('div');
            productoCard.classList.add('producto-card');
            productoCard.innerHTML = `
                <img src="${producto.imagenUrl}" alt="${producto.nombre}">
                <h4>${producto.nombre}</h4>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Categoría: ${producto.categoria?.nombre || 'Sin categoría'}</p>
                <button 
                    data-id="${producto.id}" 
                    data-title="${producto.nombre}" 
                    data-price="${producto.precio}" 
                    data-image="${producto.imagenUrl}">
                    Agregar al carrito
                </button>
            `;

            productoCard.querySelector('button').addEventListener('click', agregarProducto);
            productosDiv.appendChild(productoCard);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Función agregar al carrito
function agregarProducto(event) {
    const boton = event.target;
    const id = boton.getAttribute('data-id');
    const title = boton.getAttribute('data-title');
    const price = parseFloat(boton.getAttribute('data-price'));
    const image = boton.getAttribute('data-image');

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const productoExistente = carrito.find(producto => producto.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ id, title, price, image, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado al carrito');
    actualizarContadorCarrito();
}

// Contador carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cantidadProductos = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    const carritoLink = document.getElementById('carrito-link');

    if (carritoLink) {
        carritoLink.textContent = `Carrito (${cantidadProductos})`;
    }
}

// Mostrar carrito en carrito.html
function mostrarCarrito() {
    const listaCarritoDiv = document.getElementById('lista-carrito');
    const totalProductosSpan = document.getElementById('total-productos');
    const precioTotalSpan = document.getElementById('precio-total');

    if (!listaCarritoDiv || !totalProductosSpan || !precioTotalSpan) return;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    listaCarritoDiv.innerHTML = '';

    let totalProductos = 0;
    let precioTotal = 0;

    carrito.forEach(producto => {
        totalProductos += producto.cantidad;
        precioTotal += producto.price * producto.cantidad;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-carrito');
        itemDiv.innerHTML = `
            <p><strong>${producto.title}</strong></p>
            <p>Cantidad: ${producto.cantidad}</p>
            <p>Precio unitario: $${producto.price.toFixed(2)}</p>
            <p>Subtotal: $${(producto.price * producto.cantidad).toFixed(2)}</p>
        `;
        listaCarritoDiv.appendChild(itemDiv);
    });

    totalProductosSpan.textContent = totalProductos;
    precioTotalSpan.textContent = precioTotal.toFixed(2);
}

// Vaciar carrito
const botonVaciarCarrito = document.getElementById('vaciar-carrito');
if (botonVaciarCarrito) {
    botonVaciarCarrito.addEventListener('click', () => {
        localStorage.removeItem('carrito');
        mostrarCarrito();
        actualizarContadorCarrito();
    });
}

// Realizar pedido: enviar al backend
const botonRealizarPedido = document.getElementById('realizar-pedido');
if (botonRealizarPedido) {
    botonRealizarPedido.addEventListener('click', async () => {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito.length === 0) {
            alert('El carrito está vacío.');
            return;
        }

        const itemsParaPedido = carrito.map(p => ({
            nombreProducto: p.title,
            cantidad: p.cantidad,
            precioUnitario: p.price
        }));

        try {
            const response = await fetch(API_PEDIDOS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemsParaPedido)
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert('Error al realizar pedido: ' + (errorData.message || response.statusText));
                return;
            }

            const pedidoCreado = await response.json();
            alert('Pedido realizado con éxito. Total: $' + pedidoCreado.montoTotal.toFixed(2));
            localStorage.removeItem('carrito');
            mostrarCarrito();
            actualizarContadorCarrito();

        } catch (error) {
            console.error('Error al realizar pedido:', error);
            alert('Error al realizar pedido, intente nuevamente.');
        }
    });
}

// Cargar y mostrar pedidos en pedidos.html
async function cargarPedidos() {
    const pedidosDiv = document.getElementById('pedidos');
    if (!pedidosDiv) return;

    try {
        const response = await fetch(API_PEDIDOS_URL);
        if (!response.ok) {
            pedidosDiv.textContent = 'Error al cargar los pedidos.';
            return;
        }

        const pedidos = await response.json();

        if (pedidos.length === 0) {
            pedidosDiv.textContent = 'No hay pedidos realizados.';
            return;
        }

        pedidosDiv.innerHTML = '';

        pedidos.forEach(pedido => {
            const pedidoDiv = document.createElement('div');
            pedidoDiv.classList.add('pedido');

            // Fecha formateada
            const fecha = new Date(pedido.fecha).toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            let itemsHtml = '';
            pedido.items.forEach(item => {
                itemsHtml += `
                    <li>${item.nombreProducto} - Cantidad: ${item.cantidad} - Precio unitario: $${item.precioUnitario.toFixed(2)}</li>
                `;
            });

            pedidoDiv.innerHTML = `
                <h3>Pedido #${pedido.id} - Fecha: ${fecha}</h3>
                <ul>${itemsHtml}</ul>
                <p><strong>Total: $${pedido.montoTotal.toFixed(2)}</strong></p>
                <hr>
            `;

            pedidosDiv.appendChild(pedidoDiv);
        });

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        pedidosDiv.textContent = 'Error al cargar los pedidos.';
    }
}

// Iniciar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarContadorCarrito();
    mostrarCarrito();
    cargarPedidos(); // Carga pedidos si estamos en pedidos.html

    const botonesCategoria = document.querySelectorAll('.categorias button');
    botonesCategoria.forEach(boton => {
        boton.addEventListener('click', () => {
            const categoria = boton.getAttribute('data-categoria');
            cargarProductos(categoria.toLowerCase() === 'todas' ? null : categoria);
        });
    });
});
