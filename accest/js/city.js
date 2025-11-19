function getCityFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("name");
}

async function getWeather(cityName = null) {
  const city = cityName || document.getElementById("cityInput").value.trim();
  const resultDiv = document.getElementById("result");
  const loadingDiv = document.getElementById("loading");
  const errorDiv = document.getElementById("error");
  const fetchButton = document.getElementById("fetchButton");

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  resultDiv.classList.add("d-none");
  errorDiv.classList.add("d-none");
  loadingDiv.classList.remove("d-none");
  fetchButton.disabled = true;

  const apiKey = "0f571d5048b8417796393130251211";
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("City not found. Please check the spelling and try again.");
    }

    const data = await response.json();
    
    // Update background video FIRST
    updateBackgroundVideo(data.current);
    
    // Then display weather data
    displayWeatherData(data);

    loadingDiv.classList.add("d-none");
    resultDiv.classList.remove("d-none");
  } catch (error) {
    loadingDiv.classList.add("d-none");
    showError(error.message);
  } finally {
    fetchButton.disabled = false;
  }
}

function updateBackgroundVideo(current) {
  const weather = current.condition.text.toLowerCase();
  const isDay = current.is_day;

  let videoUrl;

   if (weather.includes("Partly Cloudy")) {
    videoUrl = isDay === 1 ? "accest/videos/rain.mp4":"accest/videos/sky_night.mp4";
  }
  // Rain conditions
  else if (weather.includes("rain") || weather.includes("drizzle") || weather.includes("shower")) {
    videoUrl = isDay === 1 ? "accest/videos/rain.mp4":"accest/videos/rain_night.mp4";
  } 
  // Clear/Sunny conditions
  else if (weather.includes("clear") || weather.includes("sunny")) {
    videoUrl = isDay === 1 ? "accest/videos/sky.mp4" : "accest/videos/sky_night.mp4";
  } 
  // Cloudy/Overcast/Partly cloudy conditions (FIXED - check for "partly" in lowercase)
  else if (weather.includes("cloud") || weather.includes("Overcast") || weather.includes("partly")) {
    videoUrl = "accest/videos/could.mp4";
  }
  // Snow conditions
  else if (weather.includes("snow") || weather.includes("blizzard") || weather.includes("sleet")) {
    videoUrl = "accest/videos/default.mp4";
  }
  // Fog/Mist conditions
  else if (weather.includes("fog") || weather.includes("mist") || weather.includes("haze")) {
     videoUrl = isDay === 1 ? "accest/videos/fog.mp4" : "accest/videos/folg_night.mp4";
  }
  // Thunder/Storm conditions
  else if (weather.includes("thunder") || weather.includes("storm")) {
    videoUrl = "accest/videos/rain.mp4";
  }
  // Default fallback
  else {
    videoUrl = "accest/videos/default.mp4";
  }

  // Get video element
  const videoElement = document.getElementById("backgroundVideo");
  
  // Debug logging
  console.log("=== VIDEO UPDATE DEBUG ===");
  console.log("Weather condition (original):", current.condition.text);
  console.log("Weather condition (lowercase):", weather);
  console.log("Is Day:", isDay);
  console.log("Selected video:", videoUrl);
  console.log("========================");
  
  // Pause current video
  videoElement.pause();
  
  // Remove existing source tags
  const sources = videoElement.querySelectorAll("source");
  sources.forEach(source => source.remove());
  
  // Set video src directly (this is the key!)
  videoElement.src = videoUrl;
  videoElement.type = "video/mp4";
  
  // Load and play
  videoElement.load();
  videoElement.play().catch(err => {
    console.error("Video playback error:", err);
  });
  
  console.log(`✅ Video changed to: ${videoUrl}`);
}

function displayWeatherData(data) {
  const loc = data.location;
  const cur = data.current;

  // Location Information
  document.getElementById("cityName").textContent = loc.name;
  document.getElementById("region").textContent = loc.region || "N/A";
  document.getElementById("country").textContent = loc.country;
  document.getElementById("timezone").textContent = loc.tz_id;
  document.getElementById("localtime").textContent = loc.localtime;
  document.getElementById("coordinates").textContent = `Lat: ${loc.lat}°, Lon: ${loc.lon}°`;

  // Main Weather Display
  document.getElementById("icon").src = `https:${cur.condition.icon}`;
  document.getElementById("temperature").innerHTML = `${Math.round(cur.temp_c)}<span class="temp-unit">°C</span>`;
  document.getElementById("condition").textContent = cur.condition.text;
  document.getElementById("lastUpdated").textContent = `Last updated: ${cur.last_updated}`;

  // Day/Night Badge
  const dayNightBadge = document.getElementById("dayNightBadge");
  if (cur.is_day === 1) {
    dayNightBadge.textContent = "☀️ Day";
    dayNightBadge.className = "day-night-badge";
  } else {
    dayNightBadge.textContent = "🌙 Night";
    dayNightBadge.className = "day-night-badge night";
  }

  // Temperature Details
  document.getElementById("tempC").textContent = cur.temp_c;
  document.getElementById("tempF").textContent = cur.temp_f;
  document.getElementById("feelslikeC").textContent = cur.feelslike_c;
  document.getElementById("feelslikeF").textContent = cur.feelslike_f;
  document.getElementById("windchillC").textContent = cur.windchill_c;
  document.getElementById("windchillF").textContent = cur.windchill_f;
  document.getElementById("heatindexC").textContent = cur.heatindex_c;
  document.getElementById("heatindexF").textContent = cur.heatindex_f;
  document.getElementById("dewpointC").textContent = cur.dewpoint_c;
  document.getElementById("dewpointF").textContent = cur.dewpoint_f;

  // Wind & Pressure
  document.getElementById("windKph").textContent = cur.wind_kph;
  document.getElementById("windMph").textContent = cur.wind_mph;
  document.getElementById("windDir").textContent = cur.wind_dir;
  document.getElementById("windDegree").textContent = cur.wind_degree;
  document.getElementById("gustKph").textContent = cur.gust_kph;
  document.getElementById("gustMph").textContent = cur.gust_mph;
  document.getElementById("pressureMb").textContent = cur.pressure_mb;
  document.getElementById("pressureIn").textContent = cur.pressure_in;

  // Atmospheric Conditions
  document.getElementById("humidity").textContent = cur.humidity;
  document.getElementById("cloud").textContent = cur.cloud;
  document.getElementById("visKm").textContent = cur.vis_km;
  document.getElementById("visMiles").textContent = cur.vis_miles;
  document.getElementById("uv").textContent = cur.uv;

  // Precipitation
  document.getElementById("precipMm").textContent = cur.precip_mm;
  document.getElementById("precipIn").textContent = cur.precip_in;

  // Solar Radiation
  document.getElementById("shortRad").textContent = cur.short_rad || 0;
  document.getElementById("diffRad").textContent = cur.diff_rad || 0;
  document.getElementById("dni").textContent = cur.dni || 0;
  document.getElementById("gti").textContent = cur.gti || 0;
}

function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = "⚠️ " + message;
  errorDiv.classList.remove("d-none");

  setTimeout(() => {
    errorDiv.classList.add("d-none");
  }, 5000);
}

window.addEventListener("DOMContentLoaded", () => {
  const cityFromURL = getCityFromURL();

  if (cityFromURL) {
    document.getElementById("cityInput").value = cityFromURL;
    getWeather(cityFromURL);
  } else {
    document.getElementById("cityInput").focus();
  }
});