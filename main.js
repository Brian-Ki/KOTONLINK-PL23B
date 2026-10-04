/**
 * Codec by https://github.com/Brian-Ki - Mugie
 * Decode KOTONLINK-PL23B LoRa Payload (Protocol V1.0.0)
 */
var bytes = [];

function decode(message) {
    var LoRaPayload = payload.DevEUI_uplink.payload_hex;
    var port = payload.DevEUI_uplink.FPort;
    var properties = {};
    var telemetry = {};

    for (var j = 0; j < LoRaPayload.length; j += 2) {
        bytes.push(parseInt(LoRaPayload.substr(j, 2), 16));
    }

    logger.Debug('FPort = ' + port + ', Payload Length = ' + bytes.length);

    if (bytes[0] === 0x80 && bytes[1] === 0x01 && bytes.length >= 24) {
        
        var rawLat = (bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9];
        var rawLon = (bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13];

        var lat = rawLat / 1000000.0;
        var lon = rawLon / 1000000.0;

        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 && lat !== 0 && lon !== 0) {
            telemetry.Latitude = lat;
            telemetry.Longitude = lon;
            properties.Latitude = lat;
            properties.Longitude = lon;
        } else {
            logger.Debug('GPS Fix Pending - Raw Lat: ' + rawLat + ', Raw Lon: ' + rawLon);
        }

        if (bytes.length >= 23) {
            var rawVoltage = (bytes[21] << 8) | bytes[22];
            var batteryVoltage = rawVoltage / 100.0;
            
            telemetry.BatteryVoltage = batteryVoltage;
            properties.BatteryVoltage = batteryVoltage;
        }

        if (bytes.length >= 24) {
            telemetry.BatteryPercentage = bytes[23];
        }
    } 
    else if (bytes[0] === 0x80 && bytes[1] === 0xB1) {
        telemetry.CommandAck = true;
        telemetry.Status = (bytes[3] === 0x01) ? "Success" : "Failure";
    }

    return {
        properties: properties,
        telemetry: telemetry
    };
}
