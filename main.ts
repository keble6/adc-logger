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
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    stringIn = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    command = stringIn.substr(0, 2)
    if (command.compare("st") == 0) {
        serial.writeLine("#time has been set")
    } else if (command.compare("sd") == 0) {
        serial.writeLine("#date has been set")
    } else if (command.compare("rt") == 0) {
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
// Upload all readings
function upload () {
    bluetooth.uartWriteLine("#count = " + count)
    if (count > 0) {
        basic.pause(100)
        for (let index = 0; index <= count - 1; index++) {
            bluetooth.uartWriteString("" + dateTimeReadings[index] + ",")
            basic.pause(200)
            bluetooth.uartWriteLine(Vreadings[index])
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
let dateTime = 0
let command = ""
let count = 0
let dateTimeReadings: number[] = []
let Vreadings: string[] = []
let stringIn = ""
bluetooth.startUartService()
stringIn = ""
let sampleSize = 10
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
    led.plot(4, 0)
    basic.pause(50)
    led.unplot(4, 0)
})
