# AUTO GENERATED FILE - DO NOT EDIT

dsDashSankey <- function(children=NULL, id=NULL, height=NULL, iterations=NULL, layers=NULL, lineOffset=NULL, links=NULL, nodeAlign=NULL, nodePadding=NULL, nodeSort=NULL, nodeWidth=NULL, nodes=NULL, padding=NULL, selection=NULL, selections=NULL, showLayers=NULL, total=NULL, width=NULL) {
    
    props <- list(children=children, id=id, height=height, iterations=iterations, layers=layers, lineOffset=lineOffset, links=links, nodeAlign=nodeAlign, nodePadding=nodePadding, nodeSort=nodeSort, nodeWidth=nodeWidth, nodes=nodes, padding=padding, selection=selection, selections=selections, showLayers=showLayers, total=total, width=width)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'DashSankey',
        namespace = 'dash_sankey',
        propNames = c('children', 'id', 'height', 'iterations', 'layers', 'lineOffset', 'links', 'nodeAlign', 'nodePadding', 'nodeSort', 'nodeWidth', 'nodes', 'padding', 'selection', 'selections', 'showLayers', 'total', 'width'),
        package = 'dashSankey'
        )

    structure(component, class = c('dash_component', 'list'))
}
