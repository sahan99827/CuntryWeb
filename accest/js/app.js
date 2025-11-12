document
  .getElementById("fetchButton")
  .addEventListener("click", getCountryData);
document
  .getElementById("countryInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") getCountryData();
  });

const modal = document.getElementById("mapModal");
const closeBtn = document.querySelector(".close");
closeBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

function getCountryData() {
  const input = document.getElementById("countryInput").value.trim();
  const output = document.getElementById("countryInfo");

  if (!input) {
    Swal.fire({
      icon: "warning",
      title: "Empty Input",
      text: "Please enter a country name first.",
      confirmButtonColor: "#667eea",
    });
    return;
  }

  output.innerHTML = '<div class="loading">🔍 Searching...</div>';

  fetch(`https://restcountries.com/v3.1/name/${input}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 404) {
        output.innerHTML =
          '<div class="col-12"><div class="no-results"><h3> No Country Found</h3><p>Please try another search term.</p></div></div>';
        return;
      }

      output.innerHTML = "";
      data.forEach((country) => {
        const card = createCountryCard(country);
        output.appendChild(card);
      });
    })
    .catch((err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch country data. Please try again.",
        confirmButtonColor: "#667eea",
      });
      output.innerHTML = "";
    });
}

function showMap(lat, lng, countryName) {
  document.getElementById("mapTitle").textContent = `${countryName} - Map View`;
  document.getElementById(
    "mapFrame"
  ).src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 5},${
    lat - 5
  },${lng + 5},${lat + 5}&layer=mapnik&marker=${lat},${lng}`;
  modal.style.display = "block";
}

function createCountryCard(country) {
  const col = document.createElement("div");
  col.className = "col-lg-6";

  const cardId = `card-${country.cca3}`;
  const lat = country.latlng?.[0] || 0;
  const lng = country.latlng?.[1] || 0;

  col.innerHTML = `
                <div class="country-card">
                    <div class="flag-container">
                        <img src="${country.flags.svg}" alt="Flag of ${country.name.common}">
                        <div class="flag-overlay">
                            <h2 class="country-name">${country.name.common}</h2>
                            <button class="map-button" onclick="showMap(${lat}, ${lng}, '${country.name.common}')">🗺️ View Map</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-search">
                            <input type="text" placeholder="Search within this card..." onkeyup="filterCard('${cardId}', this.value)">
                        </div>
                        <div id="${cardId}"></div>
                    </div>
                </div>
            `;

  const cardContent = col.querySelector(`#${cardId}`);

  // Images Section
  const imagesHtml = createImagesSection(country);
  cardContent.innerHTML += imagesHtml;

  // Categorized Data
  const categories = categorizeData(country);
  for (const [categoryName, categoryData] of Object.entries(categories)) {
    const categoryHtml = createCategorySection(categoryName, categoryData);
    cardContent.innerHTML += categoryHtml;
  }

  // Add Cities Section
  loadCities(country.name.common, cardContent);

  return col;
}

function loadCities(countryName, container) {
  const citiesDiv = document.createElement("div");
  citiesDiv.className = "cities-section";
  citiesDiv.innerHTML =
    '<h3>Major Cities</h3><div class="loading" style="color: #667eea;">Loading cities...</div>';
  container.appendChild(citiesDiv);

  fetch("https://countriesnow.space/api/v0.1/countries/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country: countryName }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error || !data.data || data.data.length === 0) {
        citiesDiv.innerHTML =
          '<h3>Major Cities</h3><p style="color: #666;">No city data available</p>';
        return;
      }

      const citiesGrid = document.createElement("div");
      citiesGrid.className = "cities-grid";

      data.data.forEach((city) => {
        const cityItem = document.createElement("div");
        cityItem.className = "city-item";

        // ✅ Create a clickable link
        const link = document.createElement("a");
        link.href = `city.html?name=${encodeURIComponent(city)}`;
        link.textContent = city;
        link.style.textDecoration = "none";
        link.style.color = "#333";

        cityItem.appendChild(link);
        citiesGrid.appendChild(cityItem);
      });

      citiesDiv.innerHTML = "<h3>Major Cities</h3>";
      citiesDiv.appendChild(citiesGrid);
    })
    .catch((err) => {
      citiesDiv.innerHTML =
        '<h3>Major Cities</h3><p style="color: #666;">Could not load cities</p>';
    });
}

