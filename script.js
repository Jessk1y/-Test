let display = document.getElementById('display');

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function calculate() {
    try {
        // Заменяем специальные значения и функции на их JavaScript эквиваленты
        let expression = display.value
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**')
            .replace(/pi/g, 'Math.PI')
            .replace(/e/g, 'Math.E');
        
        // Используем Function вместо eval для безопасности
        let result = Function('"use strict"; return (' + expression + ')')();
        display.value = result;
    } catch (error) {
        display.value = 'Ошибка';
    }
}

// Обработка нажатия клавиш
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Проверяем, является ли клавиша допустимой для калькулятора
    if (/[0-9+\-*/.=()]|Enter|Escape/.test(key)) {
        if (key === '=' || key === 'Enter') {
            calculate();
        } else if (key === 'Escape') {
            clearDisplay();
        } else {
            appendToDisplay(key === '=' ? '' : key);
        }
    } else if(key === 's') {
        appendToDisplay('sin(');
    } else if(key === 'c') {
        appendToDisplay('cos(');
    } else if(key === 't') {
        appendToDisplay('tan(');
    } else if(key === 'l') {
        appendToDisplay('log(');
    } else if(key === 'q') {
        appendToDisplay('sqrt(');
    } else if(key === 'p') {
        appendToDisplay('pi');
    } else if(key === 'e') {
        appendToDisplay('e');
    }
});