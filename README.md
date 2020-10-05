## Salesforce LWC Select Option

This component provides you autocomplete (search ) functionality with single and multi-select options based on `JSON`.

Arrow key selection functionality is included.



### Parameters

| Names | Default | Required | Description |
| :--- | :--- | :---: | :--- |
| `label` |  |  :heavy_check_mark: | Being used for input label. |
| `placeholder` | `Search...` | :x: | Being used for input place holder. |
| `variant` | `standard` | :x: | Accepted variants include `standard` `label-inline` `label-hidden` `label-stacked`. |
| `options` |  | :heavy_check_mark:  | array of object: `[{ label: 'USA', value: '1', selected: false },{ label: 'India', value: '91', selected: false },{ label: 'Argentina', value: '3', selected: false }]` |
| `multiple` | false | :x: | Multiple options to choose from a dropdown.  |
| `is-select-all`| false | :x:  | To select all options simultaneously. when you use this `multiple` is `required`. |
| `component-id` | `null` | :x: | |
| `no-record-message` | No records found according to the search term. | :x: |  |
| `disabled` | `false` | :x:  | make the input disabled |
| `required` | `false` | :x: | make the input required |
| `read-only` | `false` | :x: | make the input read only |

### Events

| Names | Values  | Description |
| :--- | :--- | :--- |
| `onselect` | `event.detail` | Get the selected values ​​as `object`. i.g `{ componentId: null, value: [{}], options: [{}] }`|


>How we will get the value according to the type we have implemented (Like: single or multiple)
 `event.detail.value`
>- The `single` select option then the value will be found as an `object` i.g `{ label: 'USA', value: '1', selected: true }`
>- The `multi` select option then the value will be found as an `array` i.g `[{ label: 'USA', value: '1', selected: true }]`
>- No option selected : `null`

### Options required parameters

| Key Name | Type | Description |
| :--- | :---: | :--- |
| `label` | String | To show the dropdown list |
| `value` | String | To manage user selection |
| `selected` | Boolean | To manage user selection |


#### Usage

`Html:`

```html
<c-select 
  label="Country"
  placeholder="Choose an country"
  options={values}
  onselect={handleSelected}
  ></c-select>
```
`JavaScript:`

```js
@track values = [
  { label: 'USA', value: '1', selected: false },
  { label: 'India', value: '91', selected: false },
  { label: 'Argentina', value: '3', selected: false }
];

handleSelected(event) { 
    console.log('OUTPUT : ', event.detail);
  /* Output : { componentId: null, 
                 value: { label: 'USA', value: '1', selected: true }, 
                 options: [{ label: 'USA', value: '1', selected: true },
                            { label: 'India', value: '91', selected: false },
                            { label: 'Argentina', value: '3', selected: false }] 
              }*/

    console.log('Value : ', event.detail.value);
    
  
}
```

**Multiple select options**

```html
<c-select 
  label="Country"
  placeholder="Choose an country"
  options={values}
  onselect={handleSelected}
  multiple
  ></c-select>
```

**Default value**

>When you any selected  marked as a `TRUE`, they will automatically show the `default` value.
>- if Single (defaulter)
>  *example:*  `{ label: 'USA', value: '1', selected: true }`
>- if multiple 
>  *example:*  `{ label: 'USA', value: '1', selected: true },
  { label: 'India', value: '91', selected: true },
  { label: 'Argentina', value: '3', selected: false }`

`Html:`

```html
<c-select 
  label="Country"
  placeholder="Choose an country"
  options={values}
  onselect={handleSelected}
  ></c-select>
```

`JavaScript:`

```js
@track values = [
  { label: 'USA', value: '1', selected: true },
  { label: 'India', value: '91', selected: false },
  { label: 'Argentina', value: '3', selected: false }
];

handleSelected(event) { 
    console.log('Value : ', event.detail.value);
}
```

**With all Parameters**

`Html:`

```html
<c-select 
  label="Country"
  placeholder="Choose an country"
  options={values}
  onselect={handleSelected}
  component-id="Select001"
  variant="label-hidden"
  multiple
  is-select-all
  ></c-select>
```


```html
<c-select 
  label="Country"
  placeholder="Choose an country"
  options={values}
  onselect={handleSelected}
  read-only
  disabled
  required
  ></c-select>
```

 *Thank you.*






