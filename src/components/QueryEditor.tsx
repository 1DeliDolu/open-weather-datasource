import React from 'react';
import { InlineField, Stack, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery, DEFAULT_QUERY } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const unitsOptions: Array<SelectableValue<string>> = [
  { label: 'Standard', value: 'standard' },
  { label: 'Metric', value: 'metric' },
  { label: 'Imperial', value: 'imperial' },
];

const mainParameterOptions: Array<SelectableValue<string>> = [
  { label: 'Main Weather Data', value: 'main' },
  { label: 'Wind', value: 'wind' },
  { label: 'Clouds', value: 'clouds' },
  { label: 'Rain', value: 'rain' },
];

const subParameterOptions: { [key: string]: Array<SelectableValue<string>> } = {
  main: [
    { label: 'Temperature', value: 'temp' },
    { label: 'Feels Like', value: 'feels_like' },
    { label: 'Min Temperature', value: 'temp_min' },
    { label: 'Max Temperature', value: 'temp_max' },
    { label: 'Pressure', value: 'pressure' },
    { label: 'Sea Level', value: 'sea_level' },
    { label: 'Ground Level', value: 'grnd_level' },
    { label: 'Humidity', value: 'humidity' },
  ],
  wind: [
    { label: 'Speed', value: 'speed' },
    { label: 'Direction', value: 'deg' },
    { label: 'Gust', value: 'gust' },
  ],
  clouds: [
    { label: 'Cloudiness', value: 'all' },
  ],
  rain: [
    { label: '3h Rain Volume', value: '3h' },
  ],
};

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onCityNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cityName = e.target.value;

    onChange({
      ...query,
      cityName: cityName,
      location: cityName,
      queryText: cityName
    });

    setTimeout(() => {
      onRunQuery();
    }, 500);
  };

  const onMainParameterChange = (value: SelectableValue<string>) => {
    const newSubParameter = value.value ? subParameterOptions[value.value][0].value : DEFAULT_QUERY.subParameter;
    onChange({
      ...query,
      mainParameter: value.value,
      subParameter: newSubParameter,
      metric: newSubParameter 
    });
    onRunQuery();
  };

  const onSubParameterChange = (value: Array<SelectableValue<string>> | SelectableValue<string>) => {
    const selectedValues = Array.isArray(value)
      ? value.map(v => v.value).filter((v): v is string => v !== undefined)
      : [value.value].filter((v): v is string => v !== undefined);

    onChange({
      ...query,
      subParameter: selectedValues,
      metric: selectedValues 
    });
    onRunQuery();
  };

  const onUnitsChange = (value: SelectableValue<string>) => {
    onChange({ ...query, units: value.value as 'standard' | 'metric' | 'imperial' });
    onRunQuery();
  };

  return (
    <Stack direction="column" gap={2}>
      <div>
        <InlineField label="City Name" labelWidth={20} tooltip="Enter city name (e.g., London,uk)">
          <input
            type="text"
            value={query.cityName || query.location || ''}
            onChange={onCityNameChange}
            placeholder="Enter city name (e.g., London,uk)"
            className="gf-form-input width-20"
          />
        </InlineField>
      </div>

      <div>
        <InlineField label="Main Parameter" labelWidth={20} tooltip="Select main weather parameter">
          <Select
            options={mainParameterOptions}
            value={query.mainParameter || 'main'}
            onChange={onMainParameterChange}
            width={40}
          />
        </InlineField>
      </div>

      <div>
        <InlineField label="Parameters" labelWidth={20} tooltip="Select weather parameters">
          <Select
            options={subParameterOptions[query.mainParameter || 'main']}
            value={Array.isArray(query.subParameter)
              ? query.subParameter.map(param => ({
                label: subParameterOptions[query.mainParameter || 'main']
                  .find(opt => opt.value === param)?.label || param,
                value: param
              }))
              : query.subParameter
                ? [{
                  label: subParameterOptions[query.mainParameter || 'main']
                    .find(opt => opt.value === query.subParameter)?.label || query.subParameter,
                  value: query.subParameter
                }]
                : []}
            onChange={onSubParameterChange}
            isMulti={true}
            width={40}
          />
        </InlineField>
      </div>

      <div>
        <InlineField label="Units" labelWidth={20} tooltip="Select measurement units">
          <Select
            options={unitsOptions}
            value={query.units || 'metric'}
            onChange={onUnitsChange}
            width={40}
          />
        </InlineField>
      </div>
    </Stack>
  );
}