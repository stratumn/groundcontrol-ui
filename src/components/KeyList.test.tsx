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

import { mockQueryPropAttrs } from "../testing/relay";

import { KeyList } from "./KeyList";

const props = {
  items: [
    {
      ...mockQueryPropAttrs(),
      id: "id1",
      name: "name1",
      value: "value1"
    },
    {
      ...mockQueryPropAttrs(),
      id: "id2",
      name: "name2",
      value: "value2"
    }
  ],
  onDelete: jest.fn(),
  onEdit: jest.fn()
};

describe("<KeyList />", () => {
  it("renders items correctly", () => {
    const wrapper = shallow(<KeyList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("renders correctly without items", () => {
    const wrapper = shallow(<KeyList {...props} items={[]} />);
    expect(wrapper).toMatchSnapshot();
  });
});
