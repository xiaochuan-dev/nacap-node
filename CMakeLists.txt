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

if(UNIX AND NOT APPLE)
    # 首先尝试使用vcpkg安装的libpcap
    find_library(VCPKG_PCAP_LIB pcap
        PATHS "${CMAKE_CURRENT_BINARY_DIR}/vcpkg_installed/x64-linux/lib"
        NO_DEFAULT_PATH
    )
    
    if(VCPKG_PCAP_LIB)
        message(STATUS "Found vcpkg libpcap: ${VCPKG_PCAP_LIB}")
        target_link_libraries(${PROJECT_NAME} PRIVATE ${VCPKG_PCAP_LIB})
        
        # 添加vcpkg的包含目录
        target_include_directories(${PROJECT_NAME} PRIVATE
            "${CMAKE_CURRENT_BINARY_DIR}/vcpkg_installed/x64-linux/include"
        )
    else()
        # 如果vcpkg没有找到，回退到系统pkg-config
        message(STATUS "Using system libpcap via pkg-config")
        find_package(PkgConfig REQUIRED)
        pkg_check_modules(PCAP REQUIRED libpcap)
        message(STATUS "Found libpcap: ${PCAP_LIBRARIES}")
        message(STATUS "libpcap include dirs: ${PCAP_INCLUDE_DIRS}")

        if(PCAP_LIBRARIES)
            target_link_libraries(${PROJECT_NAME} PRIVATE ${PCAP_LIBRARIES})
        endif()
    endif()

elseif(APPLE)
    find_library(PCAP_LIBRARIES pcap)
    find_path(PCAP_INCLUDE_DIRS pcap.h PATH_SUFFIXES pcap)
elseif(WIN32)
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
