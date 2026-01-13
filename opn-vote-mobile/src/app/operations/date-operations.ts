export function daysBetween(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = date2.getTime() - date1.getTime();
    return Math.floor(diffMs / msPerDay);
}