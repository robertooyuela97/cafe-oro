/* ==========================================
   CAFÉ ORO - JAVASCRIPT PRINCIPAL
   ========================================== */

// Inicializar AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// ==========================================
// DATOS DE PRODUCTOS (CON IMÁGENES)
// ==========================================
const products = [

    {
        id: 2,
        name: 'Café Oro Soluble Liofilizado 170g',
        price: 260,
        icon: 'fa-mug-hot',
        image: 'images/cafe-oro-soluble.jpg'      // ← NUEVO
    },
    {
        id: 3,
        name: 'Café Oro Molido 378g',
        price: 145,
        icon: 'fa-mortar-pestle',
        image: 'images/cafe-oro-molido-378g.jpg'  // ← NUEVO
    },
    {
        id: 4,
        name: 'Café Oro Quintal 100 Libras',
        price: 9500,
        icon: 'fa-weight-hanging',
        image: 'images/cafe-oro-quintal.jpg'      // ← NUEVO
    }
];

// ==========================================
// FUNCIONES DE CARRITO
// ==========================================

// Obtener carrito del localStorage
function getCart() {
    const cart = localStorage.getItem('cafeOroCart');
    return cart ? JSON.parse(cart) : [];
}

// Guardar carrito en localStorage
function saveCart(cart) {
    localStorage.setItem('cafeOroCart', JSON.stringify(cart));
}

// Actualizar contador del carrito
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// ==========================================
// RENDERIZAR PRODUCTOS EN LA TIENDA
// ==========================================
// ==========================================
// RENDERIZAR PRODUCTOS EN LA TIENDA
// ==========================================
function renderProducts() {
    const container = document.getElementById('productContainer');
    
    if (!container) return;
    
    container.innerHTML = products.map((product, index) => `
        <div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-price">L. ${product.price.toFixed(2)}</p>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
// ==========================================
// AGREGAR PRODUCTO AL CARRITO
// ==========================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            icon: product.icon,
            image: product.image,  // ← NUEVO: guardar imagen
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartCount();
    
    // Animación del icono del carrito
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Mostrar notificación
    showNotification(`${product.name} agregado al carrito`);
}

// ==========================================
// MOSTRAR NOTIFICACIÓN
// ==========================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #FFD100;
        color: #C8102E;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 9999;
        font-weight: 600;
        animation: slideIn 0.5s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 2500);
}

// ==========================================
// SMOOTH SCROLL PARA ENLACES
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar productos al cargar la página
    renderProducts();
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Smooth scroll para todos los enlaces con href="#"
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ==========================================
// EFECTO DE SCROLL EN NAVBAR
// ==========================================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        } else {
            navbar.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }
    }
});