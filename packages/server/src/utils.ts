export function getWebSocketUrl(path = '') {
  const protocol = window.location.protocol;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

  const host = window.location.host;
  const url = `${wsProtocol}//${host}${path}`;
  return url;
}


export function formatHexString(hexStr) {
  if (!hexStr) return '';
  
  const result = [];
  
  for (let i = 0; i < hexStr.length; i += 32) {
    const line = hexStr.slice(i, i + 32);
    const bytes = [];
    
    for (let j = 0; j < line.length; j += 2) {
      bytes.push(line.slice(j, j + 2));
    }
    
    result.push(bytes.join(' '));
  }
  
  return result.join('\n');
}