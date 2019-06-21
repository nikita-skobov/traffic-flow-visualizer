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
        println!(
            "CHOOSE WHICH INTERFACE TO MONITOR: (enter a number [{} - {}])\n\n",
            0,
            num_interfaces - 1
        );

        for interface in &interfaces {
            let ip_str = interface
                .ips
                .iter()
                .map(|ip| format!("{} ", ip.to_string()))
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

pub fn pick_interface(interfaces: Vec<NetworkInterface>) -> NetworkInterface {
    let min_interface_index = 0;
    let max_interface_index = interfaces.len() as i32 - 1;
    println!(
        "CHOOSE WHICH INTERFACE TO MONITOR: (enter a number [{} - {}])\n\n",
        min_interface_index, max_interface_index
    );

    let mut input_number: i32 = -1;

    while input_number < min_interface_index || input_number > max_interface_index {
        let mut input_number_str = String::new();
        io::stdin()
            .read_line(&mut input_number_str)
            .expect("Failed to read from stdin");

        input_number_str = input_number_str.trim().to_string();
        input_number = match input_number_str.parse::<i32>() {
            Ok(i) => {
                if input_number < min_interface_index || input_number > max_interface_index {
                    println!(
                        "Please pick a number between {} and {}\n",
                        min_interface_index, max_interface_index
                    );
                }
                i
            }
            Err(..) => {
                println!("Error, {} is not a number\n", input_number_str);
                -1
            }
        };
    }

    interfaces[input_number as usize].clone()
}
