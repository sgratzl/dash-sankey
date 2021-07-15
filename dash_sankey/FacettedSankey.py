# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class FacettedSankey(Component):
    """A FacettedSankey component.
FacettedSankey shows an interactive parallel set / sankey diagram

Keyword arguments:

- children (a list of or a singular dash component, string or number; optional):
    children helper for dash.

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- facets (list of dicts; required):
    the facets sankey to render.

    `facets` is a list of dicts with keys:

    - layers (list of dicts; required):
        level sankey data.

        `layers` is a list of dicts with keys:

        - name (string; required)

        - nodes (list of dicts; required)

            `nodes` is a list of dicts with keys:

            - id (string; required)

            - ids (optional)

            - name (string; required)

    - links (optional):
        link data as an alternative to layers.

    - name (string; required)

    - nodes (optional):
        nodes data as an alternative to layers.

- height (number; optional):
    height of the resulting chart @default 300.

- iterations (number; optional):
    sets the number of relaxation iterations when generating the
    layout and returns this Sankey generator. @default 6.

- lineOffset (number; optional):
    offset between lines @default 5.

- nodeAlign (optional):
    justify method @default 'justify';.

- nodePadding (number; optional):
    sets the vertical separation between nodes at each column to the
    specified number and returns this Sankey generator. @default 8.

- nodeSort (optional):
    node sort order @default 'auto'.

- nodeWidth (number; optional):
    sets the node width to the specified number and returns this
    Sankey generator. @default 24.

- padding (optional):
    padding around SVG @default 5.

- selection (optional):
    the selection to highlight.

- selections (optional):
    additional selections to highlight in their given color.

- showLayers (boolean; optional):
    show layer names @default True.

- width (number; optional):
    width of the resulting chart."""
    @_explicitize_args
    def __init__(self, children=None, id=Component.UNDEFINED, width=Component.UNDEFINED, height=Component.UNDEFINED, padding=Component.UNDEFINED, lineOffset=Component.UNDEFINED, showLayers=Component.UNDEFINED, iterations=Component.UNDEFINED, nodeWidth=Component.UNDEFINED, nodePadding=Component.UNDEFINED, nodeAlign=Component.UNDEFINED, nodeSort=Component.UNDEFINED, selection=Component.UNDEFINED, selections=Component.UNDEFINED, facets=Component.REQUIRED, **kwargs):
        self._prop_names = ['children', 'id', 'facets', 'height', 'iterations', 'lineOffset', 'nodeAlign', 'nodePadding', 'nodeSort', 'nodeWidth', 'padding', 'selection', 'selections', 'showLayers', 'width']
        self._type = 'FacettedSankey'
        self._namespace = 'dash_sankey'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['children', 'id', 'facets', 'height', 'iterations', 'lineOffset', 'nodeAlign', 'nodePadding', 'nodeSort', 'nodeWidth', 'padding', 'selection', 'selections', 'showLayers', 'width']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}
        for k in ['facets']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(FacettedSankey, self).__init__(children=children, **args)
