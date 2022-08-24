function readTime () {
	
}
function makeReading () {
    for (let channel = 0; channel <= 3; channel++) {
        let ADCreadings: number[] = []
        ADCreadings[channel] = 0
    }
}
function leadingZero (num: number) {
    if (num < 10) {
        return "0" + num
    } else {
        return convertToText(num)
    }
}
// Upload
input.onButtonPressed(Button.A, function () {
    upload()
})
function setDate () {
	
}
// Upload all readings
function upload () {
    bluetooth.uartWriteLine("")
    if (count > 0) {
        basic.pause(100)
        for (let index = 0; index <= count - 1; index++) {
            basic.pause(200)
            basic.pause(200)
        }
    }
}
function setTime () {
	
}
// Show ADC readings
input.onButtonPressed(Button.B, function () {
    makeReading()
    basic.showString("" + (Vreading))
})
let Vreading = 0
let count = 0
let stringIn = ""
let sampleSize = 10
let oneMinute = 60000
let Vreadings: string[] = []
let dateTimeReadings: number = []
count = 0
loops.everyInterval(oneMinute, function () {
    // Take readings once per hour
    if (DS3231.minute() == 0) {
        let dateTime = 0
        readTime()
        dateTimeReadings.push(dateTime)
        makeReading()
        Vreadings.push(convertToText(Vreading))
        count += 1
    }
    led.plot(4, 0)
    basic.pause(50)
    led.unplot(4, 0)
})
