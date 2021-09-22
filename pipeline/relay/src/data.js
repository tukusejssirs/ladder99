// data
// wraps agent data returned from probe, current, and sample endpoints

export class Data {
  type = null // will be probe|current|sample

  constructor() {
    this.json = null
    this.errors = null
    this.header = null
    this.instanceId = null
  }

  // read xml from endpoint, convert to json, store in .json,
  // and parse out .header, .instanceId, .sequence info from it.
  async read(endpoint, from, count) {
    console.log(`Read ${endpoint.baseUrl}, ${from}, ${count}`)
    this.json = await endpoint.fetchJson(this.type, from, count)
    this.parseHeader()
  }

  // get errors, header, and instanceId from json
  parseHeader() {
    console.log(`Parse header...`)

    //. handle errors as needed
    // eg <Errors><Error errorCode="OUT_OF_RANGE">'from' must be greater than 647331</Error></Errors>
    if (this.json.MTConnectError) {
      this.errors = this.json.MTConnectError.Errors.map(e => e.Error.errorCode)
      throw new Error(JSON.stringify(this.errors))
    }

    // get header for probe, current, or sample xmls
    this.header = this.json.MTConnectDevices
      ? this.json.MTConnectDevices.Header._attributes
      : this.json.MTConnectStreams.Header._attributes
    // console.log('header', this.header)

    // get instanceId
    this.instanceId = this.header.instanceId

    // get sequence info for current/sample endpoints
    if (this.json.MTConnectStreams) {
      this.sequence = {
        first: this.header.firstSequence,
        next: this.header.nextSequence,
        last: this.header.lastSequence,
      }
    }
  }
}
