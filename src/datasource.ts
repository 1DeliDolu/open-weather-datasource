import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  createDataFrame,
  FieldType,
  DataFrame
} from '@grafana/data';
import { getBackendSrv, FetchError } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

import { MyQuery, MyDataSourceOptions, WeatherData } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    // ✅ Ensure API key and base URL are set correctly
    this.baseUrl = instanceSettings.jsonData.url || "";
   
  }
    

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async (target) => {
      const location = encodeURIComponent(target.cityName || "Berlin,DE");

      if (!location) {
        console.warn("No location specified in query.");
        return null;
      }

      try {
        const response = await this.request(`q=${location}`);
        if (!response.data || !response.data.list) {
          console.warn(`No weather data found for ${location}`);
          return null;
        }

        const weatherData = response.data.list;
        const times: number[] = [];
        const values: number[] = [];

        weatherData.forEach((data: WeatherData) => {
          times.push(data.dt * 1000);
          values.push(data.main.temp);
        });

        return createDataFrame({
          refId: target.refId,
          name: `${location} - Weather`,
          fields: [
            { name: 'Time', values: times, type: FieldType.time },
            { name: 'Temperature', values: values, type: FieldType.number, config: { unit: '°C' } }
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

  async request(params?: string) {
    try {
      const url = `${this.baseUrl}/forecast?${params}&units=metric`;
      const response = await lastValueFrom(
        getBackendSrv().fetch<{ list: WeatherData[] }>({
          url,
          method: 'GET'
        })

      );

      return response;
    } catch (error) {
      console.error('Request error:', error);
      const fetchError = error as FetchError;
      throw this.handleError(fetchError);
    }
  }

  private handleError(error: FetchError) {
    return {
      status: error.status,
      statusText: error.statusText || 'Network Error',
      data: error.data
    };
  }

  async testDatasource() {
    try {
      const response = await this.request('q=Berlin,DE');
      return { status: 'success', message: response.statusText || 'Success' };
    } catch (err) {
      return { status: 'error', message: 'Failed to connect to API' };
    }
  }
}
