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

import { subscribe as subscribeJobMetrics } from "../subscriptions/jobMetricsStored";
import { subscribe as subscribeLogMetrics } from "../subscriptions/logMetricsStored";
import { subscribe as subscribeServiceMetrics } from "../subscriptions/serviceMetricsStored";

import Menu from "../components/Menu";

import { App } from "./App";

jest.mock("../subscriptions/serviceMetricsStored");
jest.mock("../subscriptions/jobMetricsStored");
jest.mock("../subscriptions/logMetricsStored");

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
  mocked(subscribeServiceMetrics).mockClear();
  mocked(subscribeJobMetrics).mockClear();
  mocked(subscribeLogMetrics).mockClear();
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

  it("subscribes to serviceMetricsStored", () => {
    shallow(<App {...props} />);
    expect(subscribeServiceMetrics).toBeCalledTimes(1);
    expect(subscribeServiceMetrics).toBeCalledWith(
      props.relay.environment,
      props.system.lastMessageId,
    );
  });

  it("subscribes to jobMetricsStored", () => {
    shallow(<App {...props} />);
    expect(subscribeJobMetrics).toBeCalledTimes(1);
    expect(subscribeJobMetrics).toBeCalledWith(
      props.relay.environment,
      props.system.lastMessageId,
    );
  });

  it("subscribes to logMetricsStored", () => {
    shallow(<App {...props} />);
    expect(subscribeLogMetrics).toBeCalledTimes(1);
    expect(subscribeLogMetrics).toBeCalledWith(
      props.relay.environment,
      props.system.lastMessageId,
    );
  });

  it("unsubscribes after unmouting", () => {
    const dispose = jest.fn();
    const disposable = { dispose };
    const subscribe = () => disposable;

    mocked(subscribeServiceMetrics).mockImplementationOnce(subscribe);
    mocked(subscribeJobMetrics).mockImplementationOnce(subscribe);
    mocked(subscribeLogMetrics).mockImplementationOnce(subscribe);

    const wrapper = shallow(<App {...props} />);
    expect(dispose).toBeCalledTimes(0);
    wrapper.unmount();
    expect(dispose).toBeCalledTimes(3);
  });

});
