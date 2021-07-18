import fs from 'fs' // node lib for filesystem
import mqttlib from 'mqtt' // see https://github.com/mqttjs/MQTT.js
import parse from 'csv-parse/lib/sync.js' // see https://github.com/adaltas/node-csv-parse
import * as common from '../common.js'

export class Plugin {
  constructor() {}
  init({ mode, host, port, folder, loop, topic }) {
    console.log(`Mode: ${mode}`)

    const clientId = `recorder-${Math.random()}`
    // const config = { host, port, clientId, reconnectPeriod: 0 }
    const config = { host, port, clientId }

    console.log(`Connecting to MQTT broker on`, config)
    const mqtt = mqttlib.connect(config)

    let fd // file descriptor for recording

    mqtt.on('connect', async function onConnect() {
      console.log(`Connected...`)

      const columns = 'topic,payload,qos,retain,time_now,time_delta'.split(',')

      if (mode === 'play') {
        console.log(`Reading list of files in folder '${folder}'...`)
        let csvfiles
        try {
          csvfiles = fs
            .readdirSync(folder)
            .filter(csvfile => csvfile.endsWith('.csv'))
            .sort()
        } catch (error) {
          console.log(
            `Problem reading files - does the folder '${folder}' exist?`
          )
          process.exit(1)
        }
        if (csvfiles.length === 0) {
          console.log(`No csv files found in folder '${folder}'.`)
          process.exit(1)
        }

        // do while loop
        do {
          console.log(`Looping over files...`)
          for (const csvfile of csvfiles) {
            const csvpath = `${folder}/${csvfile}`

            process.stdout.write(`Reading ${csvpath}`)
            const csv = await fs.readFileSync(csvpath)
            const rows = parse(csv, { columns })

            for (const row of rows) {
              process.stdout.write('.')
              const { payload, qos, retain, time_delta } = row
              // const topic = row.topic
              const topic = row.topic.replace('${deviceId}', 'pa1') //... handle this
              // console.log(`Publishing topic ${topic}: ${payload.slice(0, 40)}...`)
              //. mosquitto closes with "disconnected due to protocol error" when send qos
              // mqtt.publish(topic, payload, { qos, retain })
              mqtt.publish(topic, payload, { retain })
              await common.sleep(time_delta * 1000) // pause between messages
            }
            console.log()
            await common.sleep(1000) // pause between csv files
          }
          await common.sleep(1000) // pause between loops
        } while (loop)
      } else {
        console.log(`Subscribing to MQTT topics (${topic})...`)
        mqtt.subscribe(topic, null, onSubscribe)

        // subscribed - granted is array of { topic, qos }
        function onSubscribe(err, granted) {
          console.log('Subscribed to', granted, '...')

          // open file for writing
          const datetime = new Date()
            .toISOString()
            // @ts-ignore
            .replaceAll(':', '')
            .slice(0, 17)
          const filename = datetime + '.csv'
          const filepath = `${folder}/${filename}`
          console.log(`Recording MQTT messages to '${filepath}'...`)
          try {
            fd = fs.openSync(filepath, 'w')
          } catch (error) {
            console.log(
              `Problem opening file - does the folder '${folder}' exist?`
            )
            process.exit(1)
          }
          let time_last = Number(new Date()) / 1000 // seconds

          mqtt.on('message', onMessage)
          console.log(`Listening...`)

          // message received - add to file
          function onMessage(topic, buffer, packet) {
            const message = buffer.toString()
            console.log('Message received:', topic, message.slice(0, 60))
            const msg = message.replaceAll('"', '""')
            const { qos, retain } = packet
            const time_now = Number(new Date()) / 1000 // seconds
            const time_delta = time_now - time_last // seconds
            time_last = time_now
            const row = `${topic},"${msg}",${qos},${retain},${time_now},${time_delta}\n`
            //. write each msg, or write to array and flush every n msgs
            fs.writeSync(fd, row)
          }
        }

        do {
          await common.sleep(2000)
        } while (true)
      }

      console.log(`Closing MQTT connection...`)
      mqtt.end()
    })
  }
}
