// tapedeck
// play/record MQTT messages
// inspired by rpdswtk/mqtt_recorder, a python app
// currently pass params by envars, except mode=play/record pass on cmdline

import fs from 'fs'
import mqttlib from 'mqtt'
import parse from 'csv-parse/lib/sync.js'

const mode = process.argv[2] // 'play' or 'record'

const host = process.env.HOST || 'localhost'
const port = Number(process.env.PORT || 1883)
// const deviceId = process.env.DEVICE_ID // eg 'ccs-pa-001'
// const model = process.env.MODEL // eg 'ccs-pa'
// const modelsFolder = process.env.MODELS_FOLDER || '/etc/models'
// const file = process.env.FILE // eg '
//. this needs to be a fixed folder? ie for docker volume?
// const folder = process.env.FOLDER || '/etc/tapedeck' // eg '/Users/bburns/Desktop/tapedeck'
const folder = '/etc/tapedeck'
const loop = Boolean(process.env.LOOP || false)

console.log(`Tapedeck`)
console.log(`Play/record MQTT messages`)
console.log(`------------------------------------------------------------`)

const columns = 'topic,payload,qos,retain,time_now,time_delta'.split(',')

const clientId = `tapedeck-${Math.random()}`
const config = { host, port, clientId }

console.log(`Connecting to MQTT broker on`, config)
const mqtt = mqttlib.connect(config)

mqtt.on('connect', async function onConnect() {
  console.log(`Connected...`)

  // const simulationsFolder = `${modelsFolder}/${model}/simulations`
  const csvfiles = fs
    .readdirSync(folder)
    .filter(csvfile => csvfile.endsWith('.csv'))
    .sort()

  // do while loop
  do {
    for (const csvfile of csvfiles) {
      const csvpath = `${folder}/${csvfile}`
      console.log(`Reading ${csvpath}...`)
      const csv = fs.readFileSync(csvpath)
      const rows = parse(csv, { columns })
      for (const row of rows) {
        const { payload, qos, time_delta } = row
        // const topic = row.topic.replace('${deviceId}', deviceId)
        const topic = row.topic
        console.log(`Publishing topic ${topic}: ${payload.slice(0, 40)}...`)
        mqtt.publish(topic, payload)
        await sleep(time_delta * 1000) // pause between messages
      }
      await sleep(1000) // pause between csv files
    }
    await sleep(1000) // pause between loops
  } while (loop)

  console.log(`Closing MQTT connection...`)
  mqtt.end()
})

// sleep ms milliseconds
async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms))
}
