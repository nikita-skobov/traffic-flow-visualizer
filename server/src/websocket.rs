use ws::listen;
use std::sync::Mutex;

use super::WSOUT;

pub fn start_websocket() {
  listen("127.0.0.1:3012", |out| {
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
