declare module 'jalali-date' {
  type JalaliArrayInput = [number | string, number | string, number | string];

  export default class JDate {
    constructor();
    constructor(date: Date);
    constructor(date: JalaliArrayInput);
    constructor(year: number, month: number, day: number);

    date: [number, number, number];
    input: Date | number[];

    toGregorian(): Date;
    getFullYear(): number;
    setFullYear(year: number): JDate;
    getMonth(): number;
    setMonth(month: number): JDate;
    getDate(): number;
    setDate(day: number): JDate;
    getDay(): number;
    format(pattern: string): string;

    static toJalali(date: Date): [number, number, number];
    static to_jalali(date: Date): [number, number, number];
    static toGregorian(year: number, month: number, day: number): Date;
    static to_gregorian(year: number, month: number, day: number): Date;
    static isLeapYear(year: number): boolean;
    static daysInMonth(year: number, month: number): number;
  }
}
