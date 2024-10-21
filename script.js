const API_KEY = '123c1040c25506a0f0a5923508af1bdf'

document.addEventListener('DOMContentLoaded', async () => {
    await loadSearchHistory();
    await loadLastCity();
});

async function loadLastCity() {
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    if (history.length > 0) {
        await getWeather(history[0]);
    } else {
        document.getElementById('loadingMessage').textContent = 'Search for a city to see weather information';
    }
}

async function getWeather(city = null) {
    const cityInput = document.getElementById('cityInput');
    const searchCity = city || cityInput.value;
    const loadingMessage = document.getElementById('loadingMessage');
    const weatherInfo = document.getElementById('weatherInfo');

    if (!searchCity) {
        alert('Please enter a city name');
        return;
    }

    loadingMessage.style.display = 'block';
    weatherInfo.style.display = 'none';

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        updateWeatherUI(data);
        
        if (!city) {
            addToHistory(searchCity);
        }
        
        cityInput.value = '';
    } catch (error) {
        alert(error.message);
        loadingMessage.textContent = 'Error loading weather data. Please try again.';
    }
}

function updateWeatherUI(data) {
    const loadingMessage = document.getElementById('loadingMessage');
    const weatherInfo = document.getElementById('weatherInfo');

    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    weatherIcon.style.display = 'block';

    // Hide loading message and show weather info
    loadingMessage.style.display = 'none';
    weatherInfo.style.display = 'block';
}

function addToHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    
    // Remove city if it exists (to avoid duplicates)
    history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
    
    // Add city to the beginning of the array
    history.unshift(city);
    
    // Keep only the last 5 searches
    history = history.slice(0, 5);
    
    localStorage.setItem('weatherHistory', JSON.stringify(history));
    loadSearchHistory();
}

async function loadSearchHistory() {
    const historyItems = document.getElementById('historyItems');
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    const searchHistory = document.getElementById('searchHistory');
    
    historyItems.innerHTML = '';
    
    history.forEach(city => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = city;
        historyItem.onclick = () => {
            getWeather(city);
        };
        historyItems.appendChild(historyItem);
    });

    // Show/hide search history section based on whether there are items
    searchHistory.style.display = history.length ? 'block' : 'none';
}

function clearHistory() {
    localStorage.removeItem('weatherHistory');
    loadSearchHistory();
    // Show default message when history is cleared
    document.getElementById('loadingMessage').textContent = 'Search for a city to see weather information';
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('weatherInfo').style.display = 'none';
}

// Add event listener for Enter key
document.getElementById('cityInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});
