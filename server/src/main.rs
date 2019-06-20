use pnet::datalink;
use std::io;

fn main() {
    // possible command line options:
    // -i --interface (enter the name of the interface)
    // -wp --websocket-port (port of websocket)
    // -sp --static-port (port of static web server)
    // -d --delay (in milliseconds, how much to delay the main loop by. to prevent too much cpu usage)
    // -ao --always-on (by default, should only run the main loop if someone is connected to the websocket server, ao cancels this out)



    // show user list of interfaces
    // ask user to pick one by entering the number in the console
    let interfaces = datalink::interfaces();
    let min_interface_index = 0;
    let max_interface_index = interfaces.len() as i32 - 1;
    println!("CHOOSE WHICH INTERFACE TO MONITOR: (enter a number [{} - {}])\n\n",
      min_interface_index,
      max_interface_index);

    let mut input_number: i32 = -1;

    while input_number < min_interface_index || input_number > max_interface_index {
      let mut input_number_str = String::new();
      io::stdin()
        .read_line(&mut input_number_str)
        .expect("Failed to read from stdin");
      
      input_number_str = input_number_str.trim().to_string();
      input_number = match input_number_str.parse::<i32>() {
        Ok(i) => i,
        Err(..) => {
          println!("Error, {} is not a number\n", input_number_str);
          -1
        },
      };

      if (input_number < min_interface_index || input_number > max_interface_index) {
        println!("Please pick a number between {} and {}\n", min_interface_index, max_interface_index);
      }
    }



    // start webserver, and websocket server

    // start 
    let interfaces = datalink::interfaces();
    println!("INTERFACE #0: {:?}", interfaces[0]);
    // for interface in datalink::interfaces() {
    //     println!("{}", interface.name);
    // }
}
