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

import { LogEntryOwnerFilter } from "./LogEntryOwnerFilter";

const props = {
  items: [{
    ...mockQueryPropAttrs(),
    id: "id1",
    slug: "projectSlug1",
    workspace: {
      slug: "workspaceSlug1",
    },
  }, {
    ...mockQueryPropAttrs(),
    id: "id2",
    slug: "projectSlug2",
    workspace: {
      slug: "workspaceSlug2",
    },
  }],
  onChange: jest.fn(),
  ownerId: "id2",
};

beforeEach(() => {
  mocked(props.onChange).mockClear();
});

describe("<LogEntryOwnerFilter />", () => {

  it("renders items correctly", () => {
    const wrapper = shallow(<LogEntryOwnerFilter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("triggers onChange the dropdown value is changed", () => {
    const wrapper = shallow(<LogEntryOwnerFilter {...props} />);
    wrapper.find("Dropdown").simulate("change", null, { value: "id1" });
    expect(props.onChange).toBeCalledTimes(1);
    expect(props.onChange).toBeCalledWith({...props, ownerId: "id1"});
  });

});
