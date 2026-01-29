#pragma once

#include <pcap.h>

struct PacketData {
    int length;
    u_char* data;
};