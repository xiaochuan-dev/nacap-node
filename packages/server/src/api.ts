export async function getalldevs() {
  const req = await fetch('/getalldevs');
  const res = await req.json();
  return res;
}

export async function setdev(devname: string) {
  const req = await fetch(`/setdev?devname=${devname}`);
  const res = await req.json();
  return res?.success;
}

export async function start() {
  const req = await fetch(`/start`);
  const res = await req.json();
  return res?.success;
}

export async function stop() {
  const req = await fetch(`/stop`);
  const res = await req.json();
  return res?.success;
}
