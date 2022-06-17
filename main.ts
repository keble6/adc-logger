// This code reads the 3 ADC channels in sequence every hour.
// The scaling assumes external resistors of 270k from input to microbit pins
// and 330k from Pn to ground. So full scale is 6.0V. Other ratios require code change.
// The ADC voltage reference is VDD (nominally 3.3V).
// 
// Measurements are stored as a date/time string followed by the 3 voltages, all comma separated.
// Button usage:
// A uploads stored readings to serial/USB
// B displays voltage readings
// Serial port commands
// st+hhmm - sets time, e.g. st1306 for 6 minutes past 1 pm
// sd+ddmmyyyy - sets date e.g. sd01122022 for 1 Dec 2022
// rt - reads date time string to USB
// up - uploads stored readings to USB
// xx - deletes stored readings
function readTime () {
    date = "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year()
    time = "" + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute())
    dateTime = "" + date + " " + time
}
function makeReading () {
    for (let channel = 0; channel <= 2; channel++) {
        if (channel == 0) {
            Ntotal = 0
            for (let sample = 0; sample <= sampleSize - 1; sample++) {
                Ntotal += pins.analogReadPin(AnalogPin.P0)
            }
        } else if (channel == 1) {
            Ntotal = 0
            for (let sample2 = 0; sample2 <= sampleSize - 1; sample2++) {
                Ntotal += pins.analogReadPin(AnalogPin.P1)
            }
        } else {
            Ntotal = 0
            for (let sample3 = 0; sample3 <= sampleSize - 1; sample3++) {
                Ntotal += pins.analogReadPin(AnalogPin.P2)
            }
        }
        Nave = Ntotal / sampleSize
        Vscaled = Nave * (600 / 1023)
        Vscaled = Math.round(Vscaled)
        Vscaled = Vscaled / 100
        if (channel == 0) {
            Vreading = "" + convertToText(Vscaled) + ","
        } else if (channel == 1) {
            Vreading = "" + Vreading + convertToText(Vscaled) + ","
        } else {
            Vreading = "" + Vreading + convertToText(Vscaled) + ","
        }
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
    // the first 2 characters after command
    date = stringIn.substr(2, 2)
    // the next 2 characters
    month = stringIn.substr(4, 2)
    // the last 4 characters
    year = stringIn.substr(6, 4)
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
// Upload all readings
function upload () {
    // Debug
    serial.writeLine("#count = " + count)
    if (count > 0) {
        basic.pause(100)
        for (let index = 0; index <= count - 1; index++) {
            serial.writeString("" + dateTimeReadings[index] + ",")
            basic.pause(200)
            serial.writeLine("" + (Vreadings[index]))
            basic.pause(200)
        }
    }
}
function setTime () {
    // the first 2 characters after command
    hour = stringIn.substr(2, 2)
    // the next 2 characters command
    minute = stringIn.substr(4, 2)
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
// Show ADC readings
input.onButtonPressed(Button.B, function () {
    makeReading()
    basic.showString(Vreading)
})
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    stringIn = serial.readLine()
    command = stringIn.substr(0, 2)
    if (command.compare("st") == 0) {
        setTime()
        serial.writeLine("#time has been set")
    } else if (command.compare("sd") == 0) {
        setDate()
        serial.writeLine("#date has been set")
    } else if (command.compare("rt") == 0) {
        readTime()
        serial.writeLine("#date/time = " + dateTime)
    } else if (command.compare("up") == 0) {
        upload()
    } else if (command.compare("xx") == 0) {
        serial.writeLine("#start xx")
        Vreadings = []
        dateTimeReadings = []
        count = 0
        serial.writeLine("#All readings deleted")
    }
})
let command = ""
let minute = ""
let hour = ""
let year = ""
let month = ""
let Vreading = ""
let Vscaled = 0
let Nave = 0
let Ntotal = 0
let dateTime = ""
let time = ""
let date = ""
let count = 0
let dateTimeReadings: string[] = []
let Vreadings: string[] = []
let sampleSize = 0
let stringIn = ""
serial.redirectToUSB()
serial.setRxBufferSize(32)
serial.setTxBufferSize(64)
stringIn = ""
sampleSize = 10
let oneMinute = 60000
Vreadings = []
dateTimeReadings = []
count = 0
loops.everyInterval(oneMinute, function () {
    // Take readings once per hour
    if (DS3231.minute() == 0) {
        readTime()
        dateTimeReadings.push(dateTime)
        makeReading()
        Vreadings.push(convertToText(Vreading))
        count += 1
    }
    basic.showLeds(`
        . . . . #
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        `)
    basic.pause(50)
    basic.clearScreen()
})
