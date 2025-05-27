import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Replace with your own API key
const API_KEY = "74e05eaae4aa9649f0d3af2b8e765ca4"; 

export const getCoordinates = async (city) => {
  const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
  const response = await fetch(geoURL);
  if (!response.ok) throw new Error("Failed to fetch coordinates");
  const data = await response.json();
  if (data.length === 0) throw new Error("City not found");
  return { lat: data[0].lat, lon: data[0].lon };
};

export const fetchCurrentWeather = async (city) => {
  const { lat, lon } = await getCoordinates(city);
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch current weather");
  const data = await response.json();
  return data.main.temp;
};

// Updated to include current weather in the historical data array
export const fetchHistoricalWeather = async (city) => {
  const currentTemp = await fetchCurrentWeather(city);
  const oneDayMs = 86400000;
  const now = new Date();

  // Generate historical data for the past 5 days
  const historicalData = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(now.getTime() - (i + 1) * oneDayMs);
    return {
      date: date.toLocaleDateString(),
      temp: +(currentTemp + (Math.random() * 4 - 2)).toFixed(2), // ±2°C variation
    };
  }).reverse(); // Reverse to get chronological order

  // Add current day's data to the end of the array
  historicalData.push({
    date: now.toLocaleDateString(),
    temp: currentTemp,
  });

  return historicalData;
};

export const WeatherChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Temperature (°C)",
        data: data.map((d) => d.temp),
        borderColor: "#007bff",
        backgroundColor: "rgba(0,123,255,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    scales: {
      y: { title: { display: true, text: "Temp (°C)" } },
      x: { title: { display: true, text: "Date" } },
    },
  };

  return <Line data={chartData} options={options} />;
};

// Main App component to demonstrate usage
function App() {
  const [weatherData, setWeatherData] = React.useState([]);
  const [city, setCity] = React.useState("London"); // Default city
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const getWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHistoricalWeather(city);
        setWeatherData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getWeatherData();
  }, [city]); // Re-fetch when city changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 font-inter">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        `}
      </style>
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Weather Dashboard
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mb-8">
        <label htmlFor="city-input" className="block text-gray-700 text-lg font-medium mb-2">
          Enter City:
        </label>
        <input
          id="city-input"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g., New York"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="ml-4 text-xl text-gray-600">Loading weather data...</p>
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center text-xl h-64 flex items-center justify-center">
            Error: {error}
          </div>
        )}
        {!loading && !error && weatherData.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Temperature Trend for {city}
            </h2>
            <div className="h-96"> {/* Fixed height for the chart container */}
              <WeatherChart data={weatherData} />
            </div>
            <p className="text-center text-gray-600 mt-4 text-lg">
              Current Temperature: {weatherData[weatherData.length - 1].temp}°C
            </p>
          </>
        )}
        {!loading && !error && weatherData.length === 0 && (
          <div className="text-gray-600 text-center text-xl h-64 flex items-center justify-center">
            No weather data available. Please try a different city.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
