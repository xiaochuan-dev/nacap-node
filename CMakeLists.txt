cmake_minimum_required(VERSION 3.10)
project(nacap-napi-module LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(${PROJECT_NAME} MODULE
    lib/init.cpp
    lib/Sniffer.cpp
)

target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/lib)

set_target_properties(${PROJECT_NAME} PROPERTIES
    PREFIX ""
    SUFFIX ".node"
    OUTPUT_NAME "${PROJECT_NAME}"
)
if(WIN32)
    add_definitions(-D_WINDLL)
    set_target_properties(${PROJECT_NAME} PROPERTIES
        WINDOWS_EXPORT_ALL_SYMBOLS OFF
        CXX_VISIBILITY_PRESET hidden
        VISIBILITY_INLINES_HIDDEN ON
    )
    target_include_directories(${PROJECT_NAME} PRIVATE NpcapSDK/Include)
    target_link_libraries(${PROJECT_NAME}
    PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/NpcapSDK/Lib/x64/wpcap.lib"
    "${CMAKE_CURRENT_SOURCE_DIR}/NpcapSDK/Lib/x64/Packet.lib"
    ws2_32
)
endif()


find_package(unofficial-node-addon-api CONFIG REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE unofficial::node-addon-api::node-addon-api)
