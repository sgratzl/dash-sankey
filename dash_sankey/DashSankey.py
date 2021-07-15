# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class DashSankey(Component):
    """A DashSankey component.
DashSankey shows an interactive parallel set / sankey diagram

Keyword arguments:

- children (a list of or a singular dash component, string or number; optional):
    children helper for dash.

- id (string; default undefined):
    The ID used to identify this component in Dash callbacks.

- height (number; default 300):
    height of the resulting chart @default 300.

- iterations (number; default 6):
    sets the number of relaxation iterations when generating the
    layout and returns this Sankey generator. @default 6.

- layers (list of dicts; default undefined):
    level sankey data.

    `layers` is a list of dicts with keys:

    - name (string; required)

    - nodes (list of dicts; required)

        `nodes` is a list of dicts with keys:

        - id (string; required)

        - ids (optional)

        - name (string; required)

- lineOffset (number; default 5):
    offset between lines @default 5.

- links (default undefined):
    link data as an alternative to layers.

- nodeAlign (a value equal to: 'left', 'right', 'center', 'justify', 'layer'; default 'justify'):
    justify method @default 'justify';.

- nodePadding (number; default 8):
    sets the vertical separation between nodes at each column to the
    specified number and returns this Sankey generator. @default 8.

- nodeSort (a value equal to: 'auto', 'fixed'; default 'auto'):
    node sort order @default 'auto'.

- nodeWidth (number; default 24):
    sets the node width to the specified number and returns this
    Sankey generator. @default 24.

- nodes (default undefined):
    nodes data as an alternative to layers.

- padding (default DEFAULT_PADDING):
    padding around SVG @default 5.

- selection (default undefined):
    the selection to highlight.

- selections (list of dicts; default undefined):
    additional selections to highlight in their given color.

    `selections` is a list of dicts with keys:

    - color (string; required)

    - ids (optional)

- showLayers (boolean; default True):
    show layer names @default True.

- total (number; default undefined):
    total number of ids to show percentages.

- width (number; default undefined):
    width of the resulting chart."""
    @_explicitize_args
    def __init__(self, children=None, id=Component.UNDEFINED, width=Component.UNDEFINED, height=Component.UNDEFINED, padding=Component.UNDEFINED, lineOffset=Component.UNDEFINED, showLayers=Component.UNDEFINED, total=Component.UNDEFINED, iterations=Component.UNDEFINED, nodeWidth=Component.UNDEFINED, nodePadding=Component.UNDEFINED, nodeAlign=Component.UNDEFINED, nodeSort=Component.UNDEFINED, layers=Component.UNDEFINED, nodes=Component.UNDEFINED, links=Component.UNDEFINED, selection=Component.UNDEFINED, selections=Component.UNDEFINED, **kwargs):
        self._prop_names = ['children', 'id', 'height', 'iterations', 'layers', 'lineOffset', 'links', 'nodeAlign', 'nodePadding', 'nodeSort', 'nodeWidth', 'nodes', 'padding', 'selection', 'selections', 'showLayers', 'total', 'width']
        self._type = 'DashSankey'
        self._namespace = 'dash_sankey'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['children', 'id', 'height', 'iterations', 'layers', 'lineOffset', 'links', 'nodeAlign', 'nodePadding', 'nodeSort', 'nodeWidth', 'nodes', 'padding', 'selection', 'selections', 'showLayers', 'total', 'width']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}
        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(DashSankey, self).__init__(children=children, **args)
