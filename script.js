//CÓDIGO PARA QUE SE GUARDE EL CARRITO SINO APARECE VACIO//

let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

//INSTUCCIONES PARA JAVA //
const cartItemsContainer = document.querySelector('.cart-items-container'); 
const totalAmountSpan = document.querySelector('.total-amount'); 
const cartCounterSpan = document.getElementById('contador-carrito'); 

//REFERENCIAS PARA EL CUPÓN//

const couponInput = document.querySelector('.coupon-input'); 
const applyCouponBtn = document.querySelector('.apply-coupon-btn'); 

let appliedCouponCode = localStorage.getItem('appliedCouponCode') || null; 


// FUNCIONES GLOBALES DEL CARRITO //

// FUNCIÓN PARA GUARDAR EL CARRITO EN LOCALSTORAGE //
function saveCartToLocalStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    // GUARDA EL CUPÓN APLICADO //
    localStorage.setItem('appliedCouponCode', appliedCouponCode);
    updateCartCounter(); //ACTUALIZA EL CONTADOR CUANDO EL CARRITO CAMBIA //
}

// FUNCIÓN PARA AGREGAR UN PRODUCTO AL CARRITO O AUMENTAR SU CANTIDAD//

function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }
    saveCartToLocalStorage();
    
    if (cartItemsContainer) {
        renderCartItems();
        calculateCartTotal();
    }
}

// FUNCIÓN PARA ACTUALIZAR LA CANTIDAD DE UN PRODUCTO //

function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            // SI LA CANTIDAD LLEGA A 0 O MENOS, ELIMINA EL PRODUCTO //
            cart.splice(itemIndex, 1);
            // SI EL CARRITO QUEDA VACIO, SE RENUEVA EL CUPÓN APLICADO //
            if (cart.length === 0) {
                appliedCouponCode = null;
            }
        }
    }
    saveCartToLocalStorage();
    if (cartItemsContainer) { 
        renderCartItems();
        calculateCartTotal();
    }
}

// FUNCIÓN PARA ELIMINAR PRODUCTO //
function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToLocalStorage();
    
    if (cart.length === 0) {
        appliedCouponCode = null;
    }
    if (cartItemsContainer) { 
        renderCartItems();
        calculateCartTotal();
    }
}

// FUNCIÓN PARA RENDERIZAR LOS ITEMS DEL CARRITO EN HTML //
function renderCartItems() {
    if (!cartItemsContainer) return; 

    cartItemsContainer.innerHTML = ''; 

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #f0ead6; font-size: 1.2em;">Tu carrito está vacío.</p>';
        appliedCouponCode = null; 
        saveCartToLocalStorage(); 
        return;
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="item-image">
            <div class="item-details">
                <span class="item-name">${item.nombre}</span>
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <span class="item-price">$${(item.precio * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <button class="remove-item-btn" data-id="${item.id}">&times;</button> `;
        cartItemsContainer.appendChild(itemElement);
    });

    // AÑADIR EVENT LISTENERS A LOS BOTONES DE CANTIDAD Y ELIMINAR DESPUÉS DE RENDERIZAR //

    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.onclick = (event) => updateQuantity(event.target.dataset.id, -1);
    });

    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.onclick = (event) => updateQuantity(event.target.dataset.id, 1);
    });

    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.onclick = (event) => removeItem(event.target.dataset.id);
    });

    // SI HAY UN CUPÓN APLICADO, MOSTRARLO EN EL INPUT //
    if (couponInput && appliedCouponCode) {
        couponInput.value = appliedCouponCode;
    } else if (couponInput) {
        couponInput.value = ''; 
    }
}

// FUNCIÓN PARA CALCULAR Y MOSTRAR EL TOTAL DEL CARRITO //
function calculateCartTotal() {
    if (!totalAmountSpan) return; 

    let total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

    // APLICAR DESCUENTO SI HAY UN CUPÓN VALIDO Y EL CARRITO NO ESTÁ VACIO
    if (appliedCouponCode === "aprobameprofe" && cart.length > 0) {
        const discountPercentage = 0.20; 
        const discountAmount = total * discountPercentage;
        total -= discountAmount;
        console.log(`Descuento de ${discountPercentage * 100}% aplicado: $${discountAmount.toLocaleString('es-AR')}`);
    } else if (appliedCouponCode && appliedCouponCode !== "aprobameprofe") {
        appliedCouponCode = null; 
        saveCartToLocalStorage(); 
        if (couponInput && couponInput.value.length > 0 && couponInput.value !== "aprobameprofe") {
            couponInput.value = ''; 
        }
    }

    totalAmountSpan.textContent = `$${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; // Formatear a moneda argentina
}

// FUNCIÑON PARA ACTUALIZAR EL CONTEADOR DEL CARRITO EN LA NAVEGACIÓN //
function updateCartCounter() {
    if (cartCounterSpan) { // Asegurarse de que el elemento existe
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounterSpan.textContent = totalItems > 0 ? totalItems : ''; 
        if (totalItems > 0) {
            cartCounterSpan.style.display = 'block'; 
        } else {
            cartCounterSpan.style.display = 'none'; 
        }
    }
}

// FUNCIONES PARA CARGAR PRODUCTOS //

/**

  @param {string} jsonPath 
  @param {string} containerSelector 
  @param {string} productClass 
 */
async function loadProducts(jsonPath, containerSelector, productClass) {
    const productListDiv = document.querySelector(containerSelector);
    if (!productListDiv) return; 

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        
        productListDiv.innerHTML = ''; 

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add(productClass);
            productElement.innerHTML = `
                <img src="${product.imagen}" alt="${product.nombre}">
                <h3>${product.nombre}</h3>
                <p class="precio">$${product.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <button class="comprar-btn" 
                                             data-id="${product.id}" 
                                             data-nombre="${product.nombre}" 
                                             data-precio="${product.precio}"
                                             data-imagen="${product.imagen}">
                    <span>AGREGAR AL CARRITO</span> </button>
            `;
            productListDiv.appendChild(productElement);
        });

        // AÑADIR EVENT LISTENERS A LOS BOTONES "AGREGAR AL CARRITO" DENTRO DE ESTE CONTENEDOR //
        productListDiv.querySelectorAll('.comprar-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productToAdd = {
                    id: event.target.dataset.id || event.target.closest('.comprar-btn').dataset.id, 
                    nombre: event.target.dataset.nombre || event.target.closest('.comprar-btn').dataset.nombre,
                    precio: parseFloat(event.target.dataset.precio || event.target.closest('.comprar-btn').dataset.precio),
                    imagen: event.target.dataset.imagen || event.target.closest('.comprar-btn').dataset.imagen
                };
                addToCart(productToAdd);
            });
        });

    } catch (error) {
        console.error(`Error al obtener los productos de ${jsonPath}:`, error);
        productListDiv.innerHTML = `<p style="text-align: center; color: red;">Error al cargar los productos de ${jsonPath}.</p>`;
    }
}

