// this project develop the cart bascket feature
const productsDom = document.querySelector('.theme-section');
const qtySection = document.querySelector('.qty');
const totalPriceSection = document.querySelector('.total-price');
const cartContentSection = document.querySelector('.cart-content');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartIconSection = document.querySelector('.icon-container');
const cartCloseSection = document.querySelector('.close-btn');
const clearCartBtn = document.querySelector('.clear-cart');

let cart = [];

class FetchProducts {
    async getProducts() {
        try {
            const result = await fetch('https://rkbeauty.it/wp-json/wc/v3/products?consumer_key=ck_c5ae9da1f94a554fdc78aec09e125964d26d3c8b&consumer_secret=cs_ff12ff0616e71f7cb620b60ae23a86f06874dc84');
            const data = await result.json();
            let products = data.map((item) => {
                const productId = item.id;
                const productName = item.name;
                const productPrice = item.price;
                const productImage = item.images[0].src;
                return { productId, productName, productPrice, productImage };
            });
            return products;
        } catch (err) {
            console.log(err);
        }
    }
}

class View {
    showProduct(products) {
        let results = '';
        products.forEach(item => {
            results += `
                <article>
                    <img src="${item.productImage}" alt="Product Image">
                    <h2>${item.productName}</h2>
                    <p class="price">${item.productPrice} $</p>
                    <button class="add-to-card" id="${item.productId}">Add to Cart</button>
                </article>
            `;
        });
        productsDom.innerHTML = results;
    }

    getCardButtons() {
        let buttons = [...document.querySelectorAll('.add-to-card')];
        buttons.forEach(item => {
            let buttonId = item.id;
            item.addEventListener('click', (e) => {
                let cardItem = { ...Storage.addProductToCard(buttonId), amount: 1 };
                cart = [...cart, cardItem];
                Storage.saveCard(cart);
                this.showQtyNumber(cart);
                this.addCartItems(cardItem);
                this.showSideBar();
            });
        });
    }

    showQtyNumber(cart) {
        let totalPrice = 0;
        let totalqty = 0;

        cart.forEach((item) => {
            totalPrice += item.productPrice * item.amount;
            totalqty += item.amount;
        });
        qtySection.innerHTML = totalqty;
        totalPriceSection.innerHTML = totalPrice + '$';
    }

    addCartItems(item) {
        const div = document.createElement('div');
        div.classList.add('cart-items');
        div.setAttribute('id', item.productId);
        div.innerHTML = `
            <img class="item-image" src="${item.productImage}" alt="">
            <h4 class="item-title">${item.productName}</h4>
            <h4 class="item-price">${item.productPrice}</h4>
            <div class="qty-container">
                <i class="fas up-icon" data-id="${item.productId}">+</i>
                <h4 class="item-qty">${item.amount}</h4>
                <i class="fas down-icon" data-id="${item.productId}">-</i>
            </div>
            <img src="images/close.png" class="remove-cart-item" id="${item.productId}">
        `;
        
        // Add the event listener for the remove button
        div.querySelector('.remove-cart-item').addEventListener('click', (event) => {
            const itemId = event.target.id;
            this.removeProduct(itemId); // Remove the specific item from cart
            div.remove(); // Remove the item from the DOM
        });

        cartContentSection.appendChild(div);
    }

    showSideBar() {
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('show-cart');
    }

    hideSideBar() {
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('show-cart');
    }

    initApp() {
        cart = Storage.getCart();
        this.populate(cart);
        this.showQtyNumber(cart);
        cartIconSection.addEventListener('click', this.showSideBar.bind(this));
        cartCloseSection.addEventListener('click', this.hideSideBar.bind(this));
    }

    populate(cart) {
        cart.forEach((item) => {
            this.addCartItems(item);
        });
    }

    cartProccess() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        // Handle quantity increase and decrease
        cartContentSection.addEventListener('click', (event) => {
            const id = event.target.dataset.id;

            if (event.target.classList.contains('up-icon')) {
                let product = cart.find((item) => item.productId == id);
                if (product) {
                    product.amount += 1;
                    this.showQtyNumber(cart);
                    Storage.saveCard(cart);
                    event.target.nextElementSibling.innerHTML = product.amount;
                }
            } else if (event.target.classList.contains('down-icon')) {
                let product = cart.find((item) => item.productId == id);
                if (product && product.amount > 1) {
                    product.amount -= 1;
                    this.showQtyNumber(cart);
                    Storage.saveCard(cart);
                    event.target.previousElementSibling.innerHTML = product.amount;
                }
            }
        });
    }

    clearCart() {
        cart.forEach(item => this.removeProduct(item.productId));
        while (cartContentSection.children.length > 0) {
            cartContentSection.removeChild(cartContentSection.children[0]);
        }
        cart = [];
        this.showQtyNumber(cart);
        Storage.saveCard(cart);
    }

    removeProduct(id) {
        cart = cart.filter((item) => item.productId !== id);
        this.showQtyNumber(cart);
        Storage.saveCard(cart);
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    static addProductToCard(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find((item) => item.productId == id);
    }
    static saveCard(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

addEventListener("DOMContentLoaded", () => {
    const fetchProduct = new FetchProducts();
    const view = new View();
    view.initApp();

    fetchProduct.getProducts().then((data) => {
        Storage.saveProducts(data);
        view.showProduct(data);
    }).then(() => {
        view.getCardButtons();
        view.cartProccess();
    });
});
