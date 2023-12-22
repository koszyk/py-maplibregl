from pymaplibregl import Layer, Map, output_maplibregl, render_maplibregl
from pymaplibregl.basemaps import carto_dark_matter, carto_positron
from shiny import App, ui

fill_layer = {
    "id": "vancouver-blocks-fill",
    "type": "fill",
    "source": {
        "type": "geojson",
        "data": "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json",
    },
    "paint": {"fill-color": "lightgreen", "fill-opacity": 0.6},
}

line_layer = {
    "id": "vancouver-blocks-line",
    "type": "line",
    "source": {
        "type": "geojson",
        "data": "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json",
    },
    "paint": {"line-color": "yellow", "line-opacity": 1.0},
}

line_layer2 = Layer(
    "line",
    source={
        "type": "geojson",
        "data": "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json",
    },
    paint={"line-color": "yellow", "line-opacity": 1.0},
)

center = [-123.0753056, 49.2686511]

app_ui = ui.page_fluid(
    ui.panel_title("Hello PyMapLibreGL!"),
    output_maplibregl("map", height=600),
)


def server(input, output, session):
    @render_maplibregl
    async def map():
        m = Map(style=carto_dark_matter(), center=center, zoom=12, pitch=35)
        marker = {
            "lngLat": center,
            "color": "yellow",
            "popup": "Hello PyMapLibreGL!",
        }
        m.add_marker(marker)
        m.add_layer(fill_layer)
        m.add_layer(line_layer2)
        return m


app = App(app_ui, server)

if __name__ == "__main__":
    app.run()
