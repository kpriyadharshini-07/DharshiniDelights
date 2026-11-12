
const foods = [
    {
        id: 1,
        name: "Masala Dosa",
        category: "South Indian",
        price: 80,
        emoji: "🥞",
        description: "Crispy dosa served with chutney and sambar.",
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Veg Meals",
        category: "South Indian",
        price: 140,
        emoji: "🍛",
        description: "A satisfying traditional vegetarian meal.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Veg Burger",
        category: "Fast Food",
        price: 110,
        emoji: "🍔",
        description: "A tasty burger packed with fresh vegetables.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Margherita Pizza",
        category: "Fast Food",
        price: 220,
        emoji: "🍕",
        description: "Cheesy pizza with a classic tomato topping.",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Chocolate Cake",
        category: "Dessert",
        price: 100,
        emoji: "🍰",
        description: "Rich chocolate cake for a sweet treat.",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Ice Cream",
        category: "Dessert",
        price: 70,
        emoji: "🍨",
        description: "A cool and creamy dessert.",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80"
    }
];

const CART_KEY = "dharshiniDelightsCart";
const ORDER_KEY = "dharshiniDelightsLastOrder";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(amount) {
    return "₹" + amount;
}

// MENU PAGE
function renderFoods(category = "All", search = "") {
    const grid = document.getElementById("foodGrid");
    if (!grid) return;

    const filtered = foods.filter(food => {
        const matchesCategory =
            category === "All" || food.category === category;
        const matchesSearch =
            food.name.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-message">No food items found.</p>';
        return;
    }

    grid.innerHTML = filtered.map(food => `
        <article class="food-card">
            <img src="${food.image}" alt="${food.name}"
                 onerror="this.style.display='none'">
            <div class="food-info">
                <h3>${food.emoji} ${food.name}</h3>
                <p>${food.description}</p>
                <div class="food-bottom">
                    <span class="price">${money(food.price)}</span>
                    <button class="small-btn" data-add="${food.id}">
                        Add to Cart +
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

let selectedCategory = "All";

document.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add]");
    if (addButton) {
        const id = Number(addButton.dataset.add);
        const cart = getCart();
        const existing = cart.find(item => item.id === id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id, quantity: 1 });
        }

        saveCart(cart);
        addButton.textContent = "Added ✓";
        setTimeout(() => {
            if (addButton.isConnected) {
                addButton.textContent = "Add to Cart +";
            }
        }, 900);
    }

    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
        selectedCategory = filterButton.dataset.filter;
        renderFoods(
            selectedCategory,
            document.getElementById("foodSearch")?.value || ""
        );
    }

    const cartButton = event.target.closest("[data-cart-action]");
    if (cartButton) {
        updateCart(
            Number(cartButton.dataset.id),
            cartButton.dataset.cartAction
        );
    }
});

const foodSearch = document.getElementById("foodSearch");
if (foodSearch) {
    foodSearch.addEventListener("input", () => {
        renderFoods(selectedCategory, foodSearch.value);
    });
}

// CART PAGE
function updateCart(id, action) {
    const cart = getCart();
    const item = cart.find(product => product.id === id);
    if (!item) return;

    if (action === "plus") item.quantity += 1;
    if (action === "minus") item.quantity -= 1;

    let updatedCart = cart.filter(product => product.quantity > 0);

    if (action === "remove") {
        updatedCart = cart.filter(product => product.id !== id);
    }

    saveCart(updatedCart);
    renderCart();
}

function renderCart() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    const cart = getCart();
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML =
            '<p class="empty-message">Your cart is empty. <a href="menu.html">Browse the menu</a>.</p>';
    } else {
        container.innerHTML = cart.map(item => {
            const food = foods.find(product => product.id === item.id);
            if (!food) return "";

            total += food.price * item.quantity;

            return `
                <div class="cart-item">
                    <div>
                        <strong>${food.emoji} ${food.name}</strong>
                        <p>${money(food.price)} each</p>
                    </div>
                    <div>
                        <button data-cart-action="minus" data-id="${food.id}">−</button>
                        ${item.quantity}
                        <button data-cart-action="plus" data-id="${food.id}">+</button>
                        <button class="remove" data-cart-action="remove"
                                data-id="${food.id}">Remove</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    document.getElementById("cartTotal").textContent = money(total);
}

// CHECKOUT
const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", event => {
        event.preventDefault();

        const cart = getCart();
        if (cart.length === 0) {
            alert("Please add food items before placing an order.");
            return;
        }

        if (!checkoutForm.reportValidity()) return;

        const name = document.getElementById("customerName").value.trim();
        const phone = document.getElementById("customerPhone").value.trim();
        const address = document.getElementById("customerAddress").value.trim();

        if (!name || !address || !/^[0-9]{10}$/.test(phone)) {
            alert("Please enter valid delivery details.");
            return;
        }

        const total = cart.reduce((sum, item) => {
            const food = foods.find(product => product.id === item.id);
            return sum + (food ? food.price * item.quantity : 0);
        }, 0);

        const order = {
            name,
            phone,
            address,
            total,
            items: cart.map(item => {
                const food = foods.find(product => product.id === item.id);
                return {
                    name: food.name,
                    quantity: item.quantity,
                    price: food.price
                };
            })
        };

        localStorage.setItem(ORDER_KEY, JSON.stringify(order));
        saveCart([]);
        window.location.href = "success.html";
    });
}

// SUCCESS PAGE
const orderDetails = document.getElementById("orderDetails");

if (orderDetails) {
    try {
        const order = JSON.parse(localStorage.getItem(ORDER_KEY));

        if (order) {
            const itemText = order.items.map(item =>
                `${item.name} × ${item.quantity}`
            ).join(", ");

            orderDetails.textContent =
                `Thank you, ${order.name}! Items: ${itemText}. Total: ${money(order.total)}. Delivery address: ${order.address}.`;
        } else {
            orderDetails.textContent =
                "No recent demo order was found. You can browse the menu to start an order.";
        }
    } catch {
        orderDetails.textContent = "Unable to load the demo order details.";
    }
}

// CONTACT PAGE
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        document.getElementById("contactFeedback").textContent =
            "Thank you! Your demo message has been recorded on this page.";

        contactForm.reset();
    });
}

// Initial page rendering
renderFoods();
renderCart();
