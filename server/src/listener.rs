// Most of this file is taken from https://github.com/libpnet/libpnet/blob/master/examples/packetdump.rs
// some modifications were made primarily:
// - only starts packet loop if a websocket server has active connections
// - handle_tcp_packet calls a broadcast method to broadcast packet info
//    to websocket clients
// below is the license from the original file:

// Copyright (c) 2014, 2015 Robert Clipsham <robert@octarineparrot.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use pnet::datalink::{self, NetworkInterface, Config, ChannelType};

use pnet::packet::arp::ArpPacket;
use pnet::packet::ethernet::{EtherTypes, EthernetPacket, MutableEthernetPacket};
use pnet::packet::icmp::{echo_reply, echo_request, IcmpPacket, IcmpTypes};
use pnet::packet::icmpv6::Icmpv6Packet;
use pnet::packet::ip::{IpNextHeaderProtocol, IpNextHeaderProtocols};
use pnet::packet::ipv4::Ipv4Packet;
use pnet::packet::ipv6::Ipv6Packet;
use pnet::packet::tcp::TcpPacket;
use pnet::packet::udp::UdpPacket;
use pnet::packet::Packet;
use pnet::util::MacAddr;
use ipnetwork::IpNetwork;

use std::net::IpAddr;
use std::thread;
use std::time::Duration;

use crate::websocket;
use crate::binary_message;

fn handle_udp_packet(interface_name: &str, ips: &Vec<IpNetwork>, source: IpAddr, destination: IpAddr, packet: &[u8]) {
    let udp = UdpPacket::new(packet);

    if let Some(udp) = udp {
        // println!(
        //     "[{}]: UDP Packet: {}:{} > {}:{}; length: {}",
        //     interface_name,
        //     source,
        //     udp.get_source(),
        //     destination,
        //     udp.get_destination(),
        //     udp.get_length()
        // );
    } else {
        // println!("[{}]: Malformed UDP Packet", interface_name);
    }
}

fn handle_icmp_packet(interface_name: &str, source: IpAddr, destination: IpAddr, packet: &[u8]) {
    let icmp_packet = IcmpPacket::new(packet);
    if let Some(icmp_packet) = icmp_packet {
        match icmp_packet.get_icmp_type() {
            IcmpTypes::EchoReply => {
                let echo_reply_packet = echo_reply::EchoReplyPacket::new(packet).unwrap();
                // println!(
                //     "[{}]: ICMP echo reply {} -> {} (seq={:?}, id={:?})",
                //     interface_name,
                //     source,
                //     destination,
                //     echo_reply_packet.get_sequence_number(),
                //     echo_reply_packet.get_identifier()
                // );
            }
            IcmpTypes::EchoRequest => {
                let echo_request_packet = echo_request::EchoRequestPacket::new(packet).unwrap();
                // println!(
                //     "[{}]: ICMP echo request {} -> {} (seq={:?}, id={:?})",
                //     interface_name,
                //     source,
                //     destination,
                //     echo_request_packet.get_sequence_number(),
                //     echo_request_packet.get_identifier()
                // );
            }
            _ => {
              // println!(
              //   "[{}]: ICMP packet {} -> {} (type={:?})",
              //   interface_name,
              //   source,
              //   destination,
              //   icmp_packet.get_icmp_type()
              // );
            },
        }
    } else {
        println!("[{}]: Malformed ICMP Packet", interface_name);
    }
}

fn handle_icmpv6_packet(interface_name: &str, source: IpAddr, destination: IpAddr, packet: &[u8]) {
    let icmpv6_packet = Icmpv6Packet::new(packet);
    if let Some(icmpv6_packet) = icmpv6_packet {
        // println!(
        //     "[{}]: ICMPv6 packet {} -> {} (type={:?})",
        //     interface_name,
        //     source,
        //     destination,
        //     icmpv6_packet.get_icmpv6_type()
        // )
    } else {
        // println!("[{}]: Malformed ICMPv6 Packet", interface_name);
    }
}

