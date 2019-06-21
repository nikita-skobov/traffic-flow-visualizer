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

  if is_received {
    meta_byte |= 0b0000_0001; // set LSB.
    // indicates to client this packet originated
    // externally and transmitted to us, rather than
    // being originated by us and transmitted to the external ip.
  }

  let upper_length_byte = (length >> 8) as u8;
  // the 
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
}