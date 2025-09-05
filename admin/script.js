// admin/script.js

// Admin default credentials (dipakai di login.html)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";

// Cek login admin
function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem("admin_logged_in", "true");
        window.location.href = "dashboard.html";
    } else {
        alert("Username atau password salah!");
    }
}

// Cek session saat load dashboard
function checkAdminSession() {
    if (localStorage.getItem("admin_logged_in") !== "true") {
        window.location.href = "login.html";
    }
}

// Logout admin
function adminLogout() {
    localStorage.removeItem("admin_logged_in");
    window.location.href = "login.html";
}

// Simulasi database produk & transaksi admin
let products = JSON.parse(localStorage.getItem("products")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Tampilkan daftar produk di dashboard
function displayProducts() {
    const table = document.getElementById("productsTable");
    table.innerHTML = "";
    products.forEach((prod, index) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = prod.name;
        row.insertCell(1).innerText = prod.price;
        row.insertCell(2).innerHTML = `
            <button onclick="editProduct(${index})">Edit</button>
            <button onclick="deleteProduct(${index})">Hapus</button>
        `;
    });
}

// Tambah produk baru
function addProduct(event) {
    event.preventDefault();
    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const image = document.getElementById("productImage").value; // filename atau url
    products.push({ name, price, image });
    localStorage.setItem("products", JSON.stringify(products));
    displayProducts();
    document.getElementById("addProductForm").reset();
    alert("Produk berhasil ditambahkan!");
}

// Edit produk
function editProduct(index) {
    const prod = products[index];
    const newName = prompt("Nama baru:", prod.name);
    const newPrice = prompt("Harga baru:", prod.price);
    if (newName !== null && newPrice !== null) {
        products[index].name = newName;
        products[index].price = parseFloat(newPrice);
        localStorage.setItem("products", JSON.stringify(products));
        displayProducts();
    }
}

// Hapus produk
function deleteProduct(index) {
    if (confirm("Yakin ingin menghapus produk ini?")) {
        products.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));
        displayProducts();
    }
}

// Tampilkan transaksi
function displayTransactions() {
    const table = document.getElementById("transactionsTable");
    table.innerHTML = "";
    transactions.forEach((trx, index) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = trx.user;
        row.insertCell(1).innerText = trx.items.map(i => i.name + " x" + i.qty).join(", ");
        row.insertCell(2).innerText = trx.phone;
        row.insertCell(3).innerText = trx.status;
        row.insertCell(4).innerHTML = `
            <button onclick="updateTransactionStatus(${index}, 'done')">Done</button>
            <button onclick="updateTransactionStatus(${index}, 'batal')">Batal</button>
        `;
    });
}

// Update status transaksi
function updateTransactionStatus(index, status) {
    transactions[index].status = status;
    localStorage.setItem("transactions", JSON.stringify(transactions));
    displayTransactions();
}

// Inisialisasi saat load
window.addEventListener("DOMContentLoaded", () => {
    // jika dashboard.html
    if (document.getElementById("productsTable")) {
        checkAdminSession();
        displayProducts();
        displayTransactions();
        document.getElementById("addProductForm").addEventListener("submit", addProduct);
        document.getElementById("logoutBtn").addEventListener("click", adminLogout);
    }

    // jika login.html
    if (document.getElementById("loginForm")) {
        document.getElementById("loginForm").addEventListener("submit", adminLogin);
    }
});