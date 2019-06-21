use ws::{listen, Handler, Sender, Result, Handshake, CloseCode, Error, Message};
use std::sync::Mutex;

use super::WSOUT;

struct Server {
  out: Sender,
}

static mut WS_COUNT: i32 = -1;

impl Handler for Server {
  fn on_open(&mut self, _: Handshake) -> Result<()> {
    ws_count(WS_COUNT_METHOD::Increment);
    Ok(())
  }

  fn on_close(&mut self, code: CloseCode, reason: &str) {
    ws_count(WS_COUNT_METHOD::Decrement);
  }

  fn on_message(&mut self, msg: Message) -> Result<()> {
    let wscount = get_ws_count();
    self.out.send(wscount.to_string())
  }

  fn on_error(&mut self, err: Error) {
    println!("Websocket server encountered an error: {:?}", err);
  }
}

pub enum WS_COUNT_METHOD {
  Get,
  Increment,
  Decrement,
}

pub fn get_ws_count() -> i32 {
  let wscount = match ws_count(WS_COUNT_METHOD::Get) {
    Some(i) => i,
    None => -1,
  };

  wscount
}

fn ws_count(method: WS_COUNT_METHOD) -> Option<i32> {
  match method {
    WS_COUNT_METHOD::Get => {
      let count = unsafe {
        WS_COUNT
      };
      Some(count)
    },
    WS_COUNT_METHOD::Increment => {
      unsafe {
        WS_COUNT += 1;
      }
      None
    },
    WS_COUNT_METHOD::Decrement => {
      unsafe {
        WS_COUNT -= 1;
      }
      None
    },
  }
}

pub fn start_websocket(port: &str) {
  let ip_and_port = format!("127.0.0.1:{}", port);
  listen(ip_and_port, |out| {
    let wscount = get_ws_count();
    if wscount == -1 {
      let mut wsout = WSOUT.lock().unwrap();
      match *wsout {
        Some(ref x) => println!("wsout already exists, skipping global mutex cloning"),
        None => {
          *wsout = Some(out.clone());
        },
      }
      std::mem::drop(wsout);

      // increment from -1 to 0.
      // this ensures we dont lock the WSOUT mutex
      // every time a client connects
      ws_count(WS_COUNT_METHOD::Increment);
    }

    Server {
      out: out,
    }
  })
  .unwrap();
}
