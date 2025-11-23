// Глобальные переменные
let display = document.getElementById('display');
let calculationHistory = JSON.parse(localStorage.getItem('calculationHistory')) || [];

// Переключение вкладок
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Убираем активный класс со всех кнопок и вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Добавляем активный класс к нажатой кнопке
        this.classList.add('active');
        
        // Показываем соответствующую вкладку
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        
        // Если переключаемся на вкладку истории, обновляем её
        if(tabId === 'history') {
            updateHistoryDisplay();
        }
        
        // Если переключаемся на вкладку конвертера, обновляем единицы измерения
        if(tabId === 'converter') {
            updateConverterUnits();
        }
    });
});

// Функции для калькулятора
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
        result = Number(result.toFixed(10)); // Ограничиваем количество знаков после запятой
        display.value = result;
        
        // Сохраняем в историю
        addToHistory(display.value, result);
    } catch (error) {
        display.value = 'Ошибка';
    }
}

// История вычислений
function addToHistory(expression, result) {
    const historyItem = {
        id: Date.now(),
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleString()
    };
    
    calculationHistory.unshift(historyItem);
    if(calculationHistory.length > 50) { // Ограничиваем историю 50 элементами
        calculationHistory.pop();
    }
    
    localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    if(calculationHistory.length === 0) {
        historyList.innerHTML = '<p>История пуста</p>';
        return;
    }
    
    calculationHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div>${item.expression} = ${item.result}</div>
            <div>${item.timestamp}</div>
        `;
        historyList.appendChild(historyItem);
    });
}

function clearHistory() {
    calculationHistory = [];
    localStorage.removeItem('calculationHistory');
    updateHistoryDisplay();
}

function exportHistory(format) {
    if(calculationHistory.length === 0) {
        alert('История пуста');
        return;
    }
    
    let data, mimeType, filename;
    
    if(format === 'json') {
        data = JSON.stringify(calculationHistory, null, 2);
        mimeType = 'application/json';
        filename = 'calculation_history.json';
    } else if(format === 'csv') {
        // Создаем CSV данные
        data = 'Выражение,Результат,Время\n';
        calculationHistory.forEach(item => {
            data += `"${item.expression}","${item.result}","${item.timestamp}"\n`;
        });
        mimeType = 'text/csv';
        filename = 'calculation_history.csv';
    }
    
    // Создаем и скачиваем файл
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Конвертер величин
function updateConverterUnits() {
    const converterType = document.getElementById('converter-type').value;
    const fromUnitSelect = document.getElementById('from-unit');
    const toUnitSelect = document.getElementById('to-unit');
    
    // Очищаем текущие опции
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';
    
    // Определяем доступные единицы измерения в зависимости от типа конвертера
    let units = [];
    
    switch(converterType) {
        case 'length':
            units = [
                { value: 'mm', label: 'Миллиметры (mm)' },
                { value: 'cm', label: 'Сантиметры (cm)' },
                { value: 'm', label: 'Метры (m)' },
                { value: 'km', label: 'Километры (km)' },
                { value: 'in', label: 'Дюймы (in)' },
                { value: 'ft', label: 'Футы (ft)' },
                { value: 'yd', label: 'Ярды (yd)' },
                { value: 'mi', label: 'Мили (mi)' }
            ];
            break;
        case 'weight':
            units = [
                { value: 'mg', label: 'Миллиграммы (mg)' },
                { value: 'g', label: 'Граммы (g)' },
                { value: 'kg', label: 'Килограммы (kg)' },
                { value: 't', label: 'Тонны (t)' },
                { value: 'oz', label: 'Унции (oz)' },
                { value: 'lb', label: 'Фунты (lb)' }
            ];
            break;
        case 'temperature':
            units = [
                { value: 'c', label: 'Цельсий (°C)' },
                { value: 'f', label: 'Фаренгейт (°F)' },
                { value: 'k', label: 'Кельвин (K)' }
            ];
            break;
    }
    
    // Добавляем опции в селекты
    units.forEach(unit => {
        const fromOption = document.createElement('option');
        fromOption.value = unit.value;
        fromOption.textContent = unit.label;
        fromUnitSelect.appendChild(fromOption);
        
        const toOption = document.createElement('option');
        toOption.value = unit.value;
        toOption.textContent = unit.label;
        toUnitSelect.appendChild(toOption);
    });
    
    // Устанавливаем первые значения по умолчанию
    if(fromUnitSelect.options.length > 0) {
        fromUnitSelect.selectedIndex = 0;
    }
    if(toUnitSelect.options.length > 1) {
        toUnitSelect.selectedIndex = 1;
    }
}

function convertUnits() {
    const fromValue = parseFloat(document.getElementById('from-value').value);
    const fromUnit = document.getElementById('from-unit').value;
    const toUnit = document.getElementById('to-unit').value;
    
    if(isNaN(fromValue)) {
        document.getElementById('to-value').value = 'Ошибка';
        return;
    }
    
    const converterType = document.getElementById('converter-type').value;
    let result;
    
    try {
        if(converterType === 'temperature') {
            // Конвертация температуры
            result = convertTemperature(fromValue, fromUnit, toUnit);
        } else {
            // Конвертация длины или массы
            result = convertUnit(fromValue, fromUnit, toUnit, converterType);
        }
        
        result = Number(result.toFixed(6)); // Ограничиваем количество знаков после запятой
        document.getElementById('to-value').value = result;
        
        // Добавляем в историю
        const expression = `${fromValue} ${fromUnit} → ${toUnit}`;
        addToHistory(expression, result);
    } catch (error) {
        document.getElementById('to-value').value = 'Ошибка';
    }
}

function convertUnit(value, fromUnit, toUnit, type) {
    // Коэффициенты конвертации в метры (для длины) или в килограммы (для массы)
    const conversionFactors = {
        length: {
            mm: 0.001,
            cm: 0.01,
            m: 1,
            km: 1000,
            in: 0.0254,
            ft: 0.3048,
            yd: 0.9144,
            mi: 1609.344
        },
        weight: {
            mg: 0.000001,
            g: 0.001,
            kg: 1,
            t: 1000,
            oz: 0.0283495,
            lb: 0.453592
        }
    };
    
    const factors = conversionFactors[type];
    
    if(!factors[fromUnit] || !factors[toUnit]) {
        throw new Error('Неподдерживаемая единица измерения');
    }
    
    // Преобразуем в базовую единицу (м или кг), затем в целевую
    const baseValue = value * factors[fromUnit];
    return baseValue / factors[toUnit];
}

function convertTemperature(value, fromUnit, toUnit) {
    // Преобразуем в Цельсий, затем в целевую единицу
    let celsius;
    
    switch(fromUnit) {
        case 'c':
            celsius = value;
            break;
        case 'f':
            celsius = (value - 32) * 5/9;
            break;
        case 'k':
            celsius = value - 273.15;
            break;
        default:
            throw new Error('Неподдерживаемая единица измерения температуры');
    }
    
    switch(toUnit) {
        case 'c':
            return celsius;
        case 'f':
            return (celsius * 9/5) + 32;
        case 'k':
            return celsius + 273.15;
        default:
            throw new Error('Неподдерживаемая единица измерения температуры');
    }
}

function swapUnits() {
    const fromUnitSelect = document.getElementById('from-unit');
    const toUnitSelect = document.getElementById('to-unit');
    const fromValue = document.getElementById('from-value').value;
    const toValue = document.getElementById('to-value').value;
    
    // Меняем местами единицы измерения
    const tempUnit = fromUnitSelect.value;
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = tempUnit;
    
    // Меняем местами значения
    document.getElementById('from-value').value = toValue;
    document.getElementById('to-value').value = fromValue;
}

// Решение уравнений
function solveLinear() {
    const a = parseFloat(document.getElementById('linear-a').value);
    const b = parseFloat(document.getElementById('linear-b').value);
    
    if(isNaN(a) || isNaN(b)) {
        document.getElementById('linear-result').textContent = 'Ошибка: введите числовые значения';
        return;
    }
    
    if(a === 0) {
        if(b === 0) {
            document.getElementById('linear-result').textContent = 'Уравнение имеет бесконечно много решений';
        } else {
            document.getElementById('linear-result').textContent = 'Уравнение не имеет решений';
        }
        return;
    }
    
    const x = -b / a;
    const result = `x = ${x.toFixed(6)}`;
    document.getElementById('linear-result').textContent = result;
    
    // Добавляем в историю
    const expression = `Линейное уравнение: ${a}x + ${b} = 0`;
    addToHistory(expression, result);
}

function solveQuadratic() {
    const a = parseFloat(document.getElementById('quad-a').value);
    const b = parseFloat(document.getElementById('quad-b').value);
    const c = parseFloat(document.getElementById('quad-c').value);
    
    if(isNaN(a) || isNaN(b) || isNaN(c)) {
        document.getElementById('quad-result').textContent = 'Ошибка: введите числовые значения';
        return;
    }
    
    if(a === 0) {
        // Это линейное уравнение
        if(b === 0) {
            if(c === 0) {
                document.getElementById('quad-result').textContent = 'Уравнение имеет бесконечно много решений';
            } else {
                document.getElementById('quad-result').textContent = 'Уравнение не имеет решений';
            }
        } else {
            const x = -c / b;
            const result = `x = ${x.toFixed(6)}`;
            document.getElementById('quad-result').textContent = result;
        }
        return;
    }
    
    const discriminant = b * b - 4 * a * c;
    
    if(discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const result = `x₁ = ${x1.toFixed(6)}, x₂ = ${x2.toFixed(6)}`;
        document.getElementById('quad-result').textContent = result;
    } else if(discriminant === 0) {
        const x = -b / (2 * a);
        const result = `x = ${x.toFixed(6)}`;
        document.getElementById('quad-result').textContent = result;
    } else {
        const realPart = -b / (2 * a);
        const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);
        const result = `x₁ = ${realPart.toFixed(6)} + ${imaginaryPart.toFixed(6)}i, x₂ = ${realPart.toFixed(6)} - ${imaginaryPart.toFixed(6)}i`;
        document.getElementById('quad-result').textContent = result;
    }
    
    // Добавляем в историю
    const expression = `Квадратное уравнение: ${a}x² + ${b}x + ${c} = 0`;
    const result = document.getElementById('quad-result').textContent;
    addToHistory(expression, result);
}

// Настройки
document.getElementById('theme-select').addEventListener('change', function() {
    const theme = this.value;
    if(theme === 'dark') {
        document.body.style.background = 'linear-gradient(135deg, #232f3e 0%, #1a2332 100%)';
        document.querySelector('.container').style.backgroundColor = '#343a40';
        document.querySelector('.container').style.color = 'white';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        document.querySelector('.container').style.backgroundColor = 'white';
        document.querySelector('.container').style.color = 'black';
    }
});

document.getElementById('font-size').addEventListener('input', function() {
    const fontSize = this.value;
    document.querySelector('.container').style.fontSize = fontSize + 'px';
    document.getElementById('font-size-value').textContent = fontSize + 'px';
});

document.getElementById('language').addEventListener('change', function() {
    // Здесь можно добавить реализацию многоязычности
    const language = this.value;
    // Пока что просто выводим сообщение
    if(language === 'en') {
        alert('Language changed to English');
    } else {
        alert('Язык изменен на русский');
    }
});

// Инициализация
document.getElementById('converter-type').addEventListener('change', updateConverterUnits);
updateConverterUnits(); // Инициализируем конвертер при загрузке

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