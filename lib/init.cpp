#include <napi.h>
#include "Sniffer.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  Sniffer::Init(env, exports);
  return exports;
}

NODE_API_MODULE(nacap-napi-module, InitAll)