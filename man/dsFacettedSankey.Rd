% Auto-generated: do not edit by hand
\name{dsFacettedSankey}

\alias{dsFacettedSankey}

\title{FacettedSankey component}

\description{
FacettedSankey shows an interactive parallel set / sankey diagram
}

\usage{
dsFacettedSankey(children=NULL, id=NULL, facets=NULL, height=NULL,
iterations=NULL, lineOffset=NULL, nodeAlign=NULL,
nodePadding=NULL, nodeSort=NULL, nodeWidth=NULL,
padding=NULL, selection=NULL, selections=NULL,
showLayers=NULL, width=NULL)
}

\arguments{
\item{children}{A list of or a singular dash component, string or number. children helper for dash}

\item{id}{Character. The ID used to identify this component in Dash callbacks.}

\item{facets}{List of lists containing elements 'name', 'layers', 'nodes', 'links'.
those elements have the following types:
  - name (character; required)
  - layers (required): level sankey data. layers has the following type: list of lists containing elements 'name', 'nodes'.
those elements have the following types:
  - name (character; required)
  - nodes (required): . nodes has the following type: list of lists containing elements 'id', 'name', 'ids'.
those elements have the following types:
  - id (character; required)
  - name (character; required)
  - ids (optional)ss
  - nodes (optional): nodes data as an alternative to layers
  - links (optional): link data as an alternative to layerss. the facets sankey to render}

\item{height}{Numeric. height of the resulting chart
@default 300}

\item{iterations}{Numeric. sets the number of relaxation iterations when generating the layout and returns this Sankey generator.
@default 6}

\item{lineOffset}{Numeric. offset between lines
@default 5}

\item{nodeAlign}{justify method
@default 'justify';}

\item{nodePadding}{Numeric. sets the vertical separation between nodes at each column to the specified number and returns this Sankey generator.
@default 8}

\item{nodeSort}{node sort order
@default 'auto'}

\item{nodeWidth}{Numeric. sets the node width to the specified number and returns this Sankey generator.
@default 24}

\item{padding}{padding around SVG
@default 5}

\item{selection}{the selection to highlight}

\item{selections}{additional selections to highlight in their given color}

\item{showLayers}{Logical. show layer names
@default true}

\item{width}{Numeric. width of the resulting chart}
}

\value{named list of JSON elements corresponding to React.js properties and their values}

