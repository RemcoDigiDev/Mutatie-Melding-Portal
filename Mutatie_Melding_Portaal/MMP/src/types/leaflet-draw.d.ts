import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options: any);
    }
  }

  namespace Draw {
    const Event: {
      CREATED: string;
      EDITED: string;
      DELETED: string;
    };
  }
}