// INICIALIZACIÓN GLOBAL CUANDO EL DOM ESTÁ LISTO //

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter(); 

  
    if (cartItemsContainer) {
        renderCartItems(); 
        calculateCartTotal(); 
        
        // FUNCIONALIDAD PARA EL BOTÓN "INICIAR PAGO" //
        const checkoutButton = document.querySelector('.checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                alert('¡Proceso de pago iniciado! (Esta es solo una demostración)');
                
            });
        }

        // EVENT LISTENERS PARA EL BOTÓN "APLICAR" DEL CUPÓN //
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => {
                const enteredCode = couponInput.value.trim().toLowerCase(); 
                const validCode = "aprobameprofe"; 

                if (enteredCode === validCode && cart.length > 0) {
                    appliedCouponCode = validCode; 
                    saveCartToLocalStorage(); 
                    calculateCartTotal(); 
                    alert('¡Cupón aplicado con éxito! Disfruta de un 20% de descuento.');
                } else if (enteredCode.length > 0 && enteredCode !== validCode) {
                    appliedCouponCode = null; 
                    saveCartToLocalStorage(); 
                    couponInput.value = ''; 
                    alert('Código de cupón inválido.');
                } else if (enteredCode === validCode && cart.length === 0) {
                    alert('No puedes aplicar un cupón con el carrito vacío.');
                } else if (enteredCode.length === 0 && appliedCouponCode) {
                    
                    appliedCouponCode = null;
                    saveCartToLocalStorage();
                    calculateCartTotal();
                    alert('Cupón eliminado.');
                }
            });
        }
    }
    
    // CARGAR VARITAS //
    if (document.querySelector('.listado-varitas')) {
        loadProducts('data/varitas.json', '.listado-varitas', 'producto-varitas'); 
    }

    // CARGAR FIGURAS //
    if (document.querySelector('.listado-figuras')) {
        loadProducts('data/figuras.json', '.listado-figuras', 'producto-figura');
    }

    // CARGAR TÚNICAS //
    if (document.querySelector('.listado-tunicas')) {
        loadProducts('data/tunicas.json', '.listado-tunicas', 'producto-tunicas');
    }

    // CARGAR LIBROS //
    if (document.querySelector('.listado-libros')) {
        loadProducts('data/libros.json', '.listado-libros', 'producto-libros');
    }
});

// MENU NAVEGACIÓN PARA CELULARES //
document.addEventListener('DOMContentLoaded', function() {
    
    const menuToggle = document.getElementById('menu-icon'); 
    const navLinks = document.querySelector('.nav-principal'); // Seleccionamos la UL completa

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
});