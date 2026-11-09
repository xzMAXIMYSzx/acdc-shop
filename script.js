// ==========================================
// КАЛЬКУЛЯТОР
// ==========================================
const display = document.getElementById('calc-display');

if (display) {
  const buttons = document.querySelectorAll('.calc-buttons button');
  let currentInput = "";
  let operator = null;
  let previousValue = null;
  let waitingForNewValue = false;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.innerText;

      if (!isNaN(value) || value === '.') {
        if (value === '.' && currentInput.includes('.')) return;
        if (waitingForNewValue) {
          currentInput = value;
          waitingForNewValue = false;
        } else {
          currentInput += value; 
        }
        display.value = currentInput; 
      } 
      else if (['+', '-', '*', '/'].includes(value)) {
        if (currentInput === "" && previousValue !== null) {
          operator = value;
          return;
        }
        operator = value;
        previousValue = parseFloat(currentInput); 
        currentInput = ""; 
        waitingForNewValue = true;
      } 
      else if (value === '=') {
        if (operator && previousValue !== null) {
          const currentValue = parseFloat(currentInput) || previousValue;
          let result = 0;
          
          if (operator === '+') result = previousValue + currentValue;
          if (operator === '-') result = previousValue - currentValue;
          if (operator === '*') result = previousValue * currentValue;
          
          if (operator === '/') {
            if (currentValue === 0) {
              display.value = "Ошибка";
              currentInput = "";
              operator = null;
              previousValue = null;
              waitingForNewValue = false;
              return;
            } else {
              result = previousValue / currentValue;
            }
          }
          
          display.value = result; 
          currentInput = result.toString(); 
          operator = null;
          previousValue = null;
          waitingForNewValue = true; 
        }
      }
      else if (value === 'C') {
        currentInput = "";
        operator = null;
        previousValue = null;
        waitingForNewValue = false;
        display.value = "";
      }
    });
  });
}
const weatherInfo = document.getElementById('weather-info'); // <--- ВОТ ЭТА СТРОЧКА
if (weatherInfo) {
  async function getWeather() {
    try {
      weatherInfo.innerHTML = "Загрузка данных...";
      console.log("1. Начали загрузку");

      const response = await fetch(`https://wttr.in/Tambov?format=j1`);
      console.log("2. Ответ получен, статус:", response.status);

      const textData = await response.text();
      console.log("3. Текст получен, длина:", textData.length);

      const tempMatch = textData.match(/"temp_C":"(\d+)"/);
      const windMatch = textData.match(/"windspeedKmph":"(\d+)"/);
      console.log("4. Совпадения:", tempMatch, windMatch);

      if (tempMatch && windMatch) {
        weatherInfo.innerHTML = `🌡 Температура: ${tempMatch[1]}°C<br>💨 Ветер: ${windMatch[1]} км/ч`;
        console.log("5. Успешно вывели на экран!");
      } else {
        throw new Error("Данные не найдены в тексте");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      weatherInfo.innerHTML = `Ошибка: ${error.message}`;
    }
  }
  getWeather();
}

// ==========================================
// КОРЗИНА (ДОБАВЛЕНИЕ, ЦЕНЫ, УДАЛЕНИЕ, + и -, ОФОРМЛЕНИЕ)
// ==========================================
const cartCount = document.getElementById('cart-count');
const cartLink = document.getElementById('cart-link');
const toastContainer = document.getElementById('toast-container');
const cartItemsContainer = document.getElementById('cart-items');

// Загружаем корзину из памяти
let cart = JSON.parse(localStorage.getItem('myCart')) || [];

// Функция для обновления цифры в шапке
function updateCartCount() {
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;
  }
}

// Функция для показа уведомлений
function showToast(message) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

// 1. ДОБАВЛЕНИЕ ТОВАРА
const allBuyButtons = document.querySelectorAll('.buy-btn');

if (allBuyButtons.length > 0) {
  allBuyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productName = button.getAttribute('data-name') || "Товар";
      const productPrice = parseInt(button.getAttribute('data-price')) || 0; 
      
      const existingItem = cart.find(item => item.name === productName);

      if (existingItem) {
        existingItem.quantity += 1; 
      } else {
        cart.push({ name: productName, price: productPrice, quantity: 1 }); 
      }

      localStorage.setItem('myCart', JSON.stringify(cart));
      updateCartCount(); 
      showToast(`${productName} добавлен в корзину!`);
    });
  });
}

