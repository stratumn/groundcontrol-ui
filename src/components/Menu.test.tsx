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

import { Menu } from "./Menu";

const props = {
  onHideSidebar: jest.fn(),
  onShowSidebar: jest.fn(),
  showSidebar: true,
  system: {
    ...mockQueryPropAttrs(),
    jobMetrics: {
      ...mockQueryPropAttrs(),
    },
    logMetrics: {
      ...mockQueryPropAttrs(),
    },
    processMetrics: {
      ...mockQueryPropAttrs(),
    },
    serviceMetrics: {
      ...mockQueryPropAttrs(),
    },
  },
};

describe("<Menu />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(<Menu {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});
