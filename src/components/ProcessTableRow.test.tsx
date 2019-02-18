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

import { ProcessTableRow_item } from "./__generated__/ProcessTableRow_item.graphql";

import { mockQueryPropAttrs } from "../testing/relay";

import { IProps, ProcessTableRow } from "./ProcessTableRow";

jest.mock("./RepositoryShortName", () => "RepositoryShortName");

const item: ProcessTableRow_item = {
  ...mockQueryPropAttrs(),
  command: "command",
  id: "id",
  project: {
    repository: "repository",
  },
  status: "RUNNING",
};

const props = {
  item,
  onStartProcess: jest.fn(),
  onStopProcess: jest.fn(),
};

beforeEach(() => {
  mocked(props.onStartProcess).mockClear();
  mocked(props.onStopProcess).mockClear();
});

describe("<ProcessTableRow />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(<ProcessTableRow {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("shows a stop button if the process is running", () => {
    const wrapper = shallow(
      <ProcessTableRow
        {...{...props, item: { ...item, status: "RUNNING" } }}
      />,
    );
    expect(wrapper.find("Button[icon='stop']")).toHaveLength(1);
  });

  it("shows a start button if the process is done", () => {
    const wrapper = shallow(
      <ProcessTableRow
        {...{...props, item: { ...item, status: "DONE" } }}
      />,
    );
    expect(wrapper.find("Button[icon='play']")).toHaveLength(1);
  });

  it("shows a start button if the process failed", () => {
    const wrapper = shallow(
      <ProcessTableRow
        {...{...props, item: { ...item, status: "FAILED" } }}
      />,
    );
    expect(wrapper.find("Button[icon='play']")).toHaveLength(1);
  });

  it("shows a disabled stop button if the process is stopping", () => {
    const wrapper = shallow(
      <ProcessTableRow
        {...{...props, item: { ...item, status: "STOPPING" } }}
      />,
    );
    expect(wrapper.find("Button[icon='stop'][disabled=true]")).toHaveLength(1);
  });

  it("triggers onStopProcess when the stop button is clicked", () => {
    const wrapper = shallow(
      <ProcessTableRow
        {...{...props, item: { ...item, status: "RUNNING" } }}
      />,
    );
    wrapper.find("Button[icon='stop']").simulate("click");
    expect(props.onStopProcess).toBeCalledTimes(1);
    expect(props.onStopProcess).toBeCalledWith(props);
  });

  it("triggers onStartProcess when the process button is clicked", () => {
    const doneProps: IProps = {...props, item: { ...item, status: "DONE" } };
    const wrapper = shallow(<ProcessTableRow {...doneProps} />);
    wrapper.find("Button[icon='play']").simulate("click");
    expect(doneProps.onStartProcess).toBeCalledTimes(1);
    expect(doneProps.onStartProcess).toBeCalledWith(doneProps);
  });

});