// 2. ПЕРЕХОД В КОРЗИНУ
if (cartLink) {
  cartLink.addEventListener('click', function(event) {
    event.preventDefault(); 
    window.location.href = 'cart.html'; 
  });
}

// 3. ОТОБРАЖЕНИЕ КОРЗИНЫ
if (cartItemsContainer) {
  const clearBtn = document.getElementById('clear-cart-btn');
  const totalContainer = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let totalSum = 0; 
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Ваша корзина пуста 😢</p>";
      if (clearBtn) clearBtn.style.display = "none";
      if (totalContainer) totalContainer.style.display = "none";
      if (checkoutBtn) checkoutBtn.style.display = "none";
      updateCartCount();
      return;
    }

    cart.forEach((item, index) => {
      const itemTotal = (item.price || 0) * item.quantity;
      totalSum += itemTotal;

      cartItemsContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
          <div>
            <span style="font-weight: bold;">${item.name}</span><br>
            <span style="font-size: 14px; color: #666;">${item.price} ₽</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="qty-btn" data-index="${index}" data-action="decrease" style="padding: 2px 8px; cursor: pointer; border: 1px solid #ccc; background: #f4f4f4; border-radius: 3px;">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-index="${index}" data-action="increase" style="padding: 2px 8px; cursor: pointer; border: 1px solid #ccc; background: #f4f4f4; border-radius: 3px;">+</button>
            <button class="delete-item-btn" data-index="${index}" style="background: #e74c3c; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; margin-left: 10px;">Удалить</button>
          </div>
        </div>
      `;
    });

    if (totalContainer) {
      totalContainer.style.display = "block";
      totalContainer.innerHTML = `Итого: ${totalSum} ₽`;
    }

    if (clearBtn) clearBtn.style.display = "block";
    if (checkoutBtn) checkoutBtn.style.display = "block";
    
    // Логика кнопок + и -
    const qtyButtons = document.querySelectorAll('.qty-btn');
    qtyButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        const action = this.getAttribute('data-action');

        if (action === 'increase') {
          cart[index].quantity += 1;
        } else if (action === 'decrease') {
          if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
          } else {
            cart.splice(index, 1); 
          }
        }
        localStorage.setItem('myCart', JSON.stringify(cart));
        renderCart(); 
        updateCartCount(); 
      });
    });

    // Логика кнопок Удалить
    const deleteButtons = document.querySelectorAll('.delete-item-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const itemIndex = parseInt(this.getAttribute('data-index'));
        cart.splice(itemIndex, 1); 
        localStorage.setItem('myCart', JSON.stringify(cart));
        renderCart(); 
        updateCartCount(); 
        showToast("Товар удален из корзины"); 
      });
    });
    
    updateCartCount();
  }

  renderCart();

  // 4. ОЧИСТКА ВСЕЙ КОРЗИНЫ
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('myCart'); 
      cart = []; 
      renderCart(); 
      updateCartCount();
      showToast("Корзина полностью очищена");
    });
  }

  // 5. ОФОРМЛЕНИЕ ЗАКАЗА
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      let finalSum = 0;
      cart.forEach(item => { finalSum += item.price * item.quantity; });

      showToast(`Заказ на сумму ${finalSum} ₽ успешно оформлен! 🎉`);
      
      // Очищаем корзину после оформления
      localStorage.removeItem('myCart'); 
      cart = []; 
      renderCart(); 
      updateCartCount();
    });
  }
}

// 6. ВАЛИДАЦИЯ ФОРМЫ
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const formMessage = document.getElementById('form-message');
    
    formMessage.innerHTML = "";
    formMessage.style.color = "red";

    if (name === "" || email === "" || message === "") {
      formMessage.innerHTML = "Ошибка: Заполните все поля!";
      return; 
    }
    if (!email.includes('@')) {
      formMessage.innerHTML = "Ошибка: Email должен содержать символ @";
      return;
    }
    formMessage.style.color = "green";
    formMessage.innerHTML = "Успешно! Ваше сообщение отправлено.";
    contactForm.reset();
  });
}

// 7. МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
const burgerMenu = document.getElementById('burgerMenu');
const navMenu = document.getElementById('navMenu');

if (burgerMenu && navMenu) {
  burgerMenu.addEventListener('click', function() {
    navMenu.classList.toggle('active');
  });
}

// 8. ОБНОВЛЕНИЕ СЧЕТЧИКА ПРИ ЗАГРУЗКЕ
updateCartCount();