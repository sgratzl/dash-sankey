# AUTO GENERATED FILE - DO NOT EDIT

dsFacettedSankey <- function(children=NULL, id=NULL, facets=NULL, height=NULL, iterations=NULL, lineOffset=NULL, nodeAlign=NULL, nodePadding=NULL, nodeSort=NULL, nodeWidth=NULL, padding=NULL, selection=NULL, selections=NULL, showLayers=NULL, width=NULL) {
    
    props <- list(children=children, id=id, facets=facets, height=height, iterations=iterations, lineOffset=lineOffset, nodeAlign=nodeAlign, nodePadding=nodePadding, nodeSort=nodeSort, nodeWidth=nodeWidth, padding=padding, selection=selection, selections=selections, showLayers=showLayers, width=width)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'FacettedSankey',
        namespace = 'dash_sankey',
        propNames = c('children', 'id', 'facets', 'height', 'iterations', 'lineOffset', 'nodeAlign', 'nodePadding', 'nodeSort', 'nodeWidth', 'padding', 'selection', 'selections', 'showLayers', 'width'),
        package = 'dashSankey'
        )

    structure(component, class = c('dash_component', 'list'))
}
