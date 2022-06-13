function readTime () {
    date = "" + DS3231.date() + "/" + DS3231.month() + "/" + DS3231.year()
    time = "" + DS3231.hour() + ":" + DS3231.minute()
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
// Test block
input.onButtonPressed(Button.A, function () {
    if (count > 0) {
        basic.showString("" + (dateTimeReadings[count - 1]))
        basic.showString("" + (Vreadings[count - 1]))
        basic.pause(1000)
        basic.showNumber(count)
        basic.pause(1000)
        basic.clearScreen()
    } else {
        basic.showString("wait for reading")
    }
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
    serial.writeNumber(DS3231.date())
    serial.writeNumber(DS3231.month())
    serial.writeNumber(DS3231.year())
    serial.writeLine("")
}
// Reset readings
input.onButtonPressed(Button.AB, function () {
    Vreadings = []
    dateTimeReadings = []
    count = 0
})
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
    serial.writeNumber(DS3231.hour())
    serial.writeNumber(DS3231.minute())
    serial.writeLine("")
}
radio.onReceivedString(function (receivedString) {
    // Debug - radio received
    serial.writeLine("radio received")
    if (count > 0) {
        basic.pause(2000)
        for (let index = 0; index <= count - 1; index++) {
            radio.sendString("" + dateTimeReadings[index] + ",")
            radio.sendString("" + (Vreadings[index]))
            basic.pause(500)
        }
    }
})
// Instant PTH
input.onButtonPressed(Button.B, function () {
    makeReading()
    basic.showString(Vreading)
})
serial.onDataReceived(serial.delimiters(Delimiters.CarriageReturn), function () {
    stringIn = serial.readUntil(serial.delimiters(Delimiters.CarriageReturn))
    command = stringIn.substr(0, 2)
    if (command == "st") {
        setTime()
    }
    if (command == "sd") {
        setDate()
    }
})
let command = ""
let minute = ""
let hour = ""
let year = ""
let month = ""
let stringIn = ""
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
sampleSize = 10
let oneMinute = 60000
Vreadings = []
dateTimeReadings = []
count = 0
radio.setGroup(1)
radio.setTransmitPower(7)
loops.everyInterval(oneMinute, function () {
    // Take readings once per hour
    if (DS3231.minute() == 0) {
        let Vbat = 0
        readTime()
        dateTimeReadings.push(dateTime)
        makeReading()
        Vreadings.push(convertToText(Vbat))
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