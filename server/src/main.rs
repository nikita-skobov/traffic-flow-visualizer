use pnet::datalink;

mod interfaces;

fn main() {
    // possible command line options:
    // -i --interface (enter the name of the interface)
    // -wp --websocket-port (port of websocket)
    // -sp --static-port (port of static web server)
    // -d --delay (in milliseconds, how much to delay the main loop by. to prevent too much cpu usage)
    // -ao --always-on (by default, should only run the main loop if someone is connected to the websocket server, ao cancels this out)


    // show user list of interfaces
    let interface_vec = match interfaces::show_interfaces() {
      Some(i) => i,
      None => {
        println!("No interfaces found");
        std::process::exit(1);
      },
    };

    // ask user to pick one by entering the number in the console
    let interface = interfaces::pick_interface(interface_vec);


    // start webserver, and websocket server

    // start 
    // let interfaces = datalink::interfaces();
    // println!("INTERFACE #0: {:?}", interfaces[0]);
    // for interface in datalink::interfaces() {
    //     println!("{}", interface.name);
    // }
}
