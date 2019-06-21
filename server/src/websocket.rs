use ws::listen;
use std::sync::Mutex;

use super::WSOUT;

pub fn start_websocket(port: &str) {
  let ip_and_port = format!("127.0.0.1:{}", port);
  listen(ip_and_port, |out| {
    let mut wsout = WSOUT.lock().unwrap();
    match *wsout {
      Some(ref x) => println!("wsout already exists, skipping global mutex cloning"),
      None => {
        *wsout = Some(out.clone());
      },
    }
    std::mem::drop(wsout);

    move |msg| out.send(msg)
  })
  .unwrap();
}
