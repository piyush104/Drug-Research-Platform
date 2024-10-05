// declarations.d.ts
declare module "jsvectormap" {
    interface JsVectorMapOptions {
      selector: string;
      map: string;
      zoomButtons?: boolean;
      regionStyle?: {
        initial?: {
          fill?: string;
        };
        hover?: {
          fillOpacity?: number;
          fill?: string;
        };
      };
      labels?: {
        regions?: {
          render?: (code: string) => string;
        };
      };
    }
  
    class JsVectorMap {
      constructor(options: JsVectorMapOptions);
    }
  
    export = JsVectorMap;
  }