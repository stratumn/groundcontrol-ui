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

import { JobTableRow_item } from "./__generated__/JobTableRow_item.graphql";

import { mockQueryPropAttrs } from "../testing/relay";

import { IProps, JobTableRow } from "./JobTableRow";

const item: JobTableRow_item = {
  ...mockQueryPropAttrs(),
  createdAt: "createdAt",
  id: "id",
  longString: "longString",
  priority: "NORMAL",
  status: "QUEUED",
  updatedAt: "updatedAt"
};

const props = {
  item,
  onStop: jest.fn()
};

beforeEach(() => {
  mocked(props.onStop).mockClear();
});

describe("<JobTableRow />", () => {
  it("renders correctly", () => {
    const wrapper = shallow(<JobTableRow {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("sets the warning attribute of the status cell to true when the job is queued", () => {
    const wrapper = shallow(
      <JobTableRow {...{ ...props, item: { ...item, status: "QUEUED" } }} />
    );
    expect(wrapper.find("[warning=true]")).toHaveLength(1);
  });

  it("sets the positive attribute of the status cell to true when the job is running", () => {
    const wrapper = shallow(
      <JobTableRow {...{ ...props, item: { ...item, status: "RUNNING" } }} />
    );
    expect(wrapper.find("[positive=true]")).toHaveLength(1);
  });

  it("sets the error attribute of the status cell to true when the job failed", () => {
    const wrapper = shallow(
      <JobTableRow {...{ ...props, item: { ...item, status: "FAILED" } }} />
    );
    expect(wrapper.find("[error=true]")).toHaveLength(1);
  });

  it("shows a stop button when the job is queued", () => {
    const wrapper = shallow(
      <JobTableRow {...{ ...props, item: { ...item, status: "QUEUED" } }} />
    );
    expect(wrapper.find("Button[icon='stop']")).toHaveLength(1);
  });

  it("shows a stop button when the job is running", () => {
    const wrapper = shallow(
      <JobTableRow {...{ ...props, item: { ...item, status: "RUNNING" } }} />
    );
    expect(wrapper.find("Button[icon='stop']")).toHaveLength(1);
  });

  it("shows a disabled stop button when the job is stopping", () => {
    const wrapper = shallow(
      <JobTableRow {...{ ...props, item: { ...item, status: "STOPPING" } }} />
    );
    expect(wrapper.find("Button[icon='stop'][loading=true]")).toHaveLength(1);
  });

  it("doesn't show a stop button when the job is done", () => {
    const wrapper = shallow(
      <JobTableRow {...{ ...props, item: { ...item, status: "DONE" } }} />
    );
    expect(wrapper.find("Button[icon='stop']")).toHaveLength(0);
  });

  it("doesn't show a stop button when the job failed", () => {
    const wrapper = shallow(
      <JobTableRow {...{ ...props, item: { ...item, status: "FAILED" } }} />
    );
    expect(wrapper.find("Button[icon='stop']")).toHaveLength(0);
  });

  it("triggers onStop when the stop button is clicked", () => {
    const runningProps: IProps = {
      ...props,
      item: { ...item, status: "RUNNING" }
    };
    const wrapper = shallow(<JobTableRow {...runningProps} />);
    wrapper.find("Button[icon='stop']").simulate("click");
    expect(props.onStop).toBeCalledTimes(1);
    expect(props.onStop).toBeCalledWith(runningProps);
  });

  it("doesn't triggers onStop when the stop button is clicked and the status is stopping", () => {
    const stoppingProps: IProps = {
      ...props,
      item: { ...item, status: "STOPPING" }
    };
    const wrapper = shallow(<JobTableRow {...stoppingProps} />);
    wrapper.find("Button[icon='stop']").simulate("click");
    expect(props.onStop).not.toBeCalled();
  });
});
