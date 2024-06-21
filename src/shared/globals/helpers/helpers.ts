export class Helpers{
    static firstLetterUpperCase(str: string){
        const valueString = str.toLowerCase();
        return valueString
            .split(' ')
            .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`)
            .join(' ');
    }

    static lowerCase(str: string){
        return str.toLowerCase();
    }

    static generateRandomIntegers(integerLength: number): number{
        const characters = '123456789';
        let result = '';
        for(let i = 0; i<integerLength; i++){
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return parseInt(result, 10);
    }

    static parseJson(prop: string): any {
        try{
            return JSON.parse(prop);
        }
        catch(error){
            return prop;
        }
    }

    static isDataURL(value: string): boolean {
        const dataUrlRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
        return dataUrlRegex.test(value);
    }

    static shuffle(list: string[]): string[] {
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    static escapeRegex(text: string): string {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
}