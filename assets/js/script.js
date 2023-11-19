function searchWeather() {
    // myAPIKey: 9be6849b96b10ecac5547c81f0c81d08
    //Add your OpenWeatherMap API call here
    // Update the 'weatherData' variable with the fetched data
    // Example: const weatherData = fetchWeatherData(city);

    // After fetching data, you can use it to populate the weather cards
    // Example: populateWeatherCards(weatherData);
}

const apiKey = '9be6849b96b10ecac5547c81f0c81d08';

function searchWeather() {
    const city = 'Boise';
    const apiUrl =  `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    ;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather data:', data);
            populateWeatherCards(data); // Call the function to populate weather cards
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function populateWeatherCards(data) {
    const weatherCardsContainer = document.getElementById('weather-cards-container');
    weatherCardsContainer.innerHTML = '';

    data.list.forEach(day => {
        const card = document.createElement('div');
        card.classList.add('weather-card');

        const dayOfWeek = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
        const iconUrl = `http://openweathermap.org/img/w/${day.weather[0].icon}.png`;

        card.innerHTML = `
            <p>${dayOfWeek}</p>
            <img class="weather-image" src="${iconUrl}" alt="${day.weather[0].description}">
            <p>High: ${day.main.temp_max}&deg;C</p>
            <p>Low: ${day.main.temp_min}&deg;C</p>
            <p>Precipitation: ${day.pop}%</p>
        `;

        weatherCardsContainer.appendChild(card);
    });
}
