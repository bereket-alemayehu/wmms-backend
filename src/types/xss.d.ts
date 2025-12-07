declare module "xss" {
  interface IFilterXSSOptions {
    whiteList?: Record<string, string[]>;
    stripIgnoreTag?: boolean;
    stripIgnoreTagBody?: boolean;
    allowList?: Record<string, string[]>;
    onTag?: (tag: string, html: string, options: any) => string | void;
    onTagAttr?: (tag: string, name: string, value: string) => string | void;
    onIgnoreTag?: (tag: string, html: string, options: any) => string | void;
    onIgnoreTagAttr?: (
      tag: string,
      name: string,
      value: string
    ) => string | void;
    safeAttrValue?: (tag: string, name: string, value: string) => string;
    escapeHtml?: (html: string) => string;
    stripBlankChar?: boolean;
    css?: boolean | object;
  }

  class FilterXSS {
    constructor(options?: IFilterXSSOptions);
    process(html: string): string;
  }

  function xss(html: string, options?: IFilterXSSOptions): string;
  export = xss;
  export { FilterXSS, IFilterXSSOptions };
}