fn handle_tcp_packet(interface_name: &str, ips: &Vec<IpNetwork>, source: IpAddr, destination: IpAddr, packet: &[u8]) {
    let tcp = TcpPacket::new(packet);
    if let Some(tcp) = tcp {

        let mut is_received = true;
        let mut external_ip = source;
        for ip in ips {
          // ips is a vector of ip networks (most network interfaces
          // only have one CIDR block). if the ip address of the ip network
          // matches the source address then the external ip is the destination
          // and this packet is being transmitted by us, therefore is not received
          if ip.ip() == source {
            external_ip = destination;
            is_received = false;
            break;
          }
        }

        let message = match external_ip {
          IpAddr::V4(ip4) => binary_message::make_message(true, is_received, &ip4.octets(), packet.len() as u16),
          IpAddr::V6(ip6) => binary_message::make_message(false, is_received, &ip6.octets(), packet.len() as u16),
        };

        websocket::broadcast(&message[..]);
        // println!(
        //     "[{}]: TCP Packet: {}:{} > {}:{}; length: {}, seq: {}, flags: {}",
        //     interface_name,
        //     source,
        //     tcp.get_source(),
        //     destination,
        //     tcp.get_destination(),
        //     packet.len(),
        //     tcp.get_sequence(),
        //     tcp.get_flags()
        // );
    } else {
        // println!("[{}]: Malformed TCP Packet", interface_name);
    }
}

fn handle_transport_protocol(
    interface_name: &str,
    ips: &Vec<IpNetwork>,
    source: IpAddr,
    destination: IpAddr,
    protocol: IpNextHeaderProtocol,
    packet: &[u8],
) {
    match protocol {
        IpNextHeaderProtocols::Udp => {
            handle_udp_packet(interface_name, ips, source, destination, packet)
        }
        IpNextHeaderProtocols::Tcp => {
            handle_tcp_packet(interface_name, ips, source, destination, packet)
        }
        IpNextHeaderProtocols::Icmp => {
            handle_icmp_packet(interface_name, source, destination, packet)
        }
        IpNextHeaderProtocols::Icmpv6 => {
            handle_icmpv6_packet(interface_name, source, destination, packet)
        }
        _ => {
          // println!(
          //   "[{}]: Unknown {} packet: {} > {}; protocol: {:?} length: {}",
          //   interface_name,
          //   match source {
          //       IpAddr::V4(..) => "IPv4",
          //       _ => "IPv6",
          //   },
          //   source,
          //   destination,
          //   protocol,
          //   packet.len()
          // );
        },
    }
}

fn handle_ipv4_packet(interface_name: &str, ips: &Vec<IpNetwork>, ethernet: &EthernetPacket) {
    let header = Ipv4Packet::new(ethernet.payload());
    if let Some(header) = header {
        handle_transport_protocol(
            interface_name,
            ips,
            IpAddr::V4(header.get_source()),
            IpAddr::V4(header.get_destination()),
            header.get_next_level_protocol(),
            header.payload(),
        );
    } else {
        // println!("[{}]: Malformed IPv4 Packet", interface_name);
    }
}

fn handle_ipv6_packet(interface_name: &str, ips: &Vec<IpNetwork>, ethernet: &EthernetPacket) {
    let header = Ipv6Packet::new(ethernet.payload());
    if let Some(header) = header {
        handle_transport_protocol(
            interface_name,
            ips,
            IpAddr::V6(header.get_source()),
            IpAddr::V6(header.get_destination()),
            header.get_next_header(),
            header.payload(),
        );
    } else {
        // println!("[{}]: Malformed IPv6 Packet", interface_name);
    }
}

fn handle_arp_packet(interface_name: &str, ethernet: &EthernetPacket) {
    let header = ArpPacket::new(ethernet.payload());
    if let Some(header) = header {
        // println!(
        //     "[{}]: ARP packet: {}({}) > {}({}); operation: {:?}",
        //     interface_name,
        //     ethernet.get_source(),
        //     header.get_sender_proto_addr(),
        //     ethernet.get_destination(),
        //     header.get_target_proto_addr(),
        //     header.get_operation()
        // );
    } else {
        // println!("[{}]: Malformed ARP Packet", interface_name);
    }
}

