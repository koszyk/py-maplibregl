// import { getCustomMapMethods } from "./mapmethods";
// import deck from "https://esm.sh/deck.gl@9.0.16";
import { getTextFromFeature } from "./utils";

function getJSONConverter() {
  if (typeof deck === "undefined") {
    return;
  }

  const configuration = new deck.JSONConfiguration({ classes: deck });
  return new deck.JSONConverter({ configuration });
}

export default class PyMapLibreGL {
  constructor(mapOptions) {
    this._id = mapOptions.container;
    this._map = new maplibregl.Map(mapOptions);

    this._map.on("mouseover", () => {
      this._map.getCanvas().style.cursor = "pointer";
    });

    this._map.on("mouseout", () => {
      this._map.getCanvas().style.cursor = "";
    });

    // TODO: Do not add by default
    this._map.addControl(new maplibregl.NavigationControl());

    // this.customMapMethods = getCustomMapMethods(maplibregl, this._map);
    // console.log("Custom methods", Object.keys(this.customMapMethods));
    this._JSONConverter = getJSONConverter();
  }

  getMap() {
    return this._map;
  }

  applyMapMethod(name, params) {
    this._map[name](...params);
  }

  addControl(type, options, position) {
    this._map.addControl(new maplibregl[type](options), position);
  }

  addMarker({ lngLat, popup, options }) {
    const marker = new maplibregl.Marker(options).setLngLat(lngLat);
    if (popup) {
      const popup_ = new maplibregl.Popup(popup.options).setHTML(popup.text);
      marker.setPopup(popup_);
    }
    marker.addTo(this._map);
  }

  addLayer(layer, beforeId) {
    this._map.addLayer(layer, beforeId);

    // Add event listener
    if (typeof Shiny !== "undefined") {
      this._map.on("click", layer.id, (e) => {
        console.log(e, e.features[0]);
        const layerId_ = layer.id.replaceAll("-", "_");
        const inputName = `${this._id}_layer_${layerId_}`;
        const feature = {
          props: e.features[0].properties,
          layer_id: layer.id,
        };
        console.log(inputName, feature);
        Shiny.onInputChange(inputName, feature);
      });
    }
  }

  addPopup(layerId, property = null, template = null) {
    const popupOptions = {
      closeButton: false,
    };
    const popup = new maplibregl.Popup(popupOptions);
    this._map.on("click", layerId, (e) => {
      const feature = e.features[0];
      // const text = feature.properties[property];
      const text = getTextFromFeature(feature, property, template);
      popup.setLngLat(e.lngLat).setHTML(text).addTo(this._map);
    });
  }

  addTooltip(layerId, property = null, template = null) {
    const popupOptions = {
      closeButton: false,
      closeOnClick: false,
    };
    const popup = new maplibregl.Popup(popupOptions);
    this._map.on("mousemove", layerId, (e) => {
      const feature = e.features[0];
      const text = getTextFromFeature(feature, property, template);
      popup.setLngLat(e.lngLat).setHTML(text).addTo(this._map);
    });

    this._map.on("mouseleave", layerId, () => {
      popup.remove();
    });
  }

  setSourceData(sourceId, data) {
    this._map.getSource(sourceId).setData(data);
  }

  addDeckOverlay(deckLayers) {
    if (typeof this._JSONConverter === "undefined") {
      console.log("deck or JSONConverter is undefined");
      return;
    }
    const layers = deckLayers.map((deckLayer) =>
      this._JSONConverter.convert(
        Object.assign(deckLayer, {
          onHover: ({ object }) => {
            console.log(object);

            // Add even listener
            if (typeof Shiny !== "undefined") {
              const inputName = `${this._id}_layer_${deckLayer.id}`;
              console.log("deckInputName", inputName);
              Shiny.onInputChange(inputName, object);
            }
          },
        }),
      ),
    );
    // console.log("deckLayers", layers);

    // Just as a POC, Use mustache template, maybe set tooltip via onHover using Popups from maplibregl
    function getTooltip({ object }) {
      return (
        object &&
        Object.entries(object)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      );
    }

    const deckOverlay = new deck.MapboxOverlay({
      interleaved: true,
      layers: layers,
      getTooltip,
    });
    this._map.addControl(deckOverlay);
  }

  render(calls) {
    calls.forEach(([name, params]) => {
      // Custom method
      if (
        [
          "addLayer",
          "addPopup",
          "addTooltip",
          "addMarker",
          "addPopup",
          "addControl",
          "setSourceData",
          "addDeckOverlay",
        ].includes(name)
      ) {
        console.log("Custom method", name, params);
        this[name](...params);
        return;
      }

      console.log("Map method", name);

      // this._map[name](...params);
      this.applyMapMethod(name, params);
    });
  }
}
