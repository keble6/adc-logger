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
// Show date and time
input.onButtonPressed(Button.A, function () {
    readTime()
    basic.showString(dateTime)
})
function setDate () {
    serial.writeLine("start sd")
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
    basic.pause(100)
    serial.writeLine("#date has been set")
    serial.writeString("" + (leadingZero(parseFloat(date))))
    serial.writeString("" + (leadingZero(parseFloat(month))))
    serial.writeString(year)
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
    basic.pause(100)
    serial.writeLine("#time has been set")
    serial.writeString("" + (leadingZero(parseFloat(hour))))
    serial.writeString("" + (leadingZero(parseFloat(minute))))
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
// Show ADC readings
input.onButtonPressed(Button.B, function () {
    makeReading()
    basic.showString(Vreading)
})
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
stringIn = ""
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
basic.forever(function () {
    stringIn = serial.readUntil(serial.delimiters(Delimiters.CarriageReturn))
    if (stringIn.substr(0, 2).compare("st") == 0) {
        setTime()
        stringIn = ""
    } else if (stringIn.substr(0, 2).compare("sd") == 0) {
        setDate()
        stringIn = ""
    }
})
