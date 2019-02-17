// Copyright 2019 Stratumn
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { shallow } from "enzyme";
import { Router } from "found";
import React from "react";
import { mocked } from "ts-jest/utils";

import { mockQueryPropAttrs, mockRelayProp } from "../testing/relay";

import { subscribe as subscribeJobMetrics } from "../subscriptions/jobMetricsUpdated";
import { subscribe as subscribeLogMetrics } from "../subscriptions/logMetricsUpdated";
import { subscribe as subscribeProcessMetrics } from "../subscriptions/processMetricsUpdated";

import Menu from "../components/Menu";

import { App } from "./App";

jest.mock("../subscriptions/jobMetricsUpdated");
jest.mock("../subscriptions/logMetricsUpdated");
jest.mock("../subscriptions/processMetricsUpdated");

const props = {
  relay: mockRelayProp(),
  router: new Router(),
  system: {
    ...mockQueryPropAttrs(),
    lastMessageId: "1",
  },
};

beforeEach(() => {
  mocked(props.router.addTransitionHook).mockClear();
  mocked(subscribeJobMetrics).mockClear();
  mocked(subscribeLogMetrics).mockClear();
  mocked(subscribeProcessMetrics).mockClear();
});

describe("<App />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(
      <App {...props}>
        <p>Hello, World!</p>
      </App>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("renders children when passed in", () => {
    const wrapper = shallow(
      <App {...props}>
        <div className="unique" />
      </App>,
    );
    expect(wrapper.contains(<div className="unique" />)).toEqual(true);
  });

  it("shows the sidebar when <Menu /> triggers onShowSidebar", () => {
    const wrapper = shallow(<App {...props} />);
    const menu = wrapper.find(Menu);
    menu.props().onShowSidebar({ ...menu.props() });
    expect(wrapper.find(Menu).props().showSidebar).toBe(true);
  });

  it("hides the sidebar when <Menu /> triggers onHideSidebar", () => {
    const wrapper = shallow(<App {...props} />);
    const menu = wrapper.find(Menu);
    menu.props().onShowSidebar({ ...menu.props() });
    menu.props().onHideSidebar({ ...menu.props() });
    expect(wrapper.find(Menu).props().showSidebar).toBe(false);
  });

  it("hides the sidebar when the location changes", () => {
    const wrapper = shallow(<App {...props} />);
    const menu = wrapper.find(Menu);
    menu.props().onShowSidebar({ ...menu.props() });
    expect(props.router.addTransitionHook).toBeCalledTimes(1);
    const handler = mocked(props.router.addTransitionHook).mock.calls[0][0];
    handler();
    expect(wrapper.find(Menu).props().showSidebar).toBe(false);
  });

  it("subscribes to jobMetricsUpdated", () => {
    shallow(<App {...props} />);
    expect(subscribeJobMetrics).toBeCalledTimes(1);
    expect(subscribeJobMetrics).toBeCalledWith(
      props.relay.environment,
      props.system.lastMessageId,
    );
  });

  it("subscribes to logMetricsUpdated", () => {
    shallow(<App {...props} />);
    expect(subscribeLogMetrics).toBeCalledTimes(1);
    expect(subscribeLogMetrics).toBeCalledWith(
      props.relay.environment,
      props.system.lastMessageId,
    );
  });

  it("subscribes to processMetricsUpdated", () => {
    shallow(<App {...props} />);
    expect(subscribeProcessMetrics).toBeCalledTimes(1);
    expect(subscribeProcessMetrics).toBeCalledWith(
      props.relay.environment,
      props.system.lastMessageId,
    );
  });

  it("unsubscribes after unmouting", () => {
    const dispose = jest.fn();
    const disposable = { dispose };
    const subscribe = () => disposable;

    mocked(subscribeJobMetrics).mockImplementationOnce(subscribe);
    mocked(subscribeLogMetrics).mockImplementationOnce(subscribe);
    mocked(subscribeProcessMetrics).mockImplementationOnce(subscribe);

    const wrapper = shallow(<App {...props} />);
    expect(dispose).toBeCalledTimes(0);
    wrapper.unmount();
    expect(dispose).toBeCalledTimes(3);
  });

});
