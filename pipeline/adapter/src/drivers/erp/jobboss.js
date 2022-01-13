// jobboss driver

import mssql from 'mssql' // ms sql server driver https://github.com/tediousjs/node-mssql
import * as lib from '../../lib.js'

const pollInterval = 5000 // ms

//. hardcode schedule for now
const schedule = {
  workdays: [
    { day: 1, start: '5:00', stop: '15:30' }, // mon
    { day: 2, start: '5:00', stop: '15:30' }, // tue
    { day: 3, start: '5:00', stop: '15:30' }, // wed
    { day: 4, start: '5:00', stop: '15:30' }, // thu
    { day: 5, start: '5:00', stop: '13:30' }, // fri
    { day: 6, start: '5:00', stop: '13:00' }, // sat
  ],
  holidays: ['2021-12-25', '2021-12-31', '2021-01-01', '2021-01-03'],
}

export class AdapterDriver {
  async init({
    deviceId,
    protocol,
    cache,
    inputs,
    socket,
    connection, // { server, port, database, user, password } - set in setup.yaml
    devices, // from setup.yaml
  }) {
    console.log(`JobBoss - initialize driver...`)

    // need to wait a bit to make sure the cutter cache items are setup before
    // writing to them. they're setup via the cutter/marumatsu module.
    console.log(`JobBoss - waiting a bit...`)
    await lib.sleep(6000)

    console.log(`JobBoss - connecting to database...`, connection.server)
    let pool
    try {
      pool = await mssql.connect(connection)
      console.log(`JobBoss - connected`)
      setAvailable()
      await backfill() // do backfill first
      // await poll() // do initial poll
      // setInterval(poll, pollInterval) // poll every n seconds
    } catch (error) {
      console.log(error)
    }

    async function backfill() {
      console.log(`JobBoss backfilling any missed dates...`)
      const today = new Date() //.
      //. loop over devices from setup.yaml,
      // look up times in db, and set their value.
      for (let device of devices) {
        if (device.jobbossId) {
          const lastDay = await getLastDay(device)
          for (let day = lastDay; day < today; day++) {
            const times = await getTimes(device, day)
            // cache.set(`${device.id}-start`, '2022-01-11 03:00:00')
            // cache.set(`${device.id}-complete`, '2022-01-11 15:30:00')
            cache.set(`${device.id}-start`, '2022-01-11 03:00:00')
            cache.set(`${device.id}-complete`, '2022-01-11 15:30:00')
          }
        }
      }
    }

    // get start/stop times for given device and day
    //. default to today
    async function getTimes(device, day) {
      const start = 0
      const stop = 0
      const times = { start, stop }
      return times
    }

    async function getLastDay(device) {
      return new Date()
    }

    async function poll() {
      console.log(`JobBoss - polling for job info...`)
      const sql = `select 42, 'hello'`
      // const sql = `
      // select top 10
      //   opt.*
      // from
      //   job_operation op
      //   join job_operation_time opt on op.job_operation = opt.job_operation
      // where
      //   work_center = 'marumatsu'
      //   and opt.work_date between '2021-11-18' and '2021-11-19'
      // `
      try {
        const result = await pool
          .request()
          // .input('input_parameter', mssql.Int, 33)
          // .query('select * from mytable where id = @input_parameter')
          .query(sql)
        console.log(`JobBoss result -`)
        console.dir(result)
        cache.set(`${deviceId}-job`, '42')
      } catch (error) {
        console.log(error)
      }
    }

    //. method doesn't exist, but is in the readme
    // mssql.on('error', err => {
    //   // ... error handler
    // })

    function setAvailable() {
      cache.set(`${deviceId}-availability`, 'AVAILABLE')
    }

    function setUnavailable() {
      cache.set(`${deviceId}-availability`, 'UNAVAILABLE')
      cache.set(`${deviceId}-job`, 'UNAVAILABLE')
    }
  }
}
