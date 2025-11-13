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
        const variablePattern = /\{\{\{?([^{}]+)\}\}\}?/g;
        let match;
        const requiredVars: string[] = [];
        const seenVars = new Set<string>();

        while ((match = variablePattern.exec(template)) !== null) {
          const varExpression = match[1].trim();
          
          if (
            varExpression.startsWith("/") || 
            varExpression.startsWith("!") ||
            varExpression === "else" ||
            varExpression === "this" ||
            varExpression.startsWith("@") ||
            varExpression.startsWith("this.")
          ) {
            continue;
          }

          const parts = varExpression.split(/[\s.]/);
          const firstToken = parts[0];
          
          if (varExpression.startsWith("#") || varExpression.startsWith("^")) {
            const withoutPrefix = varExpression.substring(1).trim();
            const blockParts = withoutPrefix.split(/[\s.]/);
            const helperName = blockParts[0];
            
            if (this.builtInHelpers.has(helperName)) {
              for (let i = 1; i < blockParts.length; i++) {
                const arg = blockParts[i];
                if (arg && arg !== "this" && !arg.startsWith("@") && !this.builtInHelpers.has(arg) && !seenVars.has(arg)) {
                  requiredVars.push(arg);
                  seenVars.add(arg);
                }
              }
              continue;
            } else {
              if (!seenVars.has(helperName)) {
                requiredVars.push(helperName);
                seenVars.add(helperName);
              }
            }
          } else if (this.builtInHelpers.has(firstToken)) {
            for (let i = 1; i < parts.length; i++) {
              const arg = parts[i];
              if (arg && arg !== "this" && !arg.startsWith("@") && !arg.startsWith('"') && !arg.startsWith("'") && isNaN(Number(arg)) && !seenVars.has(arg)) {
                requiredVars.push(arg);
                seenVars.add(arg);
              }
            }
          } else {
            const rootVar = firstToken;
            if (rootVar && rootVar !== "this" && !rootVar.startsWith("@") && !seenVars.has(rootVar)) {
              requiredVars.push(rootVar);
              seenVars.add(rootVar);
            }
          }
        }

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
    const variablePattern = /\{\{\{?([^{}]+)\}\}\}?/g;
    const variables: string[] = [];
    const seen = new Set<string>();
    let match;

    while ((match = variablePattern.exec(template)) !== null) {
      const varExpression = match[1].trim();
      
      if (
        varExpression.startsWith("/") || 
        varExpression.startsWith("!") ||
        varExpression === "else" ||
        varExpression === "this" ||
        varExpression.startsWith("@") ||
        varExpression.startsWith("this.")
      ) {
        continue;
      }

      const parts = varExpression.split(/[\s.]/);
      const firstToken = parts[0];
      
      if (varExpression.startsWith("#") || varExpression.startsWith("^")) {
        const withoutPrefix = varExpression.substring(1).trim();
        const blockParts = withoutPrefix.split(/[\s.]/);
        const helperName = blockParts[0];
        
        if (this.builtInHelpers.has(helperName)) {
          for (let i = 1; i < blockParts.length; i++) {
            const arg = blockParts[i];
            if (arg && arg !== "this" && !arg.startsWith("@") && !this.builtInHelpers.has(arg) && !seen.has(arg)) {
              variables.push(arg);
              seen.add(arg);
            }
          }
          continue;
        } else {
          if (!seen.has(helperName)) {
            variables.push(helperName);
            seen.add(helperName);
          }
        }
      } else if (this.builtInHelpers.has(firstToken)) {
        for (let i = 1; i < parts.length; i++) {
          const arg = parts[i];
          if (arg && arg !== "this" && !arg.startsWith("@") && !arg.startsWith('"') && !arg.startsWith("'") && isNaN(Number(arg)) && !seen.has(arg)) {
            variables.push(arg);
            seen.add(arg);
          }
        }
      } else {
        const rootVar = firstToken;
        if (rootVar && rootVar !== "this" && !rootVar.startsWith("@") && !seen.has(rootVar)) {
          variables.push(rootVar);
          seen.add(rootVar);
        }
      }
    }

    return variables;
  }
}

export const templatingService = new TemplatingService();
