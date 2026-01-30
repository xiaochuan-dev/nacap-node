import React, { useCallback, useEffect, useReducer } from 'react';
import { getWebSocketUrl } from './utils';
import { start, stop } from './api';
import { Grid, Button, Message } from '@arco-design/web-react';
import { IconPlayCircle, IconPauseCircle } from '@arco-design/web-react/icon';
import { DevSelect } from './DevSelect';
import { PacketList } from './PacketList';
import { Packet } from './Packet';

function App() {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'set': {
          return { ...state, ...action.payload };
        }

        case 'addListItem': {
          const newItem = action.payload.item;
          state.list.unshift(newItem);
          return {
            ...state,
            list: state.list,
          };
        }
        default:
          throw new Error('Unknown action type');
      }
    },
    {
      devname: '',
      running: false,
      list: [],
      packet: null,
    },
  );

  const setState = useCallback((payload) => {
    dispatch({ type: 'set', payload });
  }, []);

  const { devname, running, list, packet } = state;

  useEffect(() => {
    const wsurl = getWebSocketUrl();
    const ws = new WebSocket(wsurl);

    ws.onopen = () => {
      console.log('连接成功');
    };

    ws.onmessage = (e) => {
      const obj = JSON.parse(e.data);

      dispatch({
        type: 'addListItem',
        payload: {
          item: obj,
        },
      });
    };

    ws.onclose = () => {
      console.log('连接断开');
    };
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="app">
      <Grid.Row style={{ height: '100%' }}>
        <Grid.Col span={8} style={{ height: '100%' }}>
          <div className='left'>
            <div className="t-left">
              <DevSelect devname={devname} setState={setState} />
              <Button
                style={{ marginTop: '20px' }}
                shape="circle"
                type="primary"
                status={running ? 'warning' : 'default'}
                icon={running ? <IconPauseCircle /> : <IconPlayCircle />}
                size="large"
                onClick={() => {
                  if (!devname) {
                    Message.info('请选择网口');
                    return;
                  }

                  if (!running) {
                    start().then((res) => {
                      if (res) {
                        setState({
                          running: true,
                        });
                      } else {
                        Message.info('开始捕获失败');
                      }
                    });
                  } else {
                    stop().then((res) => {
                      if (res) {
                        setState({
                          running: false,
                        });
                      } else {
                        Message.info('停止捕获失败');
                      }
                    });
                  }
                }}
              />
            </div>
            <PacketList running={running} setState={setState} list={list} />
          </div>
        </Grid.Col>
        <Grid.Col span={16}>
          <div>
            <Packet packet={packet} />
          </div>
        </Grid.Col>
      </Grid.Row>
    </div>
  );
}

export default <App />;
