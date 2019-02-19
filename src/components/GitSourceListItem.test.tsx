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

import { GitSourceListItem } from "./GitSourceListItem";

const props = {
  item: {
    ...mockQueryPropAttrs(),
    id: "id",
    reference: "reference",
    repository: "repository",
  },
  onDelete: jest.fn(),
};

beforeEach(() => {
  mocked(props.onDelete).mockClear();
});

describe("<GitSourceListItem />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(<GitSourceListItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("triggers onDelete when the delete button is clicked", () => {
    const wrapper = shallow(<GitSourceListItem {...props} />);
    wrapper.find("Button[icon='delete']").simulate("click");
    expect(props.onDelete).toBeCalledTimes(1);
    expect(props.onDelete).toBeCalledWith(props);
  });

});
