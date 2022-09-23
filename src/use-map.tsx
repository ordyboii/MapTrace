import { RefObject, useEffect, useState, useRef } from "react";
import "ol/ol.css";
import "ol-layerswitcher/dist/ol-layerswitcher.css";
import { Map, View } from "ol";
import LayerSwitcher, { type BaseLayerOptions } from "ol-layerswitcher";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { GeoJSON } from "ol/format";
import { Snap, Draw } from "ol/interaction";
import { FullScreen, ScaleLine } from "ol/control";
import { fromLonLat } from "ol/proj";

export const useMap = (mapRef: RefObject<HTMLElement>) => {
  const [map, setMap] = useState<Map>();
  const [tempLayer, setTempLayer] = useState<VectorLayer<VectorSource>>();
  const [draw, setDraw] = useState<Draw>();

  useEffect(() => {
    if (mapRef.current) {
      const baseMap = new TileLayer({
        title: "Base Map",
        type: "base",
        source: new OSM()
      } as BaseLayerOptions);

      const masterMap = new VectorLayer({
        title: "Master Map",
        source: new VectorSource({
          format: new GeoJSON(),
          url: "/master.json"
        }),
        style: {
          "fill-color": "rgba(0, 0, 0, 0.1)",
          "stroke-color": "rgba(0, 0, 0, 0.7)",
          "stroke-width": 0.5
        }
      } as BaseLayerOptions);

      const tempLayer = new VectorLayer({
        title: "Temporary Layer",
        source: new VectorSource(),
        style: {
          "fill-color": "rgba(255, 0, 0, 0.3)",
          "stroke-color": "rgba(255, 0, 0, 0.9)",
          "stroke-width": 0.5
        }
      } as BaseLayerOptions);
      setTempLayer(tempLayer);

      const map = new Map({
        target: mapRef.current,
        layers: [baseMap, masterMap, tempLayer],
        view: new View({
          center: fromLonLat([-2.4673, 52.6776]),
          zoom: 12
        })
      });
      map.addControl(new FullScreen());
      map.addControl(new ScaleLine());
      setMap(map);

      const layerSwitcher = new LayerSwitcher({
        groupSelectStyle: "children"
      });
      map.addControl(layerSwitcher);

      const drawInteraction = new Draw({
        type: "MultiPolygon",
        source: tempLayer.getSource()!,
        trace: true,
        traceSource: masterMap.getSource()!,
        style: {
          "stroke-color": "rgba(255, 255, 100, 0.5)",
          "stroke-width": 1.5,
          "fill-color": "rgba(255, 255, 100, 0.25)",
          "circle-radius": 6,
          "circle-fill-color": "rgba(255, 255, 100, 0.5)"
        }
      });
      map.addInteraction(drawInteraction);
      setDraw(draw);

      const snapInteraction = new Snap({
        source: masterMap.getSource()!
      });
      map.addInteraction(snapInteraction);

      return () => map.dispose();
    }
  }, []);

  return { map, tempLayer, draw };
};
