import React, { useEffect, useState } from 'react';
import { Select, Message, Empty, Descriptions } from '@arco-design/web-react';
import { FC } from 'react';
import { getalldevs, setdev } from './api';

interface Props {
  devname?: string;
  setState: Function;
}

export const DevSelect: FC<Props> = (props) => {
  const { setState, devname } = props;

  const [alldevs, setAllDevs] = useState([]);

  useEffect(() => {
    getalldevs().then((res) => {
      setAllDevs(res);
    });
  }, []);

  const dev = alldevs.find((v) => v.name === devname);
  const descriptions = [
    {
      label: '网卡',
      value: dev?.name,
    },
    {
      label: '简介',
      value: dev?.description,
    },
  ];

  return (
    <div className="dev">
      <Select
        style={{ width: '300px', margin: '0 auto' }}
        value={devname}
        placeholder="选择网卡"
        onChange={(newValue) => {
          setState({
            devname: newValue,
          });
          setdev(newValue).then((res) => {
            if (!res) {
              Message.info('选择网卡失败');
            }
          });
        }}
      >
        {alldevs.map(({ name }) => (
          <Select.Option value={name}>{name}</Select.Option>
        ))}
      </Select>
      {!!devname ? (
        <Descriptions
          column={1}
          title="网卡信息"
          data={descriptions}
          style={{ margin: '20px 30px'}}
          labelStyle={{ paddingRight: 36 }}
        />
      ) : (
        <Empty />
      )}
    </div>
  );
};
