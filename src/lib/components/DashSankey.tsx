import React, { FC } from 'react';
import PropTypes from 'prop-types';

export interface DashSankeyProps {
  id?: string;
  label?: string;
  setProps?(props: { value: string }): void;
  value?: string;
}
/**
 * ExampleComponent is an example component.
 * It takes a property, `label`, and
 * displays it.
 * It renders an input with the property `value`
 * which is editable by the user.
 */
const DashSankey: FC<DashSankeyProps> = ({ id, label, setProps, value }) => {
  return (
    <div id={id}>
      ExampleComponent: {label}&nbsp;
      <input value={value} onChange={(e) => setProps?.({ value: e.target.value })} />
    </div>
  );
};

DashSankey.defaultProps = {
  id: undefined,
  value: undefined,
  setProps: undefined,
  label: '',
};

DashSankey.propTypes = {
  /**
   * The ID used to identify this component in Dash callbacks.
   */
  id: PropTypes.string,
  setProps: PropTypes.func,

  /**
   * A label that will be printed when this component is rendered.
   */
  label: PropTypes.string,

  /**
   * The value displayed in the input.
   */
  value: PropTypes.string,
};

export default DashSankey;
