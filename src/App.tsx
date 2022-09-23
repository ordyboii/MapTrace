import { useRef, useState } from "react";
import { GeoJSON } from "ol/format";
import { useMap } from "./use-map";

export default function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { tempLayer, draw } = useMap(mapRef);

  const [features, setFeatures] = useState<{ type: string; geometry: any }[]>(
    []
  );

  const saveFeatures = () => {
    const format = new GeoJSON();
    const tempFeatures = tempLayer?.getSource()?.getFeatures();

    if (tempFeatures) {
      const tempGeoJSON = format.writeFeaturesObject(tempFeatures);
      setFeatures(tempGeoJSON.features);
    }
  };

  return (
    <main>
      <h1>Map</h1>
      <div className='map' ref={mapRef}></div>
      <button onClick={saveFeatures}>Save</button>
      <button onClick={() => draw?.removeLastPoint()}>Undo</button>
      <button onClick={() => draw?.finishDrawing()}>Stop Plotting</button>
      <button onClick={() => draw?.dispose()}>Delete Plot</button>
      {features?.map(feature => JSON.stringify(feature.geometry))}
    </main>
  );
}
