let display = document.getElementById('display');

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function calculate() {
    try {
        // Используем Function вместо eval для безопасности
        let result = Function('"use strict"; return (' + display.value + ')')();
        display.value = result;
    } catch (error) {
        display.value = 'Ошибка';
    }
}

// Обработка нажатия клавиш
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Проверяем, является ли клавиша допустимой для калькулятора
    if (/[0-9+\-*/.=]/.test(key)) {
        if (key === '=') {
            calculate();
        } else if (key === 'Escape') {
            clearDisplay();
        } else {
            appendToDisplay(key === '=' ? '' : key);
        }
    }
});