fn handle_ethernet_frame(interface: &NetworkInterface, ips: &Vec<IpNetwork>, ethernet: &EthernetPacket) {
    let interface_name = &interface.name[..];
    match ethernet.get_ethertype() {
        EtherTypes::Ipv4 => handle_ipv4_packet(interface_name, ips, ethernet),
        EtherTypes::Ipv6 => handle_ipv6_packet(interface_name, ips, ethernet),
        EtherTypes::Arp => handle_arp_packet(interface_name, ethernet),
        _ => {
          // println!(
          //   "[{}]: Unknown packet: {} > {}; ethertype: {:?} length: {}",
          //   interface_name,
          //   ethernet.get_source(),
          //   ethernet.get_destination(),
          //   ethernet.get_ethertype(),
          //   ethernet.packet().len()
          // );
        },
    }
}

pub fn listen_to(
  interface: NetworkInterface,
  always_on: bool,
) {
    use pnet::datalink::Channel::Ethernet;

    let interface_ips = interface.ips.clone();

    if !always_on {
      // in this case, wait until a user is connected
      // to the websocket server, and then begin the intensive network listening.
      // otherwise, simply check if a user is connected once every 3 seconds
      // so as to not use too much CPU.
      loop {
        let connected_users = websocket::get_ws_count();
        if (connected_users > 0) {
          break;
        }
        thread::sleep(Duration::from_millis(3000));
      }
    }

    let custom_config = if cfg!(target_family = "windows") {
      Config {
        read_buffer_size: 32768 * 2,
        write_buffer_size: 32768 * 2,
        read_timeout: None, // linux only
        write_timeout: None, // linux only
        bpf_fd_attempts: 1000, // linux only
        linux_fanout: None, // linux only
        channel_type: ChannelType::Layer2,
      }
    } else {
      Default::default()
    };

    // Create a channel to receive on
    let (_, mut rx) = match datalink::channel(&interface, custom_config) {
        Ok(Ethernet(tx, rx)) => (tx, rx),
        Ok(_) => panic!("packetdump: unhandled channel type: {}"),
        Err(e) => panic!("packetdump: unable to create channel: {}", e),
    };

    loop {
        let mut buf: [u8; 1600] = [0u8; 1600];
        let mut fake_ethernet_frame = MutableEthernetPacket::new(&mut buf[..]).unwrap();
        match rx.next() {
            Ok(packet) => {
                if cfg!(target_os = "macos") && interface.is_up() && !interface.is_broadcast()
                    && !interface.is_loopback() && interface.is_point_to_point()
                {
                    // Maybe is TUN interface
                    let version = Ipv4Packet::new(&packet).unwrap().get_version();
                    if version == 4 {
                        fake_ethernet_frame.set_destination(MacAddr(0, 0, 0, 0, 0, 0));
                        fake_ethernet_frame.set_source(MacAddr(0, 0, 0, 0, 0, 0));
                        fake_ethernet_frame.set_ethertype(EtherTypes::Ipv4);
                        fake_ethernet_frame.set_payload(&packet);
                        handle_ethernet_frame(&interface, &interface_ips, &fake_ethernet_frame.to_immutable());
                        continue;
                    } else if version == 6 {
                        fake_ethernet_frame.set_destination(MacAddr(0, 0, 0, 0, 0, 0));
                        fake_ethernet_frame.set_source(MacAddr(0, 0, 0, 0, 0, 0));
                        fake_ethernet_frame.set_ethertype(EtherTypes::Ipv6);
                        fake_ethernet_frame.set_payload(&packet);
                        handle_ethernet_frame(&interface, &interface_ips, &fake_ethernet_frame.to_immutable());
                        continue;
                    }
                }
                handle_ethernet_frame(&interface, &interface_ips, &EthernetPacket::new(packet).unwrap());
            }
            Err(e) => panic!("packetdump: unable to receive packet: {}", e),
        }
    }
}

