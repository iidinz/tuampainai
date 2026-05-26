declare module 'georaster' {
  interface GeoRaster {
    width: number;
    height: number;
    values: number[][][];
    mins: number[];
    maxs: number[];
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    noDataValue?: number | null;
    projection?: string;
    pixelWidth?: number;
    pixelHeight?: number;
  }

  function parseGeoraster(
    arrayBuffer: ArrayBuffer,
    options?: Record<string, unknown>
  ): Promise<GeoRaster>;

  export default parseGeoraster;
}
