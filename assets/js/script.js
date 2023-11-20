const apiKey = '9be6849b96b10ecac5547c81f0c81d08';

document.addEventListener('DOMContentLoaded', () => {
    const searchHistory = getSearchHistory();
    displaySearchHistory(searchHistory);
});

function filterDataForNoon(dataList) {
    const filteredData = {};

    dataList.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        if (!filteredData[dayKey]) {
            filteredData[dayKey] = {
                date: date,
                icon: day.weather[0].icon,
                temp_max: day.main.temp_max,
                wind_speed: day.wind.speed,
                humidity: day.main.humidity,
                pop: day.pop,
            };
        }
    });

    return Object.values(filteredData);
}

function searchWeather() {
    const cityInput = document.getElementById('search-bar');
    const city = cityInput.value;

    if (!city) {
        alert('Please enter a city!');
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather data:', data);

            if (!data.list || data.list.length === 0) {
                console.error('Empty or invalid data received.');
                return;
            }

            const filteredData = filterDataForNoon(data.list);

            populateWeatherCards(filteredData);
            saveSearchToHistory(city);
            displaySearchHistory(getSearchHistory());
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function populateWeatherCards(data) {
    const weatherCardsContainer = document.getElementById('weather-cards-container');
    weatherCardsContainer.innerHTML = '';

    console.log('Filtered weather data:', data);

    if (!data || data.length === 0) {
        console.error('Invalid or empty data received.');
        return;
    }

    data.forEach(day => {
        const card = document.createElement('div');
        card.classList.add('weather-card');

        const date = day.date.toLocaleDateString('en-US', { weekday: 'long' });
        const iconUrl = `http://openweathermap.org/img/w/${day.icon}.png`;

        card.innerHTML = `
            <p>${date}</p>
            <img class="weather-image" src="${iconUrl}" alt="${day.icon}">
            <p>High: ${day.temp_max}&deg;F</p>
            <p>Wind Speed: ${day.wind_speed} mph</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Chance of Precip: ${day.pop}%</p>
        `;

        weatherCardsContainer.appendChild(card);
    });
}

function saveSearchToHistory(city) {
    const searchHistory = getSearchHistory();
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}

function getSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory')) || [];
}

function displaySearchHistory(history) {
    const searchHistoryContainer = document.getElementById('search-history-container');
    searchHistoryContainer.innerHTML = '';

    history.forEach(city => {
        const searchItem = document.createElement('div');
        searchItem.classList.add('search-history-item');
        searchItem.textContent = city;
        searchItem.addEventListener('click', () => {
            document.getElementById('search-bar').value = city;
            searchWeather();
        });

        searchHistoryContainer.appendChild(searchItem);
    });
}
