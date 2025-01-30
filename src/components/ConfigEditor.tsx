import React, { ChangeEvent } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData, secureJsonFields, secureJsonData } = options;

  // Validates URL format
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        url,
      },
    });
  };

  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const apiKey = event.target.value;
    
    onOptionsChange({
      ...options,
      secureJsonData: {
        ...secureJsonData, // Preserve other secure data
        apiKey,
      },
    });
  };

  const onResetAPIKey = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...secureJsonData, // Preserve other secure data
        apiKey: '',
      },
    });
  };

  const getUrlValidationState = () => {
    if (!jsonData.url) {
      return undefined;
    }
    return isValidUrl(jsonData.url) ? undefined : 'error';
  };

  return (
    <div className="gf-form-group">
      <InlineField
        label="URL"
        labelWidth={14}
        interactive
        tooltip="The base URL for the weather API"
        invalid={getUrlValidationState() === 'error'}
        error={getUrlValidationState() === 'error' ? 'Please enter a valid URL' : undefined}
      >
        <Input
          id="config-editor-url"
          onChange={onUrlChange}
          value={jsonData.url || ''}
          placeholder="https://api.example.com"
          width={40}
        />
      </InlineField>

      <InlineField
        label="API Key"
        labelWidth={14}
        interactive
        required
        tooltip="Your API key (stored securely)"
      >
        <SecretInput
          id="config-editor-api-key"
          isConfigured={Boolean(secureJsonFields?.apiKey)}
          value={secureJsonData?.apiKey || ''}
          placeholder="Enter your API key"
          width={40}
          onReset={onResetAPIKey}
          onChange={onAPIKeyChange}
        />
      </InlineField>
    </div>
  );
}