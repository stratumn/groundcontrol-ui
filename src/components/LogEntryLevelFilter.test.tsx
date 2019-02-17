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

import LogEntryLevelFilter, { allLevel } from "./LogEntryLevelFilter";

const props = {
  level: ["INFO", "WARNING"],
  onChange: jest.fn(),
};

beforeEach(() => {
  mocked(props.onChange).mockClear();
});

describe("<LogEntryLevelFilter />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(<LogEntryLevelFilter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("checks all the radio buttons when level isn't set", () => {
    const wrapper = shallow(<LogEntryLevelFilter {...props} level={undefined} />);
    expect(wrapper.find("[checked=true]")).toHaveLength(allLevel.length);
  });

  it("triggers onChange when a radio button is unchecked", () => {
    const wrapper = shallow(<LogEntryLevelFilter {...props} />);
    wrapper.find("Radio[label='INFO']").simulate("click");
    expect(props.onChange).toBeCalledTimes(1);
    expect(props.onChange).toBeCalledWith({
      ...props,
      level: ["WARNING"],
    });
  });

  it("triggers onChange when a radio button is checked", () => {
    const wrapper = shallow(<LogEntryLevelFilter {...props} />);
    wrapper.find("Radio[label='DEBUG']").simulate("click");
    expect(props.onChange).toBeCalledTimes(1);
    expect(props.onChange).toBeCalledWith({
      ...props,
      level: ["INFO", "WARNING", "DEBUG"],
    });
  });

});
