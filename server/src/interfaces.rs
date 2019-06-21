use pnet::datalink;
use pnet::datalink::NetworkInterface;

use std::io;

pub fn show_interfaces() -> Option<Vec<NetworkInterface>> {
  let interfaces = datalink::interfaces();
  let mut index = 0;

  let num_interfaces = interfaces.len();
  if num_interfaces == 0 {
    None
  } else {
    println!("CHOOSE WHICH INTERFACE TO MONITOR: (enter a number [{} - {}])\n\n",
      0,
      num_interfaces - 1);

    for interface in &interfaces {
      let ip_str = interface.ips
        .iter()
        .map(|ip| {
          format!("{} ", ip.to_string())
        })
        .collect::<String>();
      
      println!("[{}]", index);
      println!("NAME: {}", interface.name);
      println!("MAC: {:?}", interface.mac_address());
      println!("IP(s): {}", ip_str);
      println!("FLAGS: {}\n", interface.flags);

      index += 1;
    }

    Some(interfaces)
  }
}
