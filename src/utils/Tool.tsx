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

    getScript(): string {
        return this.scripts;
    }

    getLanguage(): string {
        return this.language;
    }

    getName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description;
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