import React from "react";
import axios from "axios";
import {getFlagEmoji} from './utils';
import "./App.css";

const COUNTRY_API = `https://api.countrylayer.com/v2/all?access_key=${process.env.REACT_APP_ACCESS_KEY_COUNTRY_LAYER}`;
const WEATHER_API = `https://api.weatherstack.com/current?access_key=${process.env.REACT_APP_ACCESS_KEY_WEATHER_STACK}&query=`;

function App() {
  const [countries, setCountries] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState({
    country: null,
    weather: null
  });

  const countriesToShow = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  React.useEffect(() => {
    axios.get(COUNTRY_API).then(response => setCountries(response.data));
  }, []);

  const handleSearchTermChange = event => {
    setSelectedCountry({ country: null, weather: null });
    let searchTerm = event.target.value;
    setSearchTerm(searchTerm);
  };

  const renderCountry = () => {
    const { country, weather } = selectedCountry;
    return (
      <div className="country-details">
        <div className="country-info">
          <h3>{country.name}</h3>
          <div>
            <strong>Capital:</strong> {country.capital}
          </div>
          <div>
            <strong>Population:</strong> {country.population}
          </div>
          <div><span>{getFlagEmoji(country.alpha2Code)}</span></div>
          {/* <img width="100" height="auto" src={country.flag} alt="flag" /> */}
        </div>
        {weather && (
          <div className="weather-info">
            <h4>Weather in {country.name}</h4>
            <div>
              <strong>Temperature:</strong>{" "}
              {`${weather && weather.temperature} Celsius`}
            </div>
            <img src={weather && weather.weather_icons[0]} alt="weather icon" />
            <div>
              <strong>Wind:</strong>{" "}
              {`${weather && weather.wind_speed}kph | direction: ${weather &&
                weather.wind_dir}`}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getWeatherForCountry = (country = selectedCountry) =>
    axios
      .get(`${WEATHER_API}${country.name}`)
      .then(response => response?.data?.current)
      .catch(err => console.error(err));

  const showCountryDetailsHandler = country => {
    if (country) {
      setIsLoading(true);
      getWeatherForCountry(country).then(weather => {
        console.log(country, weather);
        setSelectedCountry({
          country,
          weather
        });
        setIsLoading(false);
      });
    }
    return;
  };

  const renderLoader = () => (
    <div className="lds-ripple">
      <div></div>
      <div></div>
    </div>
  );

  const renderCountries = () => {
    const countriesLength = countriesToShow.length;
    if (searchTerm && countriesLength >= 10) {
      return <div>Too many matches, specify another filter</div>;
    }
    if (countriesLength === 1) {
      getWeatherForCountry(countriesToShow[0]).then(weather => {
        setSelectedCountry({ country: countriesToShow[0], weather });
        setIsLoading(false);
      });
      return renderLoader();
    }
    if (countriesLength > 1 && countriesLength <= 10) {
      return countriesToShow.map(country => (
        <div>
          <span>{country.name}</span>
          <span>
            <button onClick={() => showCountryDetailsHandler(country)}>
              Show
            </button>
          </span>
        </div>
      ));
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>Country details finder</h1>
      </header>
      <div role="main">
        <div>
          <span>Find countries: </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
        </div>
        {isLoading && renderLoader()}
        {!isLoading &&
          (selectedCountry.country ? renderCountry() : renderCountries())}
      </div>
    </div>
  );
}

export default App;
