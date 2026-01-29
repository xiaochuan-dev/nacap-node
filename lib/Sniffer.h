#pragma once

#include <napi.h>
#include <optional>
#include <thread>
#include <atomic>
#include <pcap.h>

class Sniffer : public Napi::ObjectWrap<Sniffer>
{
private:
    pcap_t *handle;
    std::thread *thread;
    std::atomic<bool> running;
    Napi::ThreadSafeFunction tsfn;

    std::optional<std::string> curDevname;

    Napi::ObjectReference selfRef;
    
    static Napi::FunctionReference constructor;
    static Napi::Value getAllDevs(const Napi::CallbackInfo &);
    void captureLoop();

public:
    static Napi::Object Init(Napi::Env, Napi::Object);

    Sniffer(const Napi::CallbackInfo &);
    ~Sniffer();

    Napi::Value GetCurDevname(const Napi::CallbackInfo &);
    void SetCurDevname(const Napi::CallbackInfo &);

    Napi::Value GetRunning(const Napi::CallbackInfo &);

    void startCapture(const Napi::CallbackInfo &);
    void stopCapture(const Napi::CallbackInfo &);
};
