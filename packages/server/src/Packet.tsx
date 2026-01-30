import React, { useEffect, useRef, useState } from 'react';
import { List } from '@arco-design/web-react';
import { FC } from 'react';
import { formatHexString } from './utils';

interface Props {
  packet: any;
}

export const Packet: FC<Props> = (props) => {
  const { packet } = props;

  if (!packet) {
    return null;
  }
  const { hex } = packet;

  const formatHex = formatHexString(hex);

  return (
    <div className="packet">
      <div className='packet-header'>packet</div>
      
      <div className='packet-hex'>
        <div className='packet-hex-text' dangerouslySetInnerHTML={{ __html: formatHex }} />
      </div>
    </div>
  );
};
