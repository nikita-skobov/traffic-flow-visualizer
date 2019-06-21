use std::thread;
use std::sync::Mutex;
use std::time::Duration;


use pnet::datalink;

mod interfaces;
mod websocket;
mod listener;

#[macro_use]
extern crate lazy_static;

lazy_static! {
  pub static ref WSOUT: Mutex<Option<ws::Sender>> = Mutex::new(None);
}


fn main() {
    let default_websocket_port = "3012";
    let default_delay: Option<i32> = None;
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
        }
    };

    // ask user to pick one by entering the number in the console
    let interface = interfaces::pick_interface(interface_vec);

    // start webserver, and websocket server
    let socket_handle = thread::spawn(move || {
      websocket::start_websocket(default_websocket_port);
    });
    // let server_handle = thread::spawn(|| {
        
    // });

    // begin listening
    listener::listen_to(interface);
}
