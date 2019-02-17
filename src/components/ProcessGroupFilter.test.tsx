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

import ProcessGroupFilter, { allStatus } from "./ProcessGroupFilter";

const props = {
  onChange: jest.fn(),
  status: ["RUNNING", "FAILED"],
};

beforeEach(() => {
  mocked(props.onChange).mockClear();
});

describe("<ProcessGroupFilter />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(<ProcessGroupFilter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("checks all the radio buttons when status isn't set", () => {
    const wrapper = shallow(<ProcessGroupFilter {...props} status={undefined} />);
    expect(wrapper.find("[checked=true]")).toHaveLength(allStatus.length);
  });

  it("triggers onChange when a radio button is unchecked", () => {
    const wrapper = shallow(<ProcessGroupFilter {...props} />);
    wrapper.find("Radio[label='RUNNING']").simulate("click");
    expect(props.onChange).toBeCalledTimes(1);
    expect(props.onChange).toBeCalledWith({
      ...props,
      status: ["FAILED"],
    });
  });

  it("triggers onChange when a radio button is checked", () => {
    const wrapper = shallow(<ProcessGroupFilter {...props} />);
    wrapper.find("Radio[label='DONE']").simulate("click");
    expect(props.onChange).toBeCalledTimes(1);
    expect(props.onChange).toBeCalledWith({
      ...props,
      status: ["RUNNING", "FAILED", "DONE"],
    });
  });

});
