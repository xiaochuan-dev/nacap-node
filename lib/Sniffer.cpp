#include "Sniffer.h"
#include "PacketData.h"

static char errbuf[PCAP_ERRBUF_SIZE];

Napi::FunctionReference Sniffer::constructor;

Sniffer::Sniffer(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Sniffer>(info),
      handle(nullptr),
      thread(nullptr),
      running(false),
      tsfn()
{
  auto env = info.Env();
  if (info.Length() == 1)
  {
    curDevname = info[0].As<Napi::String>().ToString().Utf8Value();
  }
}

Sniffer::~Sniffer()
{
  if (running)
  {
    running = false;
    running = false;
  }
  if (thread && thread->joinable())
  {
    thread->join();
    delete thread;
    thread = nullptr;
  }

  if (handle)
  {
    pcap_close(handle);
    handle = nullptr;
  }
  if (!selfRef.IsEmpty())
  {
    selfRef.Reset();
  }
}

Napi::Value Sniffer::getAllDevs(const Napi::CallbackInfo &info)
{
  auto env = info.Env();

  pcap_if_t *alldevs;
  if (pcap_findalldevs(&alldevs, errbuf) == -1)
  {
    Napi::Error::New(env, "not found devs").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  auto deviceArray = Napi::Array::New(env);
  uint32_t index = 0;
  auto dev = alldevs;

  while (dev != nullptr)
  {
    auto deviceObj = Napi::Object::New(env);
    if (dev->name != nullptr)
      deviceObj.Set("name", Napi::String::New(env, dev->name));
    else
      deviceObj.Set("name", env.Null());

    if (dev->description != nullptr)
      deviceObj.Set("description", Napi::String::New(env, dev->description));
    else
      deviceObj.Set("description", env.Null());

    if (dev->addresses != nullptr)
    {
      auto addressArray = Napi::Array::New(env);
      uint32_t addrIndex = 0;
      pcap_addr_t *addr = dev->addresses;

      while (addr != nullptr)
      {
        auto addressObj = Napi::Object::New(env);

        if (addr->addr != nullptr)
        {
          char ip[INET6_ADDRSTRLEN];
          if (addr->addr->sa_family == AF_INET)
          {
            auto sa = reinterpret_cast<struct sockaddr_in *>(addr->addr);
            inet_ntop(AF_INET, &(sa->sin_addr), ip, sizeof(ip));
            addressObj.Set("address", Napi::String::New(env, ip));
            addressObj.Set("family", Napi::String::New(env, "IPv4"));
          }
          else if (addr->addr->sa_family == AF_INET6)
          {
            auto sa = reinterpret_cast<struct sockaddr_in6 *>(addr->addr);
            inet_ntop(AF_INET6, &(sa->sin6_addr), ip, sizeof(ip));
            addressObj.Set("address", Napi::String::New(env, ip));
            addressObj.Set("family", Napi::String::New(env, "IPv6"));
          }
          else
          {
            addressObj.Set("address", env.Null());
            addressObj.Set("family", env.Null());
          }
        }
        else
        {
          addressObj.Set("address", env.Null());
          addressObj.Set("family", env.Null());
        }

        if (addr->netmask != nullptr)
        {
          char mask[INET6_ADDRSTRLEN];
          if (addr->netmask->sa_family == AF_INET)
          {
            auto sa = reinterpret_cast<struct sockaddr_in *>(addr->netmask);
            inet_ntop(AF_INET, &(sa->sin_addr), mask, sizeof(mask));
            addressObj.Set("netmask", Napi::String::New(env, mask));
          }
          else if (addr->netmask->sa_family == AF_INET6)
          {
            auto sa = reinterpret_cast<struct sockaddr_in6 *>(addr->netmask);
            inet_ntop(AF_INET6, &(sa->sin6_addr), mask, sizeof(mask));
            addressObj.Set("netmask", Napi::String::New(env, mask));
          }
          else
          {
            addressObj.Set("netmask", env.Null());
          }
        }
        else
        {
          addressObj.Set("netmask", env.Null());
        }

        if (addr->broadaddr != nullptr)
        {
          char broadcast[INET6_ADDRSTRLEN];
          if (addr->broadaddr->sa_family == AF_INET)
          {
            auto sa = reinterpret_cast<struct sockaddr_in *>(addr->broadaddr);
            inet_ntop(AF_INET, &(sa->sin_addr), broadcast, sizeof(broadcast));
            addressObj.Set("broadcast", Napi::String::New(env, broadcast));
          }
          else if (addr->broadaddr->sa_family == AF_INET6)
          {
            auto sa = reinterpret_cast<struct sockaddr_in6 *>(addr->broadaddr);
            inet_ntop(AF_INET6, &(sa->sin6_addr), broadcast, sizeof(broadcast));
            addressObj.Set("broadcast", Napi::String::New(env, broadcast));
          }
          else
          {
            addressObj.Set("broadcast", env.Null());
          }
        }
        else
        {
          addressObj.Set("broadcast", env.Null());
        }

        if (addr->dstaddr != nullptr)
        {
          char dst[INET6_ADDRSTRLEN];
          if (addr->dstaddr->sa_family == AF_INET)
          {
            auto sa = reinterpret_cast<struct sockaddr_in *>(addr->dstaddr);
            inet_ntop(AF_INET, &(sa->sin_addr), dst, sizeof(dst));
            addressObj.Set("dstaddr", Napi::String::New(env, dst));
          }
          else if (addr->dstaddr->sa_family == AF_INET6)
          {
            auto sa = reinterpret_cast<struct sockaddr_in6 *>(addr->dstaddr);
            inet_ntop(AF_INET6, &(sa->sin6_addr), dst, sizeof(dst));
            addressObj.Set("dstaddr", Napi::String::New(env, dst));
          }
          else
          {
            addressObj.Set("dstaddr", env.Null());
          }
        }
        else
        {
          addressObj.Set("dstaddr", env.Null());
        }

        addressArray.Set(addrIndex++, addressObj);
        addr = addr->next;
      }

      deviceObj.Set("addresses", addressArray);
    }
    else
    {
      deviceObj.Set("addresses", Napi::Array::New(env));
    }

    deviceObj.Set("flags", Napi::Number::New(env, dev->flags));
    deviceArray.Set(index++, deviceObj);
    dev = dev->next;
  }
  pcap_freealldevs(alldevs);

  return deviceArray;
}

Napi::Value Sniffer::GetCurDevname(const Napi::CallbackInfo &info)
{
  auto env = info.Env();

  if (curDevname.has_value())
  {
    return Napi::String::New(env, curDevname.value());
  }
  else
  {
    return env.Null();
  }
}

void Sniffer::SetCurDevname(const Napi::CallbackInfo &info)
{
  auto env = info.Env();
  if (info.Length() != 1)
  {
    Napi::TypeError::New(env, "param length must be 1").ThrowAsJavaScriptException();
  }

  auto value = info[0];

  if (!value.IsString())
  {
    Napi::TypeError::New(env, "param must be string").ThrowAsJavaScriptException();
    return;
  }

  curDevname = value.As<Napi::String>().Utf8Value();
}

void Sniffer::startCapture(const Napi::CallbackInfo &info)
{
  if (selfRef.IsEmpty())
  {
    selfRef = Napi::Persistent(info.This().As<Napi::Object>());
  }
  auto env = info.Env();

  if (info.Length() < 1 || !info[0].IsFunction())
  {
    Napi::TypeError::New(env, "callbacl expected").ThrowAsJavaScriptException();
    return;
  }

  if (!curDevname.has_value())
  {
    Napi::Error::New(env, "curDevname is null").ThrowAsJavaScriptException();
    return;
  }

  if (running)
  {
    running = false;
    if (thread && thread->joinable())
    {
      thread->join();
      delete thread;
      thread = nullptr;
    }
    if (handle)
    {
      pcap_close(handle);
      handle = nullptr;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
  }

  handle = pcap_open_live(curDevname->c_str(), 65536, 1, 1000, errbuf);

  if (!handle)
  {
    Napi::Error::New(env, std::string("打开设备失败: ") + errbuf).ThrowAsJavaScriptException();
    return;
  }

  auto callback = info[0].As<Napi::Function>();
  tsfn = Napi::ThreadSafeFunction::New(
      env,
      callback,
      "PacketCapture",
      0,
      1,
      [this](Napi::Env)
      {
        this->running = false;
      });

  running = true;
  thread = new std::thread([this]()
                           { this->captureLoop(); });
}

void Sniffer::captureLoop()
{
  struct pcap_pkthdr *header;
  const u_char *packet;

  while (running)
  {
    int result = pcap_next_ex(handle, &header, &packet);

    if (result == 1)
    {

      int length = header->len;
      u_char *data = new u_char[length];
      memcpy(data, packet, length);

      auto callback = [](Napi::Env env, Napi::Function jsCallback, PacketData *pkt)
      {
        Napi::Object obj = Napi::Object::New(env);
        obj.Set("length", Napi::Number::New(env, pkt->length));
        obj.Set("data", Napi::Buffer<u_char>::Copy(env, pkt->data, pkt->length));

        jsCallback.Call({obj});
        delete[] pkt->data;
        delete pkt;
      };

      PacketData *pkt = new PacketData;
      pkt->length = length;
      pkt->data = data;

      napi_status status = tsfn.BlockingCall(pkt, callback);

      if (status != napi_ok)
      {
        break;
      }
    }
    else if (result == 0)
    {
      std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    else
    {
      std::this_thread::sleep_for(std::chrono::milliseconds(100));
      continue;
    }
  }

  tsfn.Release();
}

void Sniffer::stopCapture(const Napi::CallbackInfo &info)
{
  running = false;

  if (thread && thread->joinable())
  {
    thread->join();
    delete thread;
    thread = nullptr;
  }

  if (handle)
  {
    pcap_close(handle);
    handle = nullptr;
  }
}

Napi::Value Sniffer::GetRunning(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  bool status = running.load();
  return Napi::Boolean::New(env, status);
}

Napi::Object Sniffer::Init(Napi::Env env, Napi::Object exports)
{
  auto func = DefineClass(env, "Sniffer", {StaticMethod("getAllDevs", &Sniffer::getAllDevs), InstanceAccessor("curDevname", &Sniffer::GetCurDevname, nullptr), InstanceMethod("setCurDevname", &Sniffer::SetCurDevname), InstanceMethod("startCapture", &Sniffer::startCapture), InstanceMethod("stopCapture", &Sniffer::stopCapture), InstanceMethod("isRunning", &Sniffer::GetRunning)

                                          });
  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();
  exports.Set("Sniffer", func);
  return exports;
}
