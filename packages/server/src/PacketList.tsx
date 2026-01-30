import React, { useEffect, useRef, useState } from 'react';
import { List } from '@arco-design/web-react';
import { FC } from 'react';

interface Props {
  list: any[];
  running: boolean;
  setState: Function;
}

export const PacketList: FC<Props> = (props) => {
  const { setState, list } = props;

  return (
    <div className="packet-list">
      <List
        style={{ height: '500px' }}
        dataSource={list}
        render={(item, index) => (
          <List.Item
            key={index}
            onClick={() => {
              setState({ packet: item });
            }}
          >
            <div className="packet-list-item">Packet {item.time}</div>
          </List.Item>
        )}
      />
    </div>
  );
};
