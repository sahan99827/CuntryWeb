   function getCityFromURL() {
      const params = new URLSearchParams(window.location.search);
      return params.get('name');
    }

    async function getWeather(cityName = null) {
      const city = cityName || document.getElementById('cityInput').value.trim();
      const resultDiv = document.getElementById('result');
      const loadingDiv = document.getElementById('loading');
      const errorDiv = document.getElementById('error');
      const fetchButton = document.getElementById('fetchButton');

      if (!city) {
        showError('Please enter a city name');
        return;
      }

      resultDiv.classList.add('d-none');
      errorDiv.classList.add('d-none');
      loadingDiv.classList.remove('d-none');
      fetchButton.disabled = true;

      const apiKey = '0f571d5048b8417796393130251211';
      const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

      try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('City not found. Please check the spelling and try again.');
        }
        
        const data = await response.json();
        displayWeatherData(data);

        loadingDiv.classList.add('d-none');
        resultDiv.classList.remove('d-none');

      } catch (error) {
        loadingDiv.classList.add('d-none');
        showError(error.message);
      } finally {
        fetchButton.disabled = false;
      }
    }

    function displayWeatherData(data) {
      const loc = data.location;
      const cur = data.current;

      // Location Information
      document.getElementById('cityName').textContent = loc.name;
      document.getElementById('region').textContent = loc.region || 'N/A';
      document.getElementById('country').textContent = loc.country;
      document.getElementById('timezone').textContent = loc.tz_id;
      document.getElementById('localtime').textContent = loc.localtime;
      document.getElementById('coordinates').textContent = `Lat: ${loc.lat}°, Lon: ${loc.lon}°`;

      // Main Weather Display
      document.getElementById('icon').src = `https:${cur.condition.icon}`;
      document.getElementById('temperature').innerHTML = `${Math.round(cur.temp_c)}<span class="temp-unit">°C</span>`;
      document.getElementById('condition').textContent = cur.condition.text;
      document.getElementById('lastUpdated').textContent = `Last updated: ${cur.last_updated}`;
      
      // Day/Night Badge
      const dayNightBadge = document.getElementById('dayNightBadge');
      if (cur.is_day === 1) {
        dayNightBadge.textContent = '☀️ Day';
        dayNightBadge.className = 'day-night-badge';
      } else {
        dayNightBadge.textContent = '🌙 Night';
        dayNightBadge.className = 'day-night-badge night';
      }

      // Temperature Details
      document.getElementById('tempC').textContent = cur.temp_c;
      document.getElementById('tempF').textContent = cur.temp_f;
      document.getElementById('feelslikeC').textContent = cur.feelslike_c;
      document.getElementById('feelslikeF').textContent = cur.feelslike_f;
      document.getElementById('windchillC').textContent = cur.windchill_c;
      document.getElementById('windchillF').textContent = cur.windchill_f;
      document.getElementById('heatindexC').textContent = cur.heatindex_c;
      document.getElementById('heatindexF').textContent = cur.heatindex_f;
      document.getElementById('dewpointC').textContent = cur.dewpoint_c;
      document.getElementById('dewpointF').textContent = cur.dewpoint_f;

      // Wind & Pressure
      document.getElementById('windKph').textContent = cur.wind_kph;
      document.getElementById('windMph').textContent = cur.wind_mph;
      document.getElementById('windDir').textContent = cur.wind_dir;
      document.getElementById('windDegree').textContent = cur.wind_degree;
      document.getElementById('gustKph').textContent = cur.gust_kph;
      document.getElementById('gustMph').textContent = cur.gust_mph;
      document.getElementById('pressureMb').textContent = cur.pressure_mb;
      document.getElementById('pressureIn').textContent = cur.pressure_in;

      // Atmospheric Conditions
      document.getElementById('humidity').textContent = cur.humidity;
      document.getElementById('cloud').textContent = cur.cloud;
      document.getElementById('visKm').textContent = cur.vis_km;
      document.getElementById('visMiles').textContent = cur.vis_miles;
      document.getElementById('uv').textContent = cur.uv;

      // Precipitation
      document.getElementById('precipMm').textContent = cur.precip_mm;
      document.getElementById('precipIn').textContent = cur.precip_in;

      // Solar Radiation
      document.getElementById('shortRad').textContent = cur.short_rad || 0;
      document.getElementById('diffRad').textContent = cur.diff_rad || 0;
      document.getElementById('dni').textContent = cur.dni || 0;
      document.getElementById('gti').textContent = cur.gti || 0;
    }

    function showError(message) {
      const errorDiv = document.getElementById('error');
      errorDiv.textContent = '⚠️ ' + message;
      errorDiv.classList.remove('d-none');
      
      setTimeout(() => {
        errorDiv.classList.add('d-none');
      }, 5000);
    }

    window.addEventListener('DOMContentLoaded', () => {
      const cityFromURL = getCityFromURL();
      
      if (cityFromURL) {
        document.getElementById('cityInput').value = cityFromURL;
        getWeather(cityFromURL);
      } else {
        document.getElementById('cityInput').focus();
      }
    });



