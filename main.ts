function readTime () {
    date = "" + DS3231.date() + "/" + DS3231.month() + "/" + DS3231.year()
    time = "" + DS3231.hour() + ":" + DS3231.minute()
    dateTime = "" + date + " " + time
}
function makeReading () {
    ADC0 = "" + convertToText(ADS1115.readADC(0)) + ","
    ADC1 = "" + convertToText(ADS1115.readADC(1)) + ","
    ADC2 = "" + convertToText(ADS1115.readADC(2)) + ","
    ADC3 = "" + convertToText(ADS1115.readADC(3)) + ""
}
function resetReadings () {
    Vreadings = []
    dateTimeReadings = []
    count = 0
    serial.writeLine("#Resetting readings")
}
// Instant dateTime
input.onButtonPressed(Button.A, function () {
    readTime()
    basic.showString(dateTime)
})
function setDate (num: number) {
    stringIn = convertToText(num)
    // the first 2 characters after command
    date = stringIn.substr(0, 2)
    // the next 2 characters
    month = stringIn.substr(2, 2)
    // the last 4 characters
    year = stringIn.substr(4, 4)
    DS3231.dateTime(
    parseFloat(year),
    parseFloat(month),
    parseFloat(date),
    DS3231.day(),
    DS3231.hour(),
    DS3231.minute(),
    0
    )
}
function upload () {
    if (count > 0) {
        serial.writeLine("#uploading")
        basic.pause(2000)
        for (let index = 0; index <= count - 1; index++) {
            radio.sendString("" + dateTimeReadings[index] + ",")
            radio.sendString("" + (Vreadings0[index]))
            radio.sendString("" + (Vreadings1[index]))
            radio.sendString("" + (Vreadings2[index]))
            radio.sendString("" + (Vreadings3[index]))
            // New line
            radio.sendString(convertToText(10))
            basic.pause(500)
        }
    }
}
function setTime (num: number) {
    stringIn = convertToText(num)
    // the first 2 characters after command
    hour = stringIn.substr(0, 2)
    // the next 2 characters command
    minute = stringIn.substr(2, 2)
    DS3231.dateTime(
    DS3231.year(),
    DS3231.month(),
    DS3231.date(),
    DS3231.day(),
    parseFloat(hour),
    parseFloat(minute),
    0
    )
}
// Instant Vreadings
input.onButtonPressed(Button.B, function () {
    let ADCreadings = 0
    makeReading()
    basic.showString("" + (ADCreadings))
})
radio.onReceivedValue(function (name, value) {
    if (name.compare("st") == 0) {
        setTime(value)
        serial.writeLine("#Setting Time")
    } else if (name.compare("sd") == 0) {
        setDate(value)
        serial.writeLine("#Setting Date")
    } else if (name.compare("rt") == 0) {
        readTime()
        serial.writeLine("#Reading dateTime")
        radio.sendString(dateTime)
    } else if (name.compare("xx") == 0) {
        resetReadings()
        serial.writeLine("#Resetting readings")
    } else if (name.compare("rv") == 0) {
        makeReading()
        radio.sendString("" + (Vreadings))
        serial.writeLine("#read Vreadings")
    } else if (name.compare("up") == 0) {
        upload()
        serial.writeLine("#Uploading")
    }
})
let minute = ""
let hour = ""
let year = ""
let month = ""
let stringIn = ""
let Vreadings: number[] = []
let ADC3 = ""
let ADC2 = ""
let ADC1 = ""
let ADC0 = ""
let dateTime = ""
let time = ""
let date = ""
let count = 0
let dateTimeReadings: string[] = []
let Vreadings3: string[] = []
let Vreadings2: string[] = []
let Vreadings1: string[] = []
let Vreadings0: string[] = []
let oneMinute = 60000
Vreadings0 = []
Vreadings1 = []
Vreadings2 = []
Vreadings3 = []
dateTimeReadings = []
count = 0
radio.setGroup(1)
radio.setTransmitPower(7)
// Debug - start serial
serial.writeLine("#starting")
ADS1115.setFSR(FSR.V4)
loops.everyInterval(oneMinute, function () {
    // Take readings every 15 minutes
    if (DS3231.minute() % 15 == 0) {
        // Debug - make a reading
        serial.writeLine("#Making a reading")
        readTime()
        dateTimeReadings.push(dateTime)
        makeReading()
        Vreadings0.push(ADC0)
        Vreadings1.push(ADC1)
        Vreadings2.push(ADC2)
        Vreadings3.push(ADC3)
        count += 1
    }
    led.plot(4, 0)
    basic.pause(50)
    led.unplot(4, 0)
})
