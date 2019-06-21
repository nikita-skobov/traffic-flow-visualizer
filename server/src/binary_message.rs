use std::net::IpAddr;

pub fn make_message(
  is_ipv4: bool, // otherwise its ipv6
  is_received: bool, // otherwise this packet was transmitted
  external_ip: &[u8],
  length: u16,
) -> Vec<u8> {
  let mut meta_byte: u8 = 0b0000_0000;
  if !is_ipv4 {
    meta_byte |= 0b0000_0010; // set 2nd LSB.
    // indicates to client this is an ipv6 external ip
  }

  if !is_received {
    meta_byte |= 0b0000_0001; // set LSB.
    // indicates to client this packet originated
    // by us and transmitted to external ip,
    // rather than being transmitted from the external ip to us.
  }

  // length is the length (in bytes) of the packet.
  // it can be greater than 255, so we must represent it as u16
  // tcp max packet size is 65535 bytes which is max u16
  // however most packets dont reach that size, but it is common
  // to see packet sizes of 500 - 1000 bytes.
  let upper_length_byte = (length >> 8) as u8;
  let lower_length_byte = length as u8;

  let mut message = vec![meta_byte, upper_length_byte, lower_length_byte];

  for i in external_ip {
    message.push(i.clone());
  }

  message
}

#[cfg(test)]
mod tests {
  #[test]
  fn length_byte_splitting_works() {
    let length = 257;
    // in binary 257 is: 0000 0001 0000 0001
    let my_message = super::make_message(false, false, &[0], length);
    assert_eq!(my_message[1], 1);
    assert_eq!(my_message[2], 1);

    let length = 1;
    // in binary 1 is: 0000 0000 0000 0001
    let my_message = super::make_message(false, false, &[0], length);
    assert_eq!(my_message[1], 0);
    assert_eq!(my_message[2], 1);

    let length = 256;
    // in binary 1 is: 0000 0001 0000 0000
    let my_message = super::make_message(false, false, &[0], length);
    assert_eq!(my_message[1], 1);
    assert_eq!(my_message[2], 0);

    let length = 0;
    // in binary 0 is: 0000 0000 0000 0000
    let my_message = super::make_message(false, false, &[0], length);
    assert_eq!(my_message[1], 0);
    assert_eq!(my_message[2], 0);

    let length = 1400;
    // in binary 1400 is: 0000 0101 0111 1000
    let my_message = super::make_message(false, false, &[0], length);
    assert_eq!(my_message[1], 5);
    assert_eq!(my_message[2], 120);
  }

  #[test]
  fn meta_byte_works() {
    let is_ipv4 = true;
    let is_received = true;
    let my_message = super::make_message(is_ipv4, is_received, &[0], 0);
    
    // is_ipv4 affects 2nd LSB, is_received affects LSB.
    // if ipv4 false, 2nd LSB is 1,
    // if received false, LSB is 1
    // expected: 0000
    
    assert_eq!(my_message[0], 0);

    let is_ipv4 = false;
    let my_message = super::make_message(is_ipv4, is_received, &[0], 0);
    // expected: 0010
    assert_eq!(my_message[0], 2);

    let is_received = false;
    let my_message = super::make_message(is_ipv4, is_received, &[0], 0);
    // expected: 0011
    assert_eq!(my_message[0], 3);

    let is_received = false;
    let is_ipv4 = true;
    let my_message = super::make_message(is_ipv4, is_received, &[0], 0);
    // expected: 0001
    assert_eq!(my_message[0], 1);
  }

  #[test]
  fn works_with_ipv4() {
    use std::net::Ipv4Addr;
    let ipv4 = Ipv4Addr::new(127, 0, 0, 1);
    let my_message = super::make_message(true, true, &ipv4.octets(), 0);
    // expected my_message: 0, 0, 0, 127, 0, 0, 1,

    assert_eq!(my_message.len(), 7);
    assert_eq!(my_message[3], 127);
  }

  #[test]
  fn works_with_ipv6() {
    use std::net::Ipv6Addr;
    let ipv6 = Ipv6Addr::new(0xff01, 9, 9, 9, 9, 9, 9, 9);
    let my_message = super::make_message(true, true, &ipv6.octets(), 0);
    // expected my_message: 0, 0, 0,
    // 255, 1, 0, 9,
    // 0, 9, 0, 9
    // 0, 9, 0, 9
    // 0, 9, 0, 9

    assert_eq!(my_message.len(), 19);
    assert_eq!(my_message[3], 255);
    assert_eq!(my_message[4], 1);
    assert_eq!(my_message[5], 0);
    assert_eq!(my_message[6], 9);
  }
}