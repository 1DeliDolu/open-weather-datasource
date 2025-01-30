import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  location?: string;
  cityName?: string;
  metric?: string | string[];
  mainParameter?: string;
  subParameter?: string | string[];
  units?: WeatherUnits;
  main?: string;
  weather?: string;
  wind?: string;
  queryText?: string;
  constant?: number;
  values?: number[];
  times?: number[];
}

export type WeatherUnits = 'standard' | 'metric' | 'imperial';

export const DEFAULT_QUERY: Partial<MyQuery> = {
  location: 'London,uk',
  metric: 'temp',
  mainParameter: 'main',
  subParameter: ['temp'],
  units: 'metric'
};

export interface DataPoint {
  Time: number;
  Value: number;
}

export interface DataSourceResponse {
  datapoints: DataPoint[];
  list: WeatherData[];
}

export interface WeatherData {
  dt: number;
  main: MainWeatherData;
  wind: WindData;
  clouds: {
    all: number;
  };
  visibility: number;
  weather: WeatherCondition[];
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  temp_min: number;
  temp_max: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherParams {
  units: string;
}

export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
  apiKey?: string;
  units?: WeatherUnits;
  url?: string;
  content?: string;
  urlParams?: UrlParam[];
  proxyUrl?: string;
  proxyUser?: string;
}

export interface UrlParam {
  name: string;
  content: string;
}

export interface MySecureJsonData {
  apiKey?: string;
}