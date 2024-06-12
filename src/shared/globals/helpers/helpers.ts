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
}