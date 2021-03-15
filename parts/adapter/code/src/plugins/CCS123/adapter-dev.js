// adapter plugin code
// derived from parts/devices/definitions/ccs-pa and instances/CCS123.yaml etc

//. this is experimental for development

const topics = {
  sendQuery: 'l99/${serialNumber}/cmd/query',
  receiveQuery: 'l99/${serialNumber}/evt/query',
  receiveStatus: 'l99/${serialNumber}/evt/status',
  receiveRead: 'l99/${serialNumber}/evt/read',
}

// initialize the client plugin.
// queries the device for address space definitions, subscribes to topics.
export function init(mqtt, cache, serialNumber) {
  // add serialNumber to topics
  for (const k of Object.keys(topics)) {
    topics[k] = topics[k].replace('${serialNumber}', serialNumber)
  }

  mqtt.subscribe(topics.receiveQuery, onQueryResult)
  mqtt.send(topics.sendQuery, '{}')

  function onQueryResult(topic, payload) {
    mqtt.unsubscribe(topics.receiveQuery, onQueryResult)
    const obj = unpack(topic, payload)
    cache.save(obj)

    // best to subscribe to topics at this point,
    // in case status or read messages come in BEFORE query results are delivered,
    // which would clobber these values.
    mqtt.subscribe(topics.receiveStatus, onStatusMessage)
    mqtt.subscribe(topics.receiveRead, onReadMessage)
  }

  function onStatusMessage(topic, payload) {
    const obj = unpack(topic, payload)
    cache.save(obj)
  }

  function onReadMessage(topic, payload) {
    const obj = unpack(topic, payload)
    cache.save(obj)
  }
}

// unpack a message payload byte buffer and append some metadata.
function unpack(topic, payloadBuffer) {
  let data = JSON.parse(payloadBuffer.toString())
  if (!Array.isArray(data)) {
    data = [data]
  }
  const received = new Date()
  const obj = { topic, data, received }
  return obj
}
