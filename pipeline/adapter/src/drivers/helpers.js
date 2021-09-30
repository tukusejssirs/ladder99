const getMacros = prefix => ({
  // replace all occurrences of msg('foo') with $['foo'].
  addr: {
    syntax: /msg\('(.*?)'\)/gm, // eg msg('foo')
    // transform: `$['$1']`, // $1 is the matched substring
    // transform: `part => ($[part] || {}).default`,
    transform: `($['$1'] || {}).default`,
    extract: /\$\['(.*?)'\]/gm, // eg $['foo']
  },
  // replace all occurrences of <foo> with cache.get('pr1-foo').
  cache: {
    syntax: /(<(.*?)>)/gm, // eg <foo>
    transform: `cache.get('${prefix}$2')`, // $2 is the matched substring
    extract: /cache\.get\('(.*?)'\)/gm, // eg cache.get('foo')
  },
})

// find all references in the given code
// eg precompile(`msg('foo') + <bar>`, macros)
// returns {
//   code: `$['foo'] + <bar>`,
//   refs: new Set(['foo']),
// }
export function precompile(code, macros) {
  let js = code
  let refs = {}
  for (let macroName of Object.keys(macros)) {
    const macro = macros[macroName]
    macro.key = macroName

    // note: .*? is a non-greedy match, so doesn't eat other occurrences also.
    // note: replaceAll needs node15
    js = js.replace(macro.syntax, macro.transform)

    // get list of message addrs or cache keys the code references.
    // need to get AFTER transforms, because user could specify this manually also.
    refs[macroName] = new Set()
    let match
    while ((match = macro.extract.exec(js)) !== null) {
      const key = match[1]
      refs[macroName].add(key)
    }
  }
  return { js, refs }
}

export function compile(code, prefix) {
  const macros = getMacros(prefix)
  const res = precompile(code, macros)
  return res
}

export function compileInputs(inputs, prefix) {
  const maps = {}
  for (let [key, code] of Object.entries(inputs)) {
    const { js, refs } = compile(code, prefix)
    console.log(key)
    console.log(code)
    console.log(js)
    console.log(refs)
    console.log()
    addToMaps(maps, refs)
  }
  return maps
}

export function addToMaps(maps, refs) {
  for (let macroKey of Object.keys(refs)) {
    const refset = refs[macroKey] // set{'%Z61.0'}
    for (let ref of refset) {
      if (maps[macroKey]) {
        maps[macroKey].add(ref)
      } else {
        maps[macroKey] = new Set([ref])
      }
    }
  }
}