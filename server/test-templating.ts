import { templatingService } from "./templating";

async function testTemplatingService() {
  console.log("Testing Handlebars Templating Service...\n");

  const simpleTemplate = `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Features

{{#each FEATURES}}
- {{this}}
{{/each}}

## Tech Stack

{{#each TECH_STACK}}
- **{{this.category}}**: {{this.technologies}}
{{/each}}

{{#if HAS_DATABASE}}
Database: {{DATABASE_NAME}}
{{/if}}`;

  const testData = {
    PROJECT_NAME: "ConsoleBlue",
    PROJECT_DESCRIPTION: "Centralized task management hub for Replit projects",
    FEATURES: ["Task tracking", "GitHub integration", "Documentation generator"],
    TECH_STACK: [
      { category: "Frontend", technologies: "React, TypeScript, Tailwind CSS" },
      { category: "Backend", technologies: "Express.js, Drizzle ORM" },
      { category: "Database", technologies: "PostgreSQL (Neon)" },
    ],
    HAS_DATABASE: true,
    DATABASE_NAME: "PostgreSQL",
  };

  console.log("1. Testing basic render:");
  const result1 = templatingService.render(simpleTemplate, testData);
  console.log("Success:", result1.success);
  if (result1.success) {
    console.log("Output preview:");
    console.log(result1.output?.substring(0, 200) + "...\n");
  } else {
    console.log("Error:", result1.error, "\n");
  }

  console.log("2. Testing missing variables detection:");
  const result2 = templatingService.render(simpleTemplate, {}, { detectMissingVariables: true });
  console.log("Success:", result2.success);
  console.log("Missing variables:", result2.missingVariables, "\n");

  console.log("3. Testing custom helpers:");
  const helperTemplate = `{{uppercase PROJECT_NAME}} - {{lowercase STATUS}}
Length: {{length FEATURES}}
Joined: {{join FEATURES " | "}}`;
  
  const result3 = templatingService.render(helperTemplate, {
    PROJECT_NAME: "ConsoleBlue",
    STATUS: "ACTIVE",
    FEATURES: ["Task", "Docs", "GitHub"],
  });
  console.log("Success:", result3.success);
  if (result3.success) {
    console.log("Output:");
    console.log(result3.output, "\n");
  }

  console.log("4. Testing variable extraction:");
  const extractedVars = templatingService.extractVariables(simpleTemplate);
  console.log("Extracted variables:", extractedVars, "\n");

  console.log("5. Testing template validation:");
  const validTemplate = templatingService.validateTemplate(simpleTemplate);
  console.log("Valid template:", validTemplate.valid);
  
  const invalidTemplate = templatingService.validateTemplate("{{#each}} broken {{/if}}");
  console.log("Invalid template:", invalidTemplate.valid);
  console.log("Error:", invalidTemplate.error, "\n");

  console.log("6. Testing renderMultiple:");
  const result6 = templatingService.renderMultiple(
    [
      { name: "readme", template: "# {{PROJECT_NAME}}\n{{DESCRIPTION}}" },
      { name: "config", template: "Name: {{PROJECT_NAME}}\nVersion: {{VERSION}}" },
    ],
    { PROJECT_NAME: "Test", DESCRIPTION: "A test project", VERSION: "1.0.0" }
  );
  console.log("Readme success:", result6.readme.success);
  console.log("Config success:", result6.config.success);

  console.log("\nAll tests completed!");
}

testTemplatingService().catch(console.error);
