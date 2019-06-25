export function isIPV6(msg) {
  const ipv6Bit = 0b00000010
  const [metabyte] = msg
  // eslint-disable-next-line
  return (metabyte & ipv6Bit) === ipv6Bit
}

export function isReceived(msg) {
  const receivedBit = 0b00000001
  const [metabyte] = msg
  // eslint-disable-next-line
  return (metabyte & receivedBit) === receivedBit
}

// this function was stolen from:
// https://stackoverflow.com/questions/34309988/byte-array-to-hex-string-conversion-in-javascript
// thanks Putzi San :)
function byteToHex(byte) {
  // convert the possibly signed byte (-128 to 127) to an unsigned byte (0 to 255).
  // if you know, that you only deal with unsigned bytes (Uint8Array), you can omit this line
  // eslint-disable-next-line
  const unsignedByte = byte & 0xff

  // If the number can be represented with only 4 bits (0-15),
  // the hexadecimal representation of this number is only one char (0-9, a-f).
  if (unsignedByte < 16) {
    return `0${unsignedByte.toString(16)}`
  }

  return unsignedByte.toString(16)
}

export function getLength(msg) {
  const [, higherOrderByte, lowerOrderByte] = msg

  // convert two Uint8s into a Uint16
  // example:           5,  76
  // in binary: [0000 0101], [0100 1100]
  // 5 << 8 === [0000 0101 0000 0000] (shift 8 bits to the left, fill with 0s)
  // (5 << 8) | 76 === [0000 0101 0100 1100] === 1356
  // ie: (take the shifted value, and fill the right side with the lowerOrderByte)

  // eslint-disable-next-line
  return (higherOrderByte << 8) | lowerOrderByte
}

export function getExternalIP(msg) {
  const isIPV4 = !isIPV6(msg)

  if (isIPV4) {
    const [, , , oct1, oct2, oct3, oct4] = msg
    return `${oct1}.${oct2}.${oct3}.${oct4}`
  }

  // otherwise construct ipv6 in the form:
  // 2001:0db8:85a3:0000:0000:8a2e:0370:7334 (as an example)
  // there are 8 hextets, each hextet is made up of 2 octets
  // so 2001 has 2 octets: 20, and 01 both represented in hex.
  // the message sends 16 octets, and we must construct the 16
  // octets into hextets and string them together.
  // if the message has 2001 as the first hextet, then the
  // message would have the first byte be: 32, and 2nd byte: 1
  // byteToHex(32) == '20' and byteToHex(1) == '01'
  const [, , ,
    hex1Higher, hex1Lower,
    hex2Higher, hex2Lower,
    hex3Higher, hex3Lower,
    hex4Higher, hex4Lower,
    hex5Higher, hex5Lower,
    hex6Higher, hex6Lower,
    hex7Higher, hex7Lower,
    hex8Higher, hex8Lower,
  ] = msg

  const hex1 = `${byteToHex(hex1Higher)}${byteToHex(hex1Lower)}`
  const hex2 = `${byteToHex(hex2Higher)}${byteToHex(hex2Lower)}`
  const hex3 = `${byteToHex(hex3Higher)}${byteToHex(hex3Lower)}`
  const hex4 = `${byteToHex(hex4Higher)}${byteToHex(hex4Lower)}`
  const hex5 = `${byteToHex(hex5Higher)}${byteToHex(hex5Lower)}`
  const hex6 = `${byteToHex(hex6Higher)}${byteToHex(hex6Lower)}`
  const hex7 = `${byteToHex(hex7Higher)}${byteToHex(hex7Lower)}`
  const hex8 = `${byteToHex(hex8Higher)}${byteToHex(hex8Lower)}`

  return `${hex1}:${hex2}:${hex3}:${hex4}:${hex5}:${hex6}:${hex7}:${hex8}`
}
