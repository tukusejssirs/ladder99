// modbus driver

import ModbusRTU from 'modbus-serial'

export class AdapterDriver {
  //
  async start({ device, cache, source, schema }) {
    //
    console.log('Modbus init', device.id)
    this.device = device
    this.cache = cache
    this.source = source
    this.schema = schema

    this.host = source?.connect?.host
    this.port = source?.connect?.port ?? 502

    // this.inputs = schema?.inputs?.inputs || [] // array of { key, nodeId }
    // console.log('Modbus inputs', this.inputs)
    // this.subscriptions = []

    try {
      this.client = await this.getClient() // connect to server
    } catch (error) {
      console.error('Modbus connection error', error)
      return
    }

    console.log(`Modbus connected`)
    this.setValue('avail', 'AVAILABLE') // connected successfully

    this.poll()

    // // iterate over inputs, fetch latest values, write to cache
    // for (let input of this.inputs) {
    //   const subscription = this.subscribe(input)
    //   this.subscriptions.push(subscription)
    // }
  }

  async getClient() {
    console.log(`Modbus connecting to`, this.host, this.port)
    return new Promise((resolve, reject) => {
      const client = new ModbusRTU()
      client
        .connectTCP(this.host, { port: this.port })
        .then(() => resolve(client))
        .catch(error => reject(error))
    })
  }

  poll() {
    // // set the client's unit id
    // // set a timout for requests default is null (no timeout)
    // this.client.setID(1)
    // this.client.setTimeout(1000)
    console.log('Modbus poll')

    console.log('Modbus reading holding registers')
    this.client
      .readHoldingRegisters(5, 4)
      .then(d => console.log('Receive:', d.data))
      .catch(error => console.log(error.message))
  }

  // helper methods

  setValue(key, value) {
    const id = this.device.id + '-' + key
    this.cache.set(id, value)
  }
}

// helper fns

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
