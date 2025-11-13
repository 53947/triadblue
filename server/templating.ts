import Handlebars from "handlebars";

export interface TemplateRenderOptions {
  strict?: boolean;
  detectMissingVariables?: boolean;
}

export interface TemplateRenderResult {
  success: boolean;
  output?: string;
  missingVariables?: string[];
  error?: string;
}

export class TemplatingService {
  private handlebars: typeof Handlebars;
  private readonly builtInHelpers = new Set([
    "if", "unless", "each", "with", "lookup", "log",
    "eq", "ne", "gt", "gte", "lt", "lte",
    "and", "or", "not", "default",
    "uppercase", "lowercase", "capitalize",
    "join", "length", "json", "now"
  ]);

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  private registerHelpers() {
    this.handlebars.registerHelper("eq", function(a, b) {
      return a === b;
    });

    this.handlebars.registerHelper("ne", function(a, b) {
      return a !== b;
    });

    this.handlebars.registerHelper("gt", function(a, b) {
      return a > b;
    });

    this.handlebars.registerHelper("gte", function(a, b) {
      return a >= b;
    });

    this.handlebars.registerHelper("lt", function(a, b) {
      return a < b;
    });

    this.handlebars.registerHelper("lte", function(a, b) {
      return a <= b;
    });

    this.handlebars.registerHelper("and", function(...args) {
      const values = args.slice(0, -1);
      return values.every(Boolean);
    });

    this.handlebars.registerHelper("or", function(...args) {
      const values = args.slice(0, -1);
      return values.some(Boolean);
    });

    this.handlebars.registerHelper("not", function(value) {
      return !value;
    });

    this.handlebars.registerHelper("default", function(value, defaultValue) {
      return value ?? defaultValue;
    });

    this.handlebars.registerHelper("uppercase", function(str) {
      return typeof str === "string" ? str.toUpperCase() : str;
    });

    this.handlebars.registerHelper("lowercase", function(str) {
      return typeof str === "string" ? str.toLowerCase() : str;
    });

    this.handlebars.registerHelper("capitalize", function(str) {
      if (typeof str !== "string") return str;
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    this.handlebars.registerHelper("join", function(array, separator = ", ") {
      if (!Array.isArray(array)) return "";
      return array.join(separator);
    });

    this.handlebars.registerHelper("length", function(value) {
      if (Array.isArray(value)) return value.length;
      if (typeof value === "string") return value.length;
      if (typeof value === "object" && value !== null) return Object.keys(value).length;
      return 0;
    });

    this.handlebars.registerHelper("json", function(value, indent = 2) {
      try {
        return JSON.stringify(value, null, indent);
      } catch (e) {
        return "";
      }
    });

    this.handlebars.registerHelper("now", function(format = "iso") {
      const date = new Date();
      if (format === "iso") {
        return date.toISOString();
      } else if (format === "date") {
        return date.toLocaleDateString();
      } else if (format === "time") {
        return date.toLocaleTimeString();
      } else if (format === "datetime") {
        return date.toLocaleString();
      }
      return date.toISOString();
    });
  }

  render(
    template: string,
    data: Record<string, any>,
    options: TemplateRenderOptions = {}
  ): TemplateRenderResult {
    try {
      const compiledTemplate = this.handlebars.compile(template, {
        strict: options.strict ?? false,
        noEscape: true,
      });

      const missingVariables: string[] = [];

      if (options.detectMissingVariables) {
        const requiredVars = this.extractVariables(template);
        
        for (let i = 0; i < requiredVars.length; i++) {
          const varName = requiredVars[i];
          if (!(varName in data) || data[varName] === undefined || data[varName] === null) {
            missingVariables.push(varName);
          }
        }
      }

      const output = compiledTemplate(data);

      return {
        success: true,
        output,
        missingVariables: missingVariables.length > 0 ? missingVariables : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  renderMultiple(
    templates: Array<{ name: string; template: string }>,
    data: Record<string, any>,
    options: TemplateRenderOptions = {}
  ): Record<string, TemplateRenderResult> {
    const results: Record<string, TemplateRenderResult> = {};

    for (const { name, template } of templates) {
      results[name] = this.render(template, data, options);
    }

    return results;
  }

  validateTemplate(template: string): { valid: boolean; error?: string } {
    try {
      this.handlebars.compile(template);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  extractVariables(template: string): string[] {
    try {
      const ast = this.handlebars.parse(template);
      const variables = new Set<string>();

      const visit = (node: any) => {
        if (!node) return;

        if (node.type === "PathExpression" && node.data === false) {
          const parts = node.parts || [];
          if (parts.length > 0) {
            const rootPart = parts[0];
            if (rootPart !== "this" && !this.builtInHelpers.has(rootPart)) {
              variables.add(rootPart);
            }
          }
        }

        if (node.type === "MustacheStatement" || node.type === "BlockStatement") {
          if (node.path) visit(node.path);
          if (node.params) {
            for (const param of node.params) {
              visit(param);
            }
          }
        }

        if (node.type === "Program" && node.body) {
          for (const statement of node.body) {
            visit(statement);
          }
        }

        if (node.program) visit(node.program);
        if (node.inverse) visit(node.inverse);
      };

      visit(ast);
      return Array.from(variables);
    } catch (error) {
      return [];
    }
  }
}

export const templatingService = new TemplatingService();