function createImagesSection(country) {
  let html =
    '<div class="images-section"><h3> Country Images</h3><div class="image-grid">';

  if (country.flags) {
    if (country.flags.svg) {
      html += `<div class="image-item">
                        <img src="${country.flags.svg}" alt="Flag SVG" onclick="window.open('${country.flags.svg}', '_blank')">
                        <div class="image-label">Flag (SVG)</div>
                    </div>`;
    }
    if (country.flags.png) {
      html += `<div class="image-item">
                        <img src="${country.flags.png}" alt="Flag PNG" onclick="window.open('${country.flags.png}', '_blank')">
                        <div class="image-label">Flag (PNG)</div>
                    </div>`;
    }
  }

  if (country.coatOfArms) {
    if (country.coatOfArms.svg) {
      html += `<div class="image-item">
                        <img src="${country.coatOfArms.svg}" alt="Coat of Arms SVG" onclick="window.open('${country.coatOfArms.svg}', '_blank')">
                        <div class="image-label">Coat of Arms (SVG)</div>
                    </div>`;
    }
    if (country.coatOfArms.png) {
      html += `<div class="image-item">
                        <img src="${country.coatOfArms.png}" alt="Coat of Arms PNG" onclick="window.open('${country.coatOfArms.png}', '_blank')">
                        <div class="image-label">Coat of Arms (PNG)</div>
                    </div>`;
    }
  }

  html += "</div></div>";
  return html;
}

function categorizeData(country) {
  return {
    "📋 Basic Information": {
      "Common Name": country.name?.common,
      "Official Name": country.name?.official,
      "Native Names": country.name?.nativeName
        ? Object.values(country.name.nativeName)
            .map((n) => n.common)
            .join(", ")
        : "N/A",
      "CCA2 Code": country.cca2,
      "CCA3 Code": country.cca3,
      "CCN3 Code": country.ccn3,
      "CIOC Code": country.cioc,
      Independent: country.independent ? "Yes" : "No",
      "UN Member": country.unMember ? "Yes" : "No",
      Status: country.status,
    },
    "🌍 Geographic Information": {
      Region: country.region,
      Subregion: country.subregion,
      Latitude: country.latlng?.[0],
      Longitude: country.latlng?.[1],
      Landlocked: country.landlocked ? "Yes" : "No",
      Area: country.area ? `${country.area.toLocaleString()} km²` : "N/A",
      Borders: country.borders ? country.borders.join(", ") : "None",
      Continents: country.continents?.join(", "),
    },
    "👥 Population & Demographics": {
      Population: country.population?.toLocaleString(),
      Demonyms: formatDemonyms(country.demonyms),
      "Gini Index": formatGini(country.gini),
    },
    "🏛️ Government & Politics": {
      Capital: country.capital?.join(", "),
      "Capital Coordinates": country.capitalInfo?.latlng?.join(", "),
      "Alt Spellings": country.altSpellings?.slice(0, 5).join(", "),
    },
    "🗣️ Languages & Currency": {
      Languages: country.languages
        ? Object.values(country.languages).join(", ")
        : "N/A",
      Currencies: formatCurrencies(country.currencies),
    },
    "📞 Contact & Communication": {
      Timezones: country.timezones?.join(", "),
      "Calling Code":
        country.idd?.root + (country.idd?.suffixes?.join(", ") || ""),
      "Top Level Domain": country.tld?.join(", "),
      "Postal Code Format": country.postalCode?.format,
    },
    "🚗 Symbols & Identity": {
      "Start of Week": country.startOfWeek,
      "Car Signs": country.car?.signs?.join(", "),
      "Driving Side": country.car?.side,
      "Flag Emoji": country.flag,
      "FIFA Code": country.fifa,
    },
  };
}

function formatCurrencies(currencies) {
  if (!currencies) return "N/A";
  return Object.entries(currencies)
    .map(([code, curr]) => `${curr.name} (${curr.symbol}) - ${code}`)
    .join(", ");
}

function formatDemonyms(demonyms) {
  if (!demonyms) return "N/A";
  const eng = demonyms.eng;
  return eng ? `${eng.m} (male), ${eng.f} (female)` : "N/A";
}

function formatGini(gini) {
  if (!gini) return "N/A";
  return Object.entries(gini)
    .map(([year, value]) => `${year}: ${value}`)
    .join(", ");
}

function createCategorySection(title, data) {
  let html = `<div class="category-section">
                <div class="category-title" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'grid' : 'none'">
                    ${title} <span>▼</span>
                </div>
                <div class="category-content">`;

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== "N/A") {
      html += `<div class="info-item">
                        <div class="info-label">${key}</div>
                        <div class="info-value">${value}</div>
                    </div>`;
    }
  }

  html += "</div></div>";
  return html;
}

function filterCard(cardId, searchTerm) {
  const card = document.getElementById(cardId);
  const items = card.querySelectorAll(
    ".info-item, .category-section, .cities-section"
  );
  const term = searchTerm.toLowerCase();

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    if (text.includes(term)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}
