extern crate pnet;

use pnet::datalink;

fn main() {
    for interface in datalink::interfaces() {
        println!("{}", interface.name);
    }
}
