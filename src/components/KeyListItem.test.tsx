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

import { mockQueryPropAttrs } from "../testing/relay";

import { KeyListItem } from "./KeyListItem";

const props = {
  item: {
    ...mockQueryPropAttrs(),
    id: "id",
    name: "name",
    value: "value",
  },
  onDelete: jest.fn(),
  onEdit: jest.fn(),
};

beforeEach(() => {
  mocked(props.onDelete).mockClear();
  mocked(props.onEdit).mockClear();
});

describe("<KeyListItem />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(<KeyListItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("triggers onDelete when the delete button is clicked", () => {
    const wrapper = shallow(<KeyListItem {...props} />);
    wrapper.find("Button[icon='delete']").simulate("click");
    expect(props.onDelete).toBeCalledTimes(1);
    expect(props.onDelete).toBeCalledWith(props);
  });

  it("triggers onEdit when the edit button is clicked", () => {
    const wrapper = shallow(<KeyListItem {...props} />);
    wrapper.find("Button[icon='edit']").simulate("click");
    expect(props.onEdit).toBeCalledTimes(1);
    expect(props.onEdit).toBeCalledWith(props);
  });

});
