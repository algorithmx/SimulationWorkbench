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
}