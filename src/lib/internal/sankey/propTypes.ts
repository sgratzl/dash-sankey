import PropTypes from 'prop-types';
import type { SankeySelection } from 'src/lib/components/DashSankey';

export const ID_ARRAY = PropTypes.arrayOf(
  PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]).isRequired
).isRequired;

export const NODE_ARR = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ids: ID_ARRAY,
    layer: PropTypes.number,
  }).isRequired
);
export const LINK_ARR = PropTypes.arrayOf(
  PropTypes.shape({
    source: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    ids: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]).isRequired),
  }).isRequired
);

export const SELECTION_PROP_TYPE = PropTypes.oneOfType([
  ID_ARRAY,
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf<SankeySelection['type']>(['node', 'link', 'missing_in', 'missing_out', 'layer']).isRequired,
    ids: ID_ARRAY,
  }),
]);
