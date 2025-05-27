import React, { useEffect, useState, useCallback } from "react";
import {
  fetchCurrentWeather,
  fetchHistoricalWeather,
  WeatherChart,
} from "./WeatherService";

function App() {
  const [city, setCity] = useState("Chennai");
  const [currentTemp, setCurrentTemp] = useState(null);
  const [historicalWeather, setHistoricalWeather] = useState([]);
  const [error, setError] = useState(null);

  const loadWeather = useCallback(async () => {
    try {
      setError(null);
      setCurrentTemp(null);
      setHistoricalWeather([]);
      const current = await fetchCurrentWeather(city);
      setCurrentTemp(current);

      const historical = await fetchHistoricalWeather(city);
      setHistoricalWeather(historical);
    } catch (error) {
      setError(error.message);
    }
  }, [city]); // ✅ Add `city` as a dependency

  useEffect(() => {
    if (city) loadWeather();
  }, [city, loadWeather]); // ✅ Include `loadWeather` to avoid warning

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents form reload
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Weather Dashboard</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Enter city name"
          style={{
            padding: "8px",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Get Weather
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {currentTemp !== null ? (
        <p>Current Temperature in {city}: {currentTemp.toFixed(2)}°C</p>
      ) : (
        <p>Loading current temperature...</p>
      )}

      <h2>Historical Weather (Last 5 Days)</h2>
      {historicalWeather.length > 0 ? (
        <WeatherChart data={historicalWeather} />
      ) : (
        <p>Loading historical data...</p>
      )}
    </div>
  );
}

export default App;
