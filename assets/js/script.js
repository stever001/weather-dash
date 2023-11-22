const apiKey = '9be6849b96b10ecac5547c81f0c81d08';

document.addEventListener('DOMContentLoaded', () => {
    const searchHistory = getSearchHistory();
    displaySearchHistory(searchHistory);
});

//Forecast starts the next day after current day, for 5 days
function filterDataForNoon(dataList) {
    const filteredData = {};

    dataList.forEach(day => {
        const date = new Date(day.dt * 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Exclude the current day and consider the next five days
        if (date > today && Object.keys(filteredData).length < 6) {
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
        }
    });

    return Object.values(filteredData);
}


function getCurrentWeather(dataList) {
    const currentDate = new Date();
    const currentWeatherData = dataList.find(item => {
        const itemDate = new Date(item.dt_txt);
        return itemDate > currentDate;
    });

    if (!currentWeatherData) {
        console.error('Current weather data not found.');
        return null;
    }

    const currentWeather = {
        icon: currentWeatherData.weather[0].icon,
        temp: currentWeatherData.main.temp,
        wind_speed: currentWeatherData.wind.speed,
        humidity: currentWeatherData.main.humidity,
        pop: currentWeatherData.pop,
    };

    return currentWeather;
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
            const currentWeather = getCurrentWeather(data.list);

            populateWeatherCards(filteredData);
            populateCurrentWeatherCard(currentWeather, city); // Pass city to the function
            saveSearchToHistory(city);
            displaySearchHistory(getSearchHistory());
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}


function populateCurrentWeatherCard(currentWeather, city) {

    console.log('city in populateCurrentWeatherCard:', city); // Add this line for debugging
    const currentWeatherCardContainer = document.getElementById('current-weather-card-container');
    currentWeatherCardContainer.innerHTML = '';

    const card = document.createElement('div');
    card.classList.add('current-weather-card');

    const iconUrl = `http://openweathermap.org/img/w/${currentWeather.icon}.png`;

    const date = new Date(); // You can use a specific date format here if needed

    card.innerHTML = `
        <h2>Current Weather in ${city}</h2>
        <p class="card-date">${date.toLocaleDateString('en-US', { weekday: 'long',month:'long', day:'numeric',hour: 'numeric',minute: 'numeric', hour12: 'true' })}</p>
        <img class="weather-image" src="${iconUrl}" alt="${currentWeather.icon}">
        <p>Temperature: ${Math.round(currentWeather.temp)}&deg;F</p>
        <p>Wind Speed: ${Math.round(currentWeather.wind_speed)} mph</p>
        <p>Humidity: ${currentWeather.humidity}%</p>
        <p>Chance of Precip: ${5 * Math.round(currentWeather.pop / 5)}%</p>
        <p>Chance of Precip: ${(Math.ceil(currentWeather.pop * 100 / 10) * 10)}%</p>
    `;

    currentWeatherCardContainer.appendChild(card);
    
    
}

function populateWeatherCards(data) {
    const weatherCardsContainer = document.getElementById('weather-cards-container');
    weatherCardsContainer.innerHTML = '';

    console.log('Filtered weather data:', data);

    if (!data || data.length === 0) {
        console.error('Invalid or empty data received.');
        return;
    }

    // Skip the first element (current day) and start from the second element
    for (let i = 1; i < data.length; i++) {
        const day = data[i];

        const card = document.createElement('div');
        card.classList.add('weather-card');

        const date = day.date.toLocaleDateString('en-US', { weekday: 'long',month:'numeric',day:'numeric' });
        const iconUrl = `http://openweathermap.org/img/w/${day.icon}.png`;

        card.innerHTML = `
            <p>${date}</p>
            <img class="weather-image" src="${iconUrl}" alt="${day.icon}">
            <p>High: ${Math.round(day.temp_max)}&deg;F</p>
            <p>Wind Speed: ${Math.round(day.wind_speed)} mph</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Chance of Precip: ${(Math.ceil(day.pop * 100 / 10) * 10)}%</p>
           
        `;

        weatherCardsContainer.appendChild(card);
    }
}

//Convert the first character of each word to uppercase and the rest to lowercase
function convertToMixedCase(input) {
    return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

//updated to limit to 5 items in search history. Will remove oldest to maintain 5 or less
function saveSearchToHistory(city) {
    const searchHistory = getSearchHistory();
    const formattedCity = convertToMixedCase(city);

    // Limit the search history to a maximum of 5 items
    if (searchHistory.length >= 5) {
        searchHistory.shift(); // Remove the oldest item
    }

    if (!searchHistory.includes(formattedCity)) {
        searchHistory.push(formattedCity);
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
