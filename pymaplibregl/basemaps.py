from __future__ import annotations

from enum import Enum

from .layer import Layer, LayerType


class Carto(Enum):
    """Carto basemap styles

    Attributes:
        DARK_MATTER: dark-matter
        POSITRON: positron
        VOYAGER: voyager
        POSITRON_NOLABELS: positron-nolabels
        DARK_MATTER_NOLABELS: dark-matter-nolabels
        VOYAGER_NOLABELS: voyager-nolabels

    Examples:
        >>> from pymaplibregl import Map, MapOptions
        >>> from pymaplibregl.basemaps import Carto

        >>> map = Map(MapOptions(style=Carto.DARK_MATTER))
    """

    DARK_MATTER = "dark-matter"
    POSITRON = "positron"
    VOYAGER = "voyager"
    POSITRON_NOLABELS = "positron-nolabels"
    DARK_MATTER_NOLABELS = "dark-matter-nolabels"
    VOYAGER_NOLABELS = "voyager-nolabels"


def construct_carto_basemap_url(style_name: str | Carto = "dark-matter") -> str:
    return f"https://basemaps.cartocdn.com/gl/{Carto(style_name).value}-gl-style/style.json"


def construct_basemap_style(
    name: str = "nice-style", sources: dict = {}, layers: list = []
) -> dict:
    layers = [
        layer.to_dict() if isinstance(layer, Layer) else layer for layer in layers
    ]
    return {"name": name, "version": 8, "sources": sources, "layers": layers}


def background(color: str = "black", opacity: float = 1.0) -> dict:
    bg_layer = Layer(
        type=LayerType.BACKGROUND,
        source=None,
        paint={"background-color": color, "background-opacity": opacity},
    )
    return construct_basemap_style(layers=[bg_layer])
