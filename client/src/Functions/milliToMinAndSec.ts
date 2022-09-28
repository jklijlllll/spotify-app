export function milliToMinandSec(x: number) {
    let minutes = Math.floor(x / 60000);
    let seconds = Math.floor((x - minutes * 60000) / 1000);

    let minString = minutes.toString();
    let secString = seconds.toString();

    if (seconds < 10) secString = "0" + secString;

    let timeStamp = minString + ":" + secString;

    return timeStamp;
}