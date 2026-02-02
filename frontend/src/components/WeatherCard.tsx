import { Link } from 'react-router-dom';
import type { WeatherRecord } from '../types/weather';
import { VerificationBadge } from './VerificationBadge';

interface WeatherCardProps {
  record: WeatherRecord;
}

/**
 * Get weather icon based on icon code
 */
function getWeatherIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'clear-day': '01d',
    'clear-night': '01n',
    'cloudy': '03d',
    'foggy': '50d',
    'partly-cloudy-day': '02d',
    'partly-cloudy-night': '02n',
    'possibly-rainy-day': '10d',
    'possibly-rainy-night': '10n',
    'possibly-sleet-day': '13d',
    'possibly-sleet-night': '13n',
    'possibly-snow-day': '13d',
    'possibly-snow-night': '13n',
    'possibly-thunderstorm-day': '11d',
    'possibly-thunderstorm-night': '11n',
    'rainy': '09d',
    'sleet': '13d',
    'snow': '13d',
    'thunderstorm': '11d',
    'windy': '50d',
  };

  const openWeatherIcon = iconMap[icon] || '01d';
  return `https://openweathermap.org/img/wn/${openWeatherIcon}@2x.png`;
}

/**
 * Format temperature from Celsius
 */
function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}

/**
 * Format timestamp
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

export function WeatherCard({ record }: WeatherCardProps) {
  const { data } = record;

  return (
    <Link
      to={`/weather/${record.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <img
            src={getWeatherIcon(data.icon)}
            alt={data.conditions}
            className="w-12 h-12"
          />
          <div className="ml-2">
            <p className="text-2xl font-bold text-gray-900">
              {formatTemp(data.air_temperature)}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {data.conditions}
            </p>
          </div>
        </div>
        <VerificationBadge status={record.status} compact />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Feels Like</p>
          <p className="font-medium">{formatTemp(data.feels_like)}</p>
        </div>
        <div>
          <p className="text-gray-500">Humidity</p>
          <p className="font-medium">{Math.round(data.relative_humidity)}%</p>
        </div>
        <div>
          <p className="text-gray-500">Wind</p>
          <p className="font-medium">{data.wind_avg.toFixed(1)} m/s {data.wind_direction_cardinal}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>Station {record.stationId}</span>
        <span>{formatTime(record.timestamp)}</span>
      </div>
    </Link>
  );
}
