export class Tool {
    name: string;
    description: string;
    scripts: string;
    language: string;

    constructor(name: string, description: string, scripts: string, language: string) {
        this.name = name;
        this.description = description;
        this.scripts = scripts;
        this.language = language;
    }

    getName(): string {
        return this.name;
    }

    setScript(script: string): this {
        this.scripts = script;
        return this;
    }

    setLanguage(language: string): this {
        this.language = language;
        return this;
    }

    setName(name: string): this {
        this.name = name;
        return this;
    }

    setDescription(description: string): this {
        this.description = description;
        return this;
    }
}