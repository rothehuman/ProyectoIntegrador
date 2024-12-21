// URL de la API
const API_URL = 'https://fakestoreapi.com/products';

// Contenedor de productos
const productosDiv = document.getElementById('productos');

// Cargar productos
if (productosDiv) {
    async function cargarProductos() {
        try {
            const response = await fetch(API_URL);
            const productos = await response.json();

            productos.forEach(producto => {
                // Crear tarjeta
                const productoCard = document.createElement('div');
                productoCard.classList.add('producto-card');
                productoCard.innerHTML = `
                    <img src="${producto.image}" alt="${producto.title}">
                    <h4>${producto.title}</h4>
                    <p>Precio: $${producto.price}</p>
                    <p>Categoría: ${producto.category}</p>
                    <p>Puntuación: ${producto.rating?.rate || 'N/A'}</p>
                    <button 
                        data-id="${producto.id}" 
                        data-title="${producto.title}" 
                        data-price="${producto.price}" 
                        data-image="${producto.image}">
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
    cargarProductos();
}

// Agregar productos al carrito
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

// Actualizar el contador del carrito en el nav
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cantidadProductos = carrito.reduce((total, producto) => total + producto.cantidad, 0);

    const carritoLink = document.getElementById('carrito-link');
    if (carritoLink) {
        carritoLink.textContent = `Carrito (${cantidadProductos})`;
    }
}

// Actualizar el carrito completo
function actualizarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const listaCarrito = document.getElementById('lista-carrito');
    const totalProductos = document.getElementById('total-productos');
    const precioTotal = document.getElementById('precio-total');

    if (listaCarrito) {
        listaCarrito.innerHTML = '';

        let total = 0;
        let cantidadProductos = 0;

        carrito.forEach(producto => {
            // Crear tarjeta
            const productoCard = document.createElement('div');
            productoCard.classList.add('producto-card');
            productoCard.innerHTML = `
                <img src="${producto.image}" alt="${producto.title}">
                <h4>${producto.title}</h4>
                <p>Precio: $${producto.price}</p>
                <p>Cantidad: ${producto.cantidad}</p>
                <div>
                    <button class="disminuir" data-id="${producto.id}">-</button>
                    <button class="aumentar" data-id="${producto.id}">+</button>
                    <button class="eliminar" data-id="${producto.id}">Eliminar</button>
                </div>
            `;

            // Agregar eventos a los botones
            productoCard.querySelector('.aumentar').addEventListener('click', () => aumentarProducto(producto.id));
            productoCard.querySelector('.disminuir').addEventListener('click', () => disminuirProducto(producto.id));
            productoCard.querySelector('.eliminar').addEventListener('click', () => eliminarProducto(producto.id));

            listaCarrito.appendChild(productoCard);

            total += producto.price * producto.cantidad;
            cantidadProductos += producto.cantidad;
        });

        totalProductos.textContent = cantidadProductos;
        precioTotal.textContent = total.toFixed(2);
    }

    actualizarContadorCarrito();
}

// Aumentar la cantidad de un producto
function aumentarProducto(idProducto) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = carrito.find(prod => prod.id === idProducto);

    if (producto) {
        producto.cantidad += 1;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarrito();
    }
}

// Disminuir la cantidad de un producto
function disminuirProducto(idProducto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = carrito.find(prod => prod.id === idProducto);

    if (producto && producto.cantidad > 1) {
        producto.cantidad -= 1;
    } else {
        carrito = carrito.filter(prod => prod.id !== idProducto);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
}

// Eliminar un producto del carrito
function eliminarProducto(idProducto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(producto => producto.id !== idProducto);

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
}

// Vaciar el carrito
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
if (vaciarCarritoBtn) {
    vaciarCarritoBtn.addEventListener('click', () => {
        localStorage.removeItem('carrito');
        actualizarCarrito();
    });
}

// Realizar pedido
const realizarPedidoBtn = document.getElementById('realizar-pedido');
if (realizarPedidoBtn) {
    realizarPedidoBtn.addEventListener('click', () => {
        localStorage.removeItem('carrito');
        actualizarCarrito();
        alert('¡Compra realizada con éxito! Recibirá un email con los detalles.');
    });
}

// Actualizar el contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    if (document.getElementById('lista-carrito')) {
        actualizarCarrito();
    }
});


// validar formulario
if (window.location.pathname.includes("contacto.html")) {
    document.getElementById('contactenos').addEventListener('submit', function(event) {
        let isValid = true;

        // Validar nombre
        if (document.getElementById('nombre').value.trim() === "") {
            alert("El nombre es obligatorio.");
            isValid = false;
        }

        // Validar el correo
        const correo = document.getElementById('correo').value;
        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (correo.trim() === "") {
            alert("El correo electrónico es obligatorio.");
            isValid = false;
        } else if (!correoRegex.test(correo)) {
            alert("Por favor, ingresa un correo electrónico válido.");
            isValid = false;
        }

        // Validar mensaje
        if (document.getElementById('mensaje').value.trim() === "") {
            alert("El mensaje es obligatorio.");
            isValid = false;
        }

        // Si hay errores, no se manda el formulario
        if (!isValid) {
            event.preventDefault();
        }
    });
}