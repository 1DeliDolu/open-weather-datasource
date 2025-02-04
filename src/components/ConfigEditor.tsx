import React, { ChangeEvent } from 'react';
import { InlineField, Input, Button } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { secureJsonData, secureJsonFields, jsonData } = options;

  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKey: event.target.value,
      },
    });
  };
  console.log('API Key:', secureJsonData?.apiKey);

  const onResetAPIKey = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: '',
      },
    });
  };

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        url: event.target.value,
      },
    });
  };

  return (
    <>
      <InlineField label="API Key" labelWidth={14}>
        <div style={{ display: 'flex' }}>
          <Input
            type="password"
            placeholder={secureJsonFields?.apiKey ? 'Configured' : 'Enter API Key'}
            value={secureJsonData?.apiKey || ''}
            onChange={onAPIKeyChange}
            width={70}
          />
          {secureJsonFields?.apiKey && (
            <Button variant="secondary" type="button" onClick={onResetAPIKey}>
              Reset
            </Button>
          )}
        </div>
      </InlineField>

      <InlineField label="API URL" labelWidth={14}>
        <Input
          type="text"
          placeholder="Enter API Base URL"
          value={jsonData?.url || ''}
          onChange={onUrlChange}
          width={70}
        />
      </InlineField>
    </>
  );
}
