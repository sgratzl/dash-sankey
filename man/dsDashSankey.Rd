% Auto-generated: do not edit by hand
\name{dsDashSankey}

\alias{dsDashSankey}

\title{DashSankey component}

\description{
DashSankey shows an interactive parallel set / sankey diagram
}

\usage{
dsDashSankey(children=NULL, id=NULL, height=NULL, iterations=NULL,
layers=NULL, lineOffset=NULL, links=NULL, nodeAlign=NULL,
nodePadding=NULL, nodeSort=NULL, nodeWidth=NULL, nodes=NULL,
padding=NULL, selection=NULL, selections=NULL,
showLayers=NULL, total=NULL, width=NULL)
}

\arguments{
\item{children}{A list of or a singular dash component, string or number. children helper for dash}

\item{id}{Character. The ID used to identify this component in Dash callbacks.}

\item{height}{Numeric. height of the resulting chart
@default 300}

\item{iterations}{Numeric. sets the number of relaxation iterations when generating the layout and returns this Sankey generator.
@default 6}

\item{layers}{List of lists containing elements 'name', 'nodes'.
those elements have the following types:
  - name (character; required)
  - nodes (required): . nodes has the following type: list of lists containing elements 'id', 'name', 'ids'.
those elements have the following types:
  - id (character; required)
  - name (character; required)
  - ids (optional)ss. level sankey data}

\item{lineOffset}{Numeric. offset between lines
@default 5}

\item{links}{link data as an alternative to layers}

\item{nodeAlign}{A value equal to: 'left', 'right', 'center', 'justify', 'layer'. justify method
@default 'justify';}

\item{nodePadding}{Numeric. sets the vertical separation between nodes at each column to the specified number and returns this Sankey generator.
@default 8}

\item{nodeSort}{A value equal to: 'auto', 'fixed'. node sort order
@default 'auto'}

\item{nodeWidth}{Numeric. sets the node width to the specified number and returns this Sankey generator.
@default 24}

\item{nodes}{nodes data as an alternative to layers}

\item{padding}{padding around SVG
@default 5}

\item{selection}{the selection to highlight}

\item{selections}{List of lists containing elements 'color', 'ids'.
those elements have the following types:
  - color (character; required)
  - ids (optional)s. additional selections to highlight in their given color}

\item{showLayers}{Logical. show layer names
@default true}

\item{total}{Numeric. total number of ids to show percentages}

\item{width}{Numeric. width of the resulting chart}
}

\value{named list of JSON elements corresponding to React.js properties and their values}

