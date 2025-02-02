import React, { ChangeEvent } from 'react';
import { InlineField, Input} from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData} = options;

 
  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const apiKey = event.target.value;
  
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData, // Preserve other secure data
        apiKey,
      },
    });
  };

 
  return (
    <div className="gf-form-group">
        <InlineField
        label="API Key"
        labelWidth={14}
        interactive
        required
        tooltip="Your API key (stored securely)"
      >
        <Input
          id="config-editor-api-key"
          type='password'
          value={jsonData?.apiKey || ''}
          placeholder="Enter your API key"
          width={40}
          onChange={onAPIKeyChange}
        />
      </InlineField>
    </div>
  );
}