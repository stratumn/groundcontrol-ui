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
import React from "react";
import { mocked } from "ts-jest/utils";

import { ProcessGroupCard_item } from "./__generated__/ProcessGroupCard_item.graphql";

import { mockQueryPropAttrs } from "../testing/relay";

import { IProps, ProcessGroupCard } from "./ProcessGroupCard";

const item: ProcessGroupCard_item = {
  ...mockQueryPropAttrs(),
  createdAt: "createdAt",
  id: "id",
  processes: {
    edges: [{
      node: {
        ...mockQueryPropAttrs(),
      },
    }, {
      node: {
        ...mockQueryPropAttrs(),
      },
    }],
  },
  status: "RUNNING",
  task: {
    name: "taskName",
    workspace: {
      name: "workspaceName",
      slug: "workspaceSlug",
    },
  },
};

const props = {
  item,
  onStartGroup: jest.fn(),
  onStartProcess: jest.fn(),
  onStopGroup: jest.fn(),
  onStopProcess: jest.fn(),
};

beforeEach(() => {
  mocked(props.onStartGroup).mockClear();
  mocked(props.onStopGroup).mockClear();
});

describe("<ProcessGroupCard />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(<ProcessGroupCard {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("show a stop group button if the process group is running", () => {
    const wrapper = shallow(
      <ProcessGroupCard
        {...{...props, item: { ...item, status: "RUNNING" } }}
      />,
    );
    expect(wrapper.find("Button[icon='stop']")).toHaveLength(1);
  });

  it("show a start group button if the process group is done", () => {
    const wrapper = shallow(
      <ProcessGroupCard
        {...{...props, item: { ...item, status: "DONE" } }}
      />,
    );
    expect(wrapper.find("Button[icon='play']")).toHaveLength(1);
  });

  it("show a start group button if the process group failed", () => {
    const wrapper = shallow(
      <ProcessGroupCard
        {...{...props, item: { ...item, status: "FAILED" } }}
      />,
    );
    expect(wrapper.find("Button[icon='play']")).toHaveLength(1);
  });

  it("triggers onStopGroup when the stop group button is clicked", () => {
    const wrapper = shallow(
      <ProcessGroupCard
        {...{...props, item: { ...item, status: "RUNNING" } }}
      />,
    );
    wrapper.find("Button[icon='stop']").simulate("click");
    expect(props.onStopGroup).toBeCalledTimes(1);
    expect(props.onStopGroup).toBeCalledWith(props);
  });

  it("triggers onStartGroup when the start group button is clicked", () => {
    const doneProps: IProps = {...props, item: { ...item, status: "DONE" } };
    const wrapper = shallow(<ProcessGroupCard {...doneProps} />);
    wrapper.find("Button[icon='play']").simulate("click");
    expect(doneProps.onStartGroup).toBeCalledTimes(1);
    expect(doneProps.onStartGroup).toBeCalledWith(doneProps);
  });

});
