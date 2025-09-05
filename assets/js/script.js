// assets/js/script.js

// Supabase setup (isi sesuai project kamu)
const SUPABASE_URL = 'https://grcgachetkbbxgdewcty.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyY2dhY2hldGtiYnhnZGV3Y3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzM1MzcsImV4cCI6MjA3MjYwOTUzN30.AxFhUICmyR3IP16Fox9a_7rqu7JCsAQbmB59CR0M-CA';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let cart = [];

// Load cart from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCart();
    }
    renderProducts();
});

// Fetch and render products
async function renderProducts() {
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Error fetching products:', error);
        return;
    }
    const productContainer = document.getElementById('product-list');
    if (!productContainer) return;

    productContainer.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="assets/images/${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Rp ${product.price}</p>
            <div class="btn-group">
                <button onclick="buyNow('${product.id}')">Buy</button>
                <button onclick="addToCart('${product.id}')">Add to Cart</button>
            </div>
        `;
        productContainer.appendChild(card);
    });
}

// Add product to cart
async function addToCart(productId) {
    const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} telah ditambahkan ke keranjang.`);
    renderCart();
}

// Buy product directly
function buyNow(productId) {
    const { data: product } = cart.find(item => item.id === productId) || {};
    localStorage.setItem('checkoutItem', JSON.stringify({ id: productId }));
    window.location.href = 'checkout.html';
}

// Render cart
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        const row = document.createElement('div');
        row.classList.add('cart-row');
        row.innerHTML = `
            <span>${item.name}</span>
            <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity('${item.id}', this.value)">
            <span>Rp ${item.price * item.quantity}</span>
            <button onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        cartContainer.appendChild(row);
    });

    const totalElem = document.getElementById('cart-total');
    if (totalElem) totalElem.textContent = `Rp ${total}`;
}

// Update quantity
function updateQuantity(productId, qty) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity = parseInt(qty);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Checkout process
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang kosong!');
        return;
    }
    const phone = prompt('Masukkan nomor telepon Anda:');
    if (!phone) return alert('Nomor telepon wajib diisi.');
    
    const checkoutData = cart.map(item => ({
        ...item,
        phone,
        status: 'pending',
        timestamp: new Date().toISOString()
    }));

    supabase.from('orders').insert(checkoutData).then(({ error }) => {
        if (error) {
            console.error('Checkout failed:', error);
            return alert('Checkout gagal, coba lagi.');
        }
        alert('Pesanan Anda telah dikirim ke admin. Tunggu konfirmasi.');
        cart = [];
        localStorage.removeItem('cart');
        renderCart();
        window.location.href = 'index.html';
    });
}

// Render user purchase history
async function renderHistory(userPhone) {
    const { data: history, error } = await supabase.from('orders').select('*').eq('phone', userPhone).order('timestamp', { ascending: false });
    if (error) {
        console.error('Error fetching history:', error);
        return;
    }
    const historyContainer = document.getElementById('history-items');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    history.forEach(item => {
        const row = document.createElement('div');
        row.classList.add('history-row');
        row.innerHTML = `
            <span>${item.name}</span>
            <span>${item.quantity}</span>
            <span>Rp ${item.price * item.quantity}</span>
            <span>${item.status}</span>
        `;
        historyContainer.appendChild(row);
    });
}