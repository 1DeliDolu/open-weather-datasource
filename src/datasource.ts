import {
  DataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  createDataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';
import _ from 'lodash';

import { MyQuery, MyDataSourceOptions, DEFAULT_QUERY, WeatherData, WeatherParams } from './types';



export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;
 

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.url!;
  }

  getDefaultQuery(): Partial<MyQuery> {
    return DEFAULT_QUERY;
  }

  filterQuery(query: MyQuery): boolean {
    return !!query.location;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async (target) => {
      const location = (target.cityName || target.location || DEFAULT_QUERY.location || '')
        .split(',')
        .map(part => part.trim().charAt(0).toUpperCase() + part.trim().slice(1).toLowerCase())
        .join(',');

      if (!location) {
        return null;
      }

      try {
        const response = await this.request(`q=${location}`);
        const weatherData = response.data as { list: WeatherData[] };

        if (!weatherData || !weatherData.list) {
          return null;
        }

        const selectedParameters = Array.isArray(target.subParameter)
          ? target.subParameter
          : [target.subParameter || 'temp'];

        const times: number[] = [];
        const valuesByParameter: { [key: string]: number[] } = {};

        selectedParameters.forEach(param => {
          valuesByParameter[param] = [];
        });

        weatherData.list.forEach((data: WeatherData) => {
          const timestamp = data.dt * 1000;
          times.push(timestamp);

          selectedParameters.forEach(param => {
            let value: number | undefined;

            if (target.mainParameter) {
              const mainData = data[target.mainParameter as keyof WeatherData] as Record<string, number>;
              if (mainData && typeof mainData === 'object') {
                value = mainData[param];
              }
            }
            valuesByParameter[param].push(value ?? NaN);
          });
        });

        return createDataFrame({
          refId: target.refId,
          name: `${location} - Weather Data`,
          fields: [
            { name: 'Time', values: times, type: FieldType.time },
            ...selectedParameters.map(param => ({
              name: param,
              values: valuesByParameter[param],
              type: FieldType.number,
              config: { unit: this.getMetricUnit(param) }
            }))
          ],
        });
      } catch (error) {
        console.error(`Error fetching data for ${location}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return { data: results.filter((result): result is DataFrame => result !== null) };
  }

  async getCurrentWeather(query: MyQuery) {
    try {
      const response = await this.request(`q=${query.location}`);
      return response.data;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to fetch current weather: ${err.message}`);
      } else {
        throw new Error('Failed to fetch current weather: Unknown error');
      }
    }
  }

  private getMetricUnit(metric: string): string {
    const unitMap: Record<string, string> = {
      temp: '°C',
      feels_like: '°C',
      temp_min: '°C',
      temp_max: '°C',
      humidity: '%',
      speed: 'm/s',
      wind_speed: 'm/s',
      pressure: 'hPa',
      sea_level: 'hPa',
      grnd_level: 'hPa',
      clouds: '%',
      all: '%',
    };
    return unitMap[metric.toLowerCase()] || '';
  }


  async request(params?: string) {
    const defaultParams: WeatherParams = {
      units: 'metric'
    };

    const paramPair = params ? [params.split('=')] : [];
    const queryParams = _.merge({}, defaultParams, _.fromPairs(paramPair));
    const urlParams = new URLSearchParams(queryParams).toString();
    const url = `${this.baseUrl}&${urlParams}`;

    try {
      const response = await lastValueFrom(getBackendSrv().fetch({
        url,
        method: 'POST',
      }));

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleResponse(response: { status: number; statusText: string; data: unknown }) {
    return {
      status: response.status,
      statusText: response.statusText || 'Success',
      data: response.data,
    };
  }

  private handleError(error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        statusText: error.message,
        data: null
      };
    }
    return {
      status: 'error',
      statusText: 'Unknown error',
      data: null
    };
  }

  async testDatasource() {
    const defaultErrorMessage = 'Cannot connect to API';

    try {
      const response = await this.request('q=London,uk');
      return {
        status: 'success',
        message: response.statusText || 'Success',
      };
    } catch (err) {
      const errorMessage = err instanceof Error
        ? `Error: ${err.message}`
        : defaultErrorMessage;

      return {
        status: 'error',
        message: errorMessage,
      };
    }
  }
}