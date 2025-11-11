/* ==========================================
   CAFÉ ORO - CARRITO DE COMPRAS
   ========================================== */

// Variables globales
let cartData = [];
const SHIPPING_COST = 50;

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartDisplay();
    setupEventListeners();
});

// ==========================================
// CARGAR CARRITO
// ==========================================
function loadCart() {
    const cart = localStorage.getItem('cafeOroCart');
    cartData = cart ? JSON.parse(cart) : [];
    updateCartCount();
}

function saveCart() {
    localStorage.setItem('cafeOroCart', JSON.stringify(cartData));
    updateCartCount();
}

function updateCartCount() {
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// ==========================================
// MOSTRAR CARRITO
// ==========================================
function updateCartDisplay() {
    const container = document.getElementById('cartItemsContainer');
    const emptyMessage = document.getElementById('emptyCartMessage');
    
    if (cartData.length === 0) {
        container.style.display = 'none';
        emptyMessage.style.display = 'block';
        updateSummary();
        return;
    }
    
    container.style.display = 'block';
    emptyMessage.style.display = 'none';
    
    container.innerHTML = cartData.map(item => `
        <div class="cart-item">
            <div class="cart-item-icon">
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.name}" class="cart-item-img">` : 
                    `<i class="fas ${item.icon}"></i>`
                }
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">L. ${item.price.toFixed(2)} c/u</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="btn-remove-item" onclick="removeItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    updateSummary();
}

// ==========================================
// ACTUALIZAR CANTIDAD
// ==========================================
function updateQuantity(itemId, change) {
    const item = cartData.find(i => i.id === itemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeItem(itemId);
    } else {
        saveCart();
        updateCartDisplay();
    }
}

// ==========================================
// ELIMINAR PRODUCTO
// ==========================================
function removeItem(itemId) {
    cartData = cartData.filter(item => item.id !== itemId);
    saveCart();
    updateCartDisplay();
    showNotification('Producto eliminado del carrito');
}

// ==========================================
// VACIAR CARRITO
// ==========================================
function clearCart() {
    if (cartData.length === 0) return;
    
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
        cartData = [];
        saveCart();
        updateCartDisplay();
        showNotification('Carrito vaciado');
    }
}

// ==========================================
// ACTUALIZAR RESUMEN
// ==========================================
function updateSummary() {
    const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cartData.length > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;
    
    document.getElementById('subtotalAmount').textContent = `L. ${subtotal.toFixed(2)}`;
    document.getElementById('shippingAmount').textContent = `L. ${shipping.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `L. ${total.toFixed(2)}`;
}

// ==========================================
// CONFIGURAR EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Botón vaciar carrito
    document.getElementById('clearCartBtn')?.addEventListener('click', clearCart);
    
    // Botón proceder al pago
    document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);
    
    // Formulario de checkout
    document.getElementById('checkoutForm')?.addEventListener('submit', completeOrder);
    
    // Cambio de método de pago
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', toggleCardInfo);
    });
    
    // Formateo de campos
    setupFieldFormatting();
}

// ==========================================
// ABRIR MODAL DE CHECKOUT
// ==========================================
function openCheckoutModal() {
    if (cartData.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
    showStep(1);
}

// ==========================================
// NAVEGACIÓN ENTRE PASOS
// ==========================================
function showStep(stepNumber) {
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

function nextStep(stepNumber) {
    if (!validateCurrentStep(stepNumber - 1)) return;
    
    if (stepNumber === 4) {
        showConfirmation();
    }
    
    showStep(stepNumber);
}

function prevStep(stepNumber) {
    showStep(stepNumber);
}

// ==========================================
// VALIDACIÓN DE PASOS
// ==========================================
function validateCurrentStep(stepNumber) {
    const currentStep = document.getElementById(`step${stepNumber}`);
    const inputs = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
    
    for (let input of inputs) {
        if (!input.value.trim()) {
            input.focus();
            showNotification('Por favor completa todos los campos obligatorios');
            return false;
        }
    }
    
    // Validaciones específicas
    if (stepNumber === 1) {
        const email = document.getElementById('email').value;
        if (!isValidEmail(email)) {
            showNotification('Por favor ingresa un correo válido');
            return false;
        }
    }
    
    if (stepNumber === 3) {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        if (paymentMethod === 'credit') {
            if (!validateCardInfo()) return false;
        }
    }
    
    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCardInfo() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardName = document.getElementById('cardName').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        showNotification('Número de tarjeta inválido');
        return false;
    }
    
    if (!cardName.trim()) {
        showNotification('Ingresa el nombre en la tarjeta');
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showNotification('Fecha de expiración inválida (MM/AA)');
        return false;
    }
    
    if (cardCVV.length < 3 || cardCVV.length > 4) {
        showNotification('CVV inválido');
        return false;
    }
    
    return true;
}

// ==========================================
// MOSTRAR/OCULTAR INFO DE TARJETA
// ==========================================
function toggleCardInfo() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const cardInfo = document.getElementById('cardInfo');
    
    if (paymentMethod === 'credit') {
        cardInfo.style.display = 'block';
    } else {
        cardInfo.style.display = 'none';
    }
}

// ==========================================
// FORMATEO DE CAMPOS
// ==========================================
function setupFieldFormatting() {
    // Formato de número de tarjeta
    const cardNumber = document.getElementById('cardNumber');
    cardNumber?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
    
    // Formato de fecha de expiración
    const cardExpiry = document.getElementById('cardExpiry');
    cardExpiry?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
    
    // Solo números en CVV
    const cardCVV = document.getElementById('cardCVV');
    cardCVV?.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Formato de teléfono
    const phone = document.getElementById('phone');
    phone?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 4) {
            value = value.slice(0, 4) + '-' + value.slice(4, 8);
        }
        e.target.value = value;
    });
}

// ==========================================
// MOSTRAR CONFIRMACIÓN
// ==========================================
function showConfirmation() {
    // Información personal
    const personalInfo = `
        <p><strong>Nombre:</strong> ${document.getElementById('fullName').value}</p>
        <p><strong>Teléfono:</strong> ${document.getElementById('phone').value}</p>
        <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
    `;
    document.getElementById('confirmPersonalInfo').innerHTML = personalInfo;
    
    // Dirección
    const addressInfo = `
        <p><strong>Departamento:</strong> ${document.getElementById('department').options[document.getElementById('department').selectedIndex].text}</p>
        <p><strong>Ciudad:</strong> ${document.getElementById('city').value}</p>
        <p><strong>Dirección:</strong> ${document.getElementById('address').value}</p>
        ${document.getElementById('reference').value ? `<p><strong>Referencia:</strong> ${document.getElementById('reference').value}</p>` : ''}
    `;
    document.getElementById('confirmAddressInfo').innerHTML = addressInfo;
    
    // Método de pago
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    let paymentInfo = paymentMethod.parentElement.textContent.trim();
    
    if (paymentMethod.value === 'credit') {
        const cardNumber = document.getElementById('cardNumber').value;
        const lastFour = cardNumber.slice(-4);
        paymentInfo += `<p>Tarjeta terminada en: ****${lastFour}</p>`;
    }
    document.getElementById('confirmPaymentInfo').innerHTML = `<p>${paymentInfo}</p>`;
    
    // Productos
    const productsInfo = cartData.map(item => `
        <p><strong>${item.name}</strong> x${item.quantity} - L. ${(item.price * item.quantity).toFixed(2)}</p>
    `).join('');
    document.getElementById('confirmProductsInfo').innerHTML = productsInfo;
    
    // Total
    const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + SHIPPING_COST;
    document.getElementById('confirmTotal').textContent = `L. ${total.toFixed(2)}`;
}

// ==========================================
// COMPLETAR PEDIDO
// ==========================================
function completeOrder(e) {
    e.preventDefault();
    
    if (!document.getElementById('acceptTerms').checked) {
        showNotification('Debes aceptar los términos y condiciones');
        return;
    }
    
    // Generar número de orden
    const orderNumber = 'CO-' + Date.now().toString().slice(-8);
    
    // Guardar orden (simulación)
    const orderData = {
        orderNumber: orderNumber,
        date: new Date().toISOString(),
        customer: {
            name: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        },
        address: {
            department: document.getElementById('department').value,
            city: document.getElementById('city').value,
            address: document.getElementById('address').value
        },
        items: cartData,
        subtotal: cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: SHIPPING_COST,
        total: cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0) + SHIPPING_COST,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };
    
    console.log('Orden procesada:', orderData);
    
    // Mostrar modal de éxito
    document.getElementById('orderNumber').textContent = orderNumber;
    const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
    checkoutModal.hide();
    
    setTimeout(() => {
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Vaciar carrito
        cartData = [];
        saveCart();
        updateCartDisplay();
    }, 500);
}

// ==========================================
// NOTIFICACIONES